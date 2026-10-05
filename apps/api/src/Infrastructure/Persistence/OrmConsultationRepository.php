<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Consultation\ConsultationRepository;
use App\Application\Exception\ConsultationClosed;
use App\Application\Exception\TeamNotFound;
use App\Infrastructure\Persistence\Entity\ConsultationOptionRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\ConsultationVoteRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
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
    public function create(string $teamId, string $participantId, string $title, string $type, array $options, string $createdAt, string $activityAt): array
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
        $team->setLastActivityAt(new DateTimeImmutable($activityAt));
        $record = new ConsultationRecord(
            \Symfony\Component\Uid\Uuid::v7()->toRfc4122(),
            $team,
            $participant,
            $type,
            $title,
            'open',
            new DateTimeImmutable($createdAt),
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

    public function resolve(string $teamId, string $consultationId, string $participantId, string $state, array $acceptedOptionIds, string $resolvedAt, string $activityAt): bool
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
            if ($consultation->resolutionMatches($state, $participant, $acceptedOptionIds)) {
                return false;
            }
            throw new ConsultationClosed();
        }
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
