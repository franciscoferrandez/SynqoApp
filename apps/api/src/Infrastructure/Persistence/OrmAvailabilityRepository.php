<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Availability\AvailabilityRepository;
use App\Infrastructure\Persistence\Entity\AvailabilityRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmAvailabilityRepository implements AvailabilityRepository
{
    public function __construct(private ManagerRegistry $managers) {}

    public function marks(string $teamId, string $from, string $to): array
    {
        $rows = $this->manager()->createQueryBuilder()->select('mark', 'person')->from(AvailabilityRecord::class, 'mark')->join('mark.participant', 'person')->where('IDENTITY(mark.team) = :team')->andWhere('mark.date BETWEEN :from AND :to')->setParameter('team', $teamId)->setParameter('from', $from)->setParameter('to', $to)->orderBy('person.createdAt', 'ASC')->addOrderBy('person.id', 'ASC')->getQuery()->getResult();
        return array_map(static fn(AvailabilityRecord $mark): array => $mark->toMark(), $rows);
    }

    public function save(string $teamId, string $participantId, string $date, ?string $state, string $activity): bool
    {
        $manager = $this->manager();
        $team = $manager->find(TeamRecord::class, $teamId);
        $person = $manager->find(ParticipantRecord::class, $participantId);
        if (!$team instanceof TeamRecord || !$person instanceof ParticipantRecord || $person->team() !== $team) {
            throw new \LogicException('The authorized participant must belong to the team.');
        }
        $day = new DateTimeImmutable($date);
        $mark = $manager->getRepository(AvailabilityRecord::class)->findOneBy(['team' => $teamId, 'participant' => $participantId, 'date' => $day]);
        if ($mark?->state() === $state) {
            return false;
        }
        if ($state === null && $mark !== null) {
            $manager->remove($mark);
        } elseif ($mark !== null) {
            $mark->setState($state);
        } else {
            $manager->persist(new AvailabilityRecord($team, $person, $day, $state));
        }
        $team->setLastActivityAt(new DateTimeImmutable($activity));
        // Flush within the locked team's transaction, including last activity.
        $manager->flush();
        return true;
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
