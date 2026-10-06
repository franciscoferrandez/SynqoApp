<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Exception\DuplicateParticipant;
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
}
