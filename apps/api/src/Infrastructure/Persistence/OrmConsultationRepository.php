<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Consultation\ConsultationRepository;
use App\Infrastructure\Persistence\Entity\ConsultationOptionRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

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

    private function manager(): EntityManagerInterface
    {
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }

        return $manager;
    }
}
