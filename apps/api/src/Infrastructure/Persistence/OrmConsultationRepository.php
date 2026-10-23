<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Consultation\ConsultationRepository;
use App\Application\Consultation\ConsultationEditInput;
use App\Application\Exception\ConsultationClosed;
use App\Application\Exception\ConsultationEditConflict;
use App\Application\Exception\ConsultationRemovalConfirmationRequired;
use App\Application\Exception\EventConflict;
use App\Application\Exception\TeamNotFound;
use App\Application\Exception\InvalidConsultationInput;
use App\Domain\Consultation\TextConsultationRules;
use App\Domain\Consultation\DateConsultationRules;
use App\Infrastructure\Persistence\Entity\ConsultationOptionRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\ConsultationVoteRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use App\Infrastructure\Persistence\Entity\TeamEventRecord;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
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

    public function edit(string $teamId, string $consultationId, ConsultationEditInput $input, string $at, string $activityAt): bool
    {
        $manager = $this->manager();
        // The team lock is held: reload options/votes after acquiring it, even
        // when the caller previously read them through the same entity manager.
        $manager->clear();
        [$consultation, $participant] = $this->actors($teamId, $consultationId, $input->participantId);
        if ($consultation->state() !== 'open') {
            throw new ConsultationClosed();
        }
        $item = $consultation->toItem();
        $isDate = $item['type'] === 'date';
        $valueKey = $isDate ? 'date' : 'text';
        if (($isDate && $input->update !== []) || count(array_filter($input->add, static fn(array $entry): bool => !isset($entry[$valueKey]))) > 0) {
            throw new InvalidConsultationInput(['optionChanges']);
        }
        $timeZone = $input->timeZone ?? $consultation->team()->toRow()['time_zone'];
        /** @var array<string, ConsultationOptionRecord> $records */
        $records = [];
        /** @var array<string, string> $original */
        $original = [];
        foreach ($consultation->options() as $option) {
            $value = $option->toItem();
            $records[$value['id']] = $option;
            $original[$value['id']] = $value[$valueKey] ?? throw new \LogicException('An option must contain its typed value.');
        }
        $votes = $manager->getRepository(ConsultationVoteRecord::class)->findBy(['consultation' => $consultation]);
        $counts = [];
        foreach ($votes as $vote) {
            foreach ($vote->options() as $option) {
                $id = $option->toItem()['id'];
                $counts[$id] = ($counts[$id] ?? 0) + 1;
            }
        }
        $result = $original;
        $additions = [];
        foreach ($input->add as $entry) {
            $id = $entry['id'];
            $value = $entry[$valueKey];
            if (isset($original[$id])) {
                if ($original[$id] !== $value) {
                    throw new ConsultationEditConflict($this->detail($teamId, $consultationId) ?? []);
                }
                continue;
            }
            if ($manager->find(ConsultationOptionRecord::class, $id) !== null) {
                throw new InvalidConsultationInput(['optionChanges.add']);
            }
            $additions[$id] = $value;
        }
        foreach ($input->update as $entry) {
            $id = $entry['id'];
            if (!isset($original[$id]) || (($counts[$id] ?? 0) > 0 && $original[$id] !== $entry['text'])) {
                throw new ConsultationEditConflict($this->detail($teamId, $consultationId) ?? []);
            }
            $result[$id] = $entry['text'];
        }
        $removed = [];
        $needsConfirmation = [];
        foreach ($input->remove as $id) {
            if (!isset($records[$id])) {
                continue;
            }
            $removed[$id] = $records[$id];
            unset($result[$id]);
            if (($counts[$id] ?? 0) > 0 && !in_array($id, $input->confirmedRemovalOptionIds, true)) {
                $needsConfirmation[] = ['id' => $id, $valueKey => $original[$id], 'count' => $counts[$id]];
            }
        }
        $result += $additions;
        $title = $input->title ?? (string) $item['title'];
        $violations = $isDate
            ? DateConsultationRules::violations($title, array_values($result), $timeZone)
            : TextConsultationRules::violations($title, array_values($result));
        if ($isDate) {
            $today = new DateTimeImmutable($at)->setTimezone(new \DateTimeZone($timeZone))->format('Y-m-d');
            foreach ($result as $id => $date) {
                if (isset($additions[$id]) && $date < $today) {
                    $violations[] = 'options.' . $id;
                }
            }
        }
        if ($violations !== []) {
            $optionIds = array_keys($result);
            $paths = array_map(static function (string $path) use ($optionIds): string {
                if (preg_match('/^options\.(\d+)$/', $path, $match) === 1) {
                    return 'options.' . $optionIds[(int) $match[1]];
                }
                return $path;
            }, $violations);
            throw new InvalidConsultationInput($paths);
        }
        if ($needsConfirmation !== []) {
            throw new ConsultationRemovalConfirmationRequired($needsConfirmation);
        }
        if ($result === $original && $title === $item['title']) {
            return false;
        }
        if ($result !== $original) {
            foreach ($votes as $vote) {
                $changed = false;
                foreach ($removed as $option) {
                    if ($vote->hasOption($option)) {
                        $vote->setOption($option, false);
                        $changed = true;
                    }
                }
                if ($changed && $vote->isEmpty()) {
                    $manager->remove($vote);
                }
            }
            foreach ($removed as $option) {
                $consultation->removeOption($option);
                $manager->remove($option);
            }
            // Vacate positive positions before compaction/insertion. Both
            // flushes belong to the surrounding transaction and roll back together.
            $temporary = -1;
            foreach ($consultation->options() as $option) {
                $option->setPosition($temporary--);
            }
            $manager->flush();
            $position = 0;
            foreach ($result as $id => $value) {
                if (isset($records[$id])) {
                    if (!$isDate) {
                        $records[$id]->editText($value);
                    }
                    $records[$id]->setPosition($position);
                } else {
                    $option = new ConsultationOptionRecord($id, $consultation, $isDate ? null : $value, $isDate ? new DateTimeImmutable($value, new \DateTimeZone('UTC')) : null, $position);
                    $consultation->addOption($option);
                    $manager->persist($option);
                }
                ++$position;
            }
        }
        $consultation->recordEdit($title, $participant, new DateTimeImmutable($at));
        $consultation->team()->setLastActivityAt(new DateTimeImmutable($activityAt));
        try {
            $manager->flush();
        } catch (UniqueConstraintViolationException $error) {
            if (str_contains($error->getMessage(), 'consultation_option_pkey')) {
                throw new InvalidConsultationInput(['optionChanges.add']);
            }
            throw $error;
        }
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
