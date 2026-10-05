<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Team\TeamCleanupRepository;
use App\Domain\Team\TeamDeletionPolicy;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmTeamCleanupRepository implements TeamCleanupRepository
{
    public function __construct(private ManagerRegistry $managers) {}

    public function deleteEligible(DateTimeImmutable $now, TeamDeletionPolicy $policy): int
    {
        $manager = $this->manager();
        $deleted = 0;
        // Snapshot IDs only: every candidate is refreshed under the same row lock as writes.
        /** @var list<array{id: string}> $candidates */
        $candidates = $manager->createQueryBuilder()
            ->select('team.id')
            ->from(TeamRecord::class, 'team')
            ->orderBy('team.id', 'ASC')
            ->getQuery()
            ->getScalarResult();
        try {
            foreach ($candidates as $candidate) {
                $removed = $manager->wrapInTransaction(static function (EntityManagerInterface $transactionManager) use ($candidate, $now, $policy): bool {
                    $team = $transactionManager->createQueryBuilder()
                        ->select('team')
                        ->from(TeamRecord::class, 'team')
                        ->where('team.id = :id')
                        ->setParameter('id', $candidate['id'])
                        ->getQuery()
                        ->setLockMode(LockMode::PESSIMISTIC_WRITE)
                        ->getOneOrNullResult();
                    if (!$team instanceof TeamRecord) {
                        return false;
                    }
                    $transactionManager->refresh($team);
                    $row = $team->toRow();
                    if (!$policy->isEligible(new DateTimeImmutable($row['last_activity_at']), $row['time_zone'], $now)) {
                        return false;
                    }
                    // PostgreSQL cascades from the root, including future team-owned tables.
                    $transactionManager->remove($team);
                    return true;
                });
                if ($removed === true) {
                    ++$deleted;
                }
            }
        } catch (\Throwable $error) {
            $this->managers->resetManager();
            throw $error;
        } finally {
            // DB cascades must not leave stale team/participant objects in the identity map.
            $manager->clear();
        }
        return $deleted;
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
