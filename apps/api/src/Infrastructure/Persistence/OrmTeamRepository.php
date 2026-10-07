<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Exception\DuplicateParticipant;
use App\Application\Exception\CreationLimitExceeded;
use App\Application\Team\TeamRepository;
use App\Infrastructure\Persistence\Entity\MailAttemptRecord;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use Doctrine\DBAL\LockMode;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmTeamRepository implements TeamRepository
{
    public function __construct(private ManagerRegistry $managers) {}

    /**
     * @param array{id: string, name: string, access_verifier: string, time_zone: string, created_at: string, last_activity_at: string} $team
     * @param array{id: string, name: string, name_normalized: string, created_at: string} $participant
     * @param array{id: string, receipt_verifier: string, payload: string, created_at: string, expires_at: string}|null $mailAttempt
     */
    public function create(array $team, array $participant, ?array $mailAttempt = null): void
    {
        $manager = $this->manager();
        $teamRecord = new TeamRecord($team['id'], $team['name'], $team['access_verifier'], $team['time_zone'], new DateTimeImmutable($team['created_at']), new DateTimeImmutable($team['last_activity_at']));
        $participantRecord = new ParticipantRecord($participant['id'], $teamRecord, $participant['name'], $participant['name_normalized'], new DateTimeImmutable($participant['created_at']));

        try {
            $manager->persist($teamRecord);
            $manager->persist($participantRecord);
            if ($mailAttempt !== null) {
                $manager->persist(new MailAttemptRecord($mailAttempt['id'], $teamRecord, $mailAttempt['receipt_verifier'], 'pending', $mailAttempt['payload'], new DateTimeImmutable($mailAttempt['created_at']), new DateTimeImmutable($mailAttempt['expires_at'])));
            }
            $manager->flush();
        } catch (\Throwable $error) {
            $this->managers->resetManager();
            throw $error;
        }
    }

    public function createWithOriginLimit(
        array $team,
        array $participant,
        ?array $mailAttempt,
        array $origins,
        int $maxTeams,
        int $windowSeconds,
    ): void {
        if ($origins === []) {
            throw new CreationLimitExceeded();
        }
        if ($maxTeams < 1 || $windowSeconds < 1) {
            throw new \InvalidArgumentException('Creation limit settings must be positive.');
        }

        $manager = $this->manager();
        $connection = $manager->getConnection();
        $createdAt = new DateTimeImmutable($team['created_at']);
        $cutoff = $createdAt->modify(sprintf('-%d seconds', $windowSeconds));

        try {
            // Commit expiry cleanup independently so a limit rejection still removes
            // obsolete digests rather than rolling that cleanup back with the request.
            $connection->executeStatement(
                'DELETE FROM team_creation_origin_event WHERE created_at <= ?',
                [$cutoff->format('Y-m-d H:i:s.uP')],
            );
            $connection->transactional(function () use ($connection, $manager, $team, $participant, $mailAttempt, $origins, $maxTeams, $createdAt, $cutoff): void {
                // A single lock keeps the low-volume creation path straightforward and
                // also covers the case where a signal has no event row yet.
                $connection->executeQuery('SELECT pg_advisory_xact_lock(1398362447, 1)');
                foreach ($origins as $origin) {
                    $count = (int) $connection->fetchOne(
                        'SELECT COUNT(*) FROM team_creation_origin_event WHERE signal_type = ? AND signal_digest = ? AND created_at > ?',
                        [$origin['type'], $origin['digest'], $cutoff->format('Y-m-d H:i:s.uP')],
                    );
                    if ($count >= $maxTeams) {
                        throw new CreationLimitExceeded();
                    }
                }

                $this->persistTeam($manager, $team, $participant, $mailAttempt);

                foreach ($origins as $origin) {
                    $connection->insert('team_creation_origin_event', [
                        'signal_type' => $origin['type'],
                        'signal_digest' => $origin['digest'],
                        'created_at' => $createdAt->format('Y-m-d H:i:s.uP'),
                    ]);
                }
            });
        } catch (CreationLimitExceeded $error) {
            throw $error;
        } catch (\Throwable $error) {
            $this->managers->resetManager();
            throw $error;
        }
    }

    public function purgeExpiredCreationOrigins(DateTimeImmutable $now, int $windowSeconds): int
    {
        if ($windowSeconds < 1) {
            throw new \InvalidArgumentException('Creation limit window must be positive.');
        }

        $cutoff = $now->modify(sprintf('-%d seconds', $windowSeconds));
        return $this->manager()->getConnection()->executeStatement(
            'DELETE FROM team_creation_origin_event WHERE created_at <= ?',
            [$cutoff->format('Y-m-d H:i:s.uP')],
        );
    }

    public function findByAccessVerifier(string $verifier): ?array
    {
        $team = $this->manager()->getRepository(TeamRecord::class)->findOneBy(['accessVerifier' => $verifier]);
        return $team?->toRow();
    }

    public function withLockedTeam(string $verifier, callable $work): mixed
    {
        $manager = $this->manager();
        try {
            return $manager->wrapInTransaction(function (EntityManagerInterface $transactionManager) use ($verifier, $work): mixed {
                $team = $transactionManager->createQueryBuilder()
                    ->select('team')
                    ->from(TeamRecord::class, 'team')
                    ->where('team.accessVerifier = :verifier')
                    ->setParameter('verifier', $verifier)
                    ->getQuery()
                    ->setLockMode(LockMode::PESSIMISTIC_WRITE)
                    ->getOneOrNullResult();
                if ($team instanceof TeamRecord) {
                    $transactionManager->refresh($team);
                }
                return $work($team?->toRow());
            });
        } catch (UniqueConstraintViolationException $error) {
            $this->managers->resetManager();
            throw new DuplicateParticipant(previous: $error);
        } catch (\Throwable $error) {
            $this->managers->resetManager();
            throw $error;
        }
    }

    public function participants(string $teamId): array
    {
        $manager = $this->manager();
        $team = $manager->getReference(TeamRecord::class, $teamId);
        $participants = $manager->getRepository(ParticipantRecord::class)->findBy(['team' => $team], ['createdAt' => 'ASC', 'id' => 'ASC']);
        return array_map(static fn(ParticipantRecord $participant): array => $participant->toListItem(), $participants);
    }

    public function addParticipant(string $id, string $teamId, string $name, string $normalizedName, string $createdAt): void
    {
        $manager = $this->manager();
        $team = $manager->find(TeamRecord::class, $teamId);
        if ($team === null) {
            throw new \LogicException('The authorized team no longer exists.');
        }
        $now = new DateTimeImmutable($createdAt);
        $team->setLastActivityAt($now);
        $manager->persist(new ParticipantRecord($id, $team, $name, $normalizedName, $now));

    }

    private function manager(): EntityManagerInterface
    {
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }
        return $manager;
    }

    /**
     * @param array{id: string, name: string, access_verifier: string, time_zone: string, created_at: string, last_activity_at: string} $team
     * @param array{id: string, name: string, name_normalized: string, created_at: string} $participant
     * @param array{id: string, receipt_verifier: string, payload: string, created_at: string, expires_at: string}|null $mailAttempt
     */
    private function persistTeam(EntityManagerInterface $manager, array $team, array $participant, ?array $mailAttempt): void
    {
        $teamRecord = new TeamRecord($team['id'], $team['name'], $team['access_verifier'], $team['time_zone'], new DateTimeImmutable($team['created_at']), new DateTimeImmutable($team['last_activity_at']));
        $participantRecord = new ParticipantRecord($participant['id'], $teamRecord, $participant['name'], $participant['name_normalized'], new DateTimeImmutable($participant['created_at']));
        $manager->persist($teamRecord);
        $manager->persist($participantRecord);
        if ($mailAttempt !== null) {
            $manager->persist(new MailAttemptRecord($mailAttempt['id'], $teamRecord, $mailAttempt['receipt_verifier'], 'pending', $mailAttempt['payload'], new DateTimeImmutable($mailAttempt['created_at']), new DateTimeImmutable($mailAttempt['expires_at'])));
        }
        $manager->flush();
    }
}
