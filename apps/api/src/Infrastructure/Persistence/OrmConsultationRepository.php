<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Consultation\ConsultationRepository;
use App\Application\Exception\ConsultationClosed;
use App\Application\Exception\EventConflict;
use App\Application\Exception\TeamNotFound;
use App\Application\Exception\InvalidConsultationInput;
use App\Infrastructure\Persistence\Entity\ConsultationOptionRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\ConsultationVoteRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use App\Infrastructure\Persistence\Entity\TeamEventRecord;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\Uuid;

final readonly class OrmConsultationRepository implements ConsultationRepository
{
    public function __construct(private ManagerRegistry $managers) {}

    /** @return array{open: list<array<string, mixed>>, resolved: list<array<string, mixed>>, rejected: list<array<string, mixed>>} */
    public function listForTeam(string $teamId): array
    {
        $records = $this->manager()->createQueryBuilder()
            ->select('consultation', 'option')
            ->addSelect('creator')
            ->from(ConsultationRecord::class, 'consultation')
            ->leftJoin('consultation.options', 'option')
            ->join('consultation.createdBy', 'creator')
            ->where('IDENTITY(consultation.team) = :team')
            ->setParameter('team', $teamId)
            ->orderBy('consultation.createdAt', 'DESC')
            ->addOrderBy('consultation.id', 'DESC')
            ->addOrderBy('option.position', 'ASC')
            ->getQuery()
            ->getResult();

        $open = [];
        $resolved = [];
        $rejected = [];
        foreach ($records as $record) {
            if (!$record instanceof ConsultationRecord) {
                continue;
            }
            $item = $record->toItem();
            match ($item['state']) {
                'open' => $open[] = $item,
                'resolved' => $resolved[] = $item,
                'rejected' => $rejected[] = $item,
                default => null,
            };
        }

        return ['open' => $open, 'resolved' => $resolved, 'rejected' => $rejected];
    }

    /**
     * @param list<string> $options
     * @return array<string, mixed>
     */
    public function create(string $teamId, string $participantId, string $title, string $type, array $options, ?string $eventId, string $createdAt, string $activityAt): array
    {
        $manager = $this->manager();
        $team = $manager->find(TeamRecord::class, $teamId);
        if (!$team instanceof TeamRecord) {
            throw new \LogicException('The locked team must still exist.');
        }
        $participant = $manager->find(ParticipantRecord::class, $participantId);
        if (!$participant instanceof ParticipantRecord || $participant->team() !== $team) {
            throw new \LogicException('The consultation creator must belong to the locked team.');
        }
        $event = null;
        if ($eventId !== null) {
            $event = $this->eligibleEvent($team, $eventId);
        }
        $team->setLastActivityAt(new DateTimeImmutable($activityAt));
        $record = new ConsultationRecord(
            \Symfony\Component\Uid\Uuid::v7()->toRfc4122(),
            $team,
            $participant,
            $type,
            $title,
            'open',
            new DateTimeImmutable($createdAt),
            $event,
        );
        foreach ($options as $position => $value) {
            $option = $type === 'date'
                ? ConsultationOptionRecord::createDate($record, new DateTimeImmutable($value, new \DateTimeZone('UTC')), $position)
                : ConsultationOptionRecord::create($record, $value, $position);
            $record->addOption($option);
        }
        $manager->persist($record);

        return $record->toItem();
    }

    private function hasOpenEventConsultation(TeamEventRecord $event): bool
    {
        return $this->manager()->getRepository(ConsultationRecord::class)->count(['event' => $event, 'state' => 'open']) > 0;
    }

    private function eligibleEvent(TeamRecord $team, string $eventId): TeamEventRecord
    {
        $event = $this->manager()->find(TeamEventRecord::class, $eventId);
        if (!$event instanceof TeamEventRecord || $event->team() !== $team) {
            throw new TeamNotFound();
        }
        if ($event->status() !== 'provisional' || $this->hasOpenEventConsultation($event)) {
            throw new EventConflict();
        }

        return $event;
    }

    public function setEvent(string $teamId, string $consultationId, ?string $eventId, string $activityAt): bool
    {
        $manager = $this->manager();
        $consultation = $manager->find(ConsultationRecord::class, $consultationId);
        if (!$consultation instanceof ConsultationRecord || $consultation->team()->toRow()['id'] !== $teamId) {
            throw new TeamNotFound();
        }
        if ($consultation->state() !== 'open') {
            throw new ConsultationClosed();
        }
        if ($consultation->toItem()['type'] !== 'date') {
            throw new InvalidConsultationInput(['eventId']);
        }
        if (($consultation->event()?->toSummary()['id'] ?? null) === $eventId) {
            return false;
        }
        $event = null;
        if ($eventId !== null) {
            $event = $this->eligibleEvent($consultation->team(), $eventId);
        }
        $consultation->setEvent($event);
        $consultation->team()->setLastActivityAt(new DateTimeImmutable($activityAt));
        $manager->flush();

        return true;
    }

    /** @return array<string, mixed>|null */
    public function detail(string $teamId, string $consultationId): ?array
    {
        $manager = $this->manager();
        $consultation = $manager->find(ConsultationRecord::class, $consultationId);
        if (!$consultation instanceof ConsultationRecord || $consultation->team()->toRow()['id'] !== $teamId) {
            return null;
        }
        $item = $consultation->toItem();
        $votes = $manager->getRepository(ConsultationVoteRecord::class)->findBy(['consultation' => $consultation]);
        $voters = [];
        foreach ($votes as $vote) {
            foreach ($vote->options() as $option) {
                $voters[$option->toItem()['id']][] = $vote->participant()->toListItem();
            }
        }
        foreach ($item['options'] as &$option) {
            $option['voters'] = $voters[$option['id']] ?? [];
            usort($option['voters'], static fn(array $a, array $b): int => [$a['name'], $a['id']] <=> [$b['name'], $b['id']]);
            $option['count'] = count($option['voters']);
        }
        unset($option);

        return $item;
    }

    public function setVote(string $teamId, string $consultationId, string $participantId, string $optionId, bool $selected, string $activityAt): bool
    {
        $manager = $this->manager();
        [$consultation, $participant] = $this->actors($teamId, $consultationId, $participantId);
        $option = $manager->find(ConsultationOptionRecord::class, $optionId);
        if (!$option instanceof ConsultationOptionRecord || $option->consultation() !== $consultation) {
            throw new TeamNotFound();
        }
        if ($consultation->state() !== 'open') {
            throw new ConsultationClosed();
        }
        $vote = $manager->getRepository(ConsultationVoteRecord::class)->findOneBy(['consultation' => $consultation, 'participant' => $participant]);
        if ($vote === null && !$selected) {
            return false;
        }
        if ($vote === null) {
            $vote = new ConsultationVoteRecord(Uuid::v7()->toRfc4122(), $consultation, $participant);
            $manager->persist($vote);
        } elseif ($vote->hasOption($option) === $selected) {
            return false;
        }
        $vote->setOption($option, $selected);
        if ($vote->isEmpty()) {
            $manager->remove($vote);
        }
        $consultation->team()->setLastActivityAt(new DateTimeImmutable($activityAt));
        $manager->flush();

        return true;
    }

    public function resolve(string $teamId, string $consultationId, string $participantId, string $state, array $acceptedOptionIds, string $resolvedAt, string $activityAt, bool $changeEvent = false, ?string $eventId = null, ?int $expectedEventVersion = null): bool
    {
        $manager = $this->manager();
        [$consultation, $participant] = $this->actors($teamId, $consultationId, $participantId);
        $acceptedOptions = [];
        foreach ($acceptedOptionIds as $optionId) {
            $option = $manager->find(ConsultationOptionRecord::class, $optionId);
            if (!$option instanceof ConsultationOptionRecord || $option->consultation() !== $consultation) {
                throw new TeamNotFound();
            }
            $acceptedOptions[] = $option;
        }
        if ($consultation->state() !== 'open') {
            if ($consultation->resolutionMatches($state, $participant, $acceptedOptionIds) && (!$changeEvent || ($consultation->event()?->toSummary()['id'] ?? null) === $eventId)) {
                return false;
            }
            throw new ConsultationClosed();
        }
        $event = $consultation->event();
        $wasRejected = $event?->status() === 'rejected';
        if ($changeEvent) {
            if ($consultation->toItem()['type'] !== 'date') {
                throw new InvalidConsultationInput(['eventId']);
            }
            if (($event?->toSummary()['id'] ?? null) !== $eventId) {
                $event = $eventId === null ? null : $this->eligibleEvent($consultation->team(), $eventId);
            }
        }
        if ($state === 'resolved' && ($event !== null || $wasRejected) && count($acceptedOptions) !== 1) {
            throw new InvalidConsultationInput(['acceptedOptionIds']);
        }
        if ($wasRejected && (($state === 'resolved' && (!$changeEvent || $eventId !== null)) || ($state === 'rejected' && $event !== $consultation->event()))) {
            throw new EventConflict();
        }
        if ($state === 'resolved') {
            if ($expectedEventVersion !== null && ($event === null || $event->toSummary()['version'] !== $expectedEventVersion)) {
                throw new EventConflict();
            }
            if ($event?->status() === 'definitive' && $expectedEventVersion === null) {
                throw new EventConflict();
            }
        }
        if ($event !== null && $state === 'resolved' && $event->status() === 'provisional') {
            $date = $acceptedOptions[0]->date();
            if ($date === null) {
                throw new InvalidConsultationInput(['acceptedOptionIds']);
            }
            $event->finalize($date, $participant, new DateTimeImmutable($resolvedAt));
        }
        $consultation->setEvent($event);
        $consultation->resolve($state, $participant, new DateTimeImmutable($resolvedAt), $acceptedOptions);
        $consultation->team()->setLastActivityAt(new DateTimeImmutable($activityAt));
        $manager->flush();

        return true;
    }

    /** @return array{ConsultationRecord, ParticipantRecord} */
    private function actors(string $teamId, string $consultationId, string $participantId): array
    {
        $manager = $this->manager();
        $consultation = $manager->find(ConsultationRecord::class, $consultationId);
        $participant = $manager->find(ParticipantRecord::class, $participantId);
        if (!$consultation instanceof ConsultationRecord || $consultation->team()->toRow()['id'] !== $teamId || !$participant instanceof ParticipantRecord || $participant->team() !== $consultation->team()) {
            throw new TeamNotFound();
        }

        return [$consultation, $participant];
    }

    private function manager(): EntityManagerInterface
    {
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }

        return $manager;
    }
}
