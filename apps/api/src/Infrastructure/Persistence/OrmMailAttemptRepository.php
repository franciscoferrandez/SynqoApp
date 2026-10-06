<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Mail\MailAttemptRepository;
use App\Application\Mail\MailAttemptStatus;
use DateTimeImmutable;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;

final readonly class OrmMailAttemptRepository implements MailAttemptRepository
{
    private const string FORMAT = 'Y-m-d H:i:sP';

    public function __construct(private ManagerRegistry $managers) {}

    public function claimNext(DateTimeImmutable $now): ?array
    {
        $connection = $this->connection();

        return $connection->transactional(static function (Connection $transaction) use ($now): ?array {
            /** @var array{id: string, team_name: string, payload: string}|false $row */
            $row = $transaction->fetchAssociative(
                "SELECT attempt.id, team.name AS team_name, attempt.payload FROM team_mail_attempt attempt JOIN team ON team.id = attempt.team_id WHERE attempt.status = 'pending' AND attempt.expires_at > :now AND attempt.payload IS NOT NULL ORDER BY attempt.created_at, attempt.id LIMIT 1 FOR UPDATE OF attempt SKIP LOCKED",
                ['now' => $now->format(self::FORMAT)],
            );
            if ($row === false) {
                return null;
            }
            $transaction->executeStatement(
                "UPDATE team_mail_attempt SET status = 'started', started_at = :now WHERE id = :id AND status = 'pending'",
                ['now' => $now->format(self::FORMAT), 'id' => $row['id']],
            );

            return $row;
        });
    }

    public function finish(string $id, MailAttemptStatus $outcome, DateTimeImmutable $now): bool
    {
        return $this->connection()->executeStatement(
            "UPDATE team_mail_attempt SET status = :status, payload = NULL, finished_at = :now WHERE id = :id AND status = 'started'",
            ['status' => $outcome->value, 'now' => $now->format(self::FORMAT), 'id' => $id],
        ) === 1;
    }

    public function expireOverdue(DateTimeImmutable $now): int
    {
        return (int) $this->connection()->executeStatement(
            "UPDATE team_mail_attempt SET status = 'failed', payload = NULL, finished_at = :now WHERE status IN ('pending', 'started') AND expires_at <= :now",
            ['now' => $now->format(self::FORMAT)],
        );
    }

    public function statusByReceiptVerifier(string $verifier): ?MailAttemptStatus
    {
        $status = $this->connection()->fetchOne('SELECT status FROM team_mail_attempt WHERE receipt_verifier = :verifier', ['verifier' => $verifier]);

        return is_string($status) ? MailAttemptStatus::from($status) : null;
    }

    private function connection(): Connection
    {
        $connection = $this->managers->getConnection();
        if (!$connection instanceof Connection) {
            throw new \LogicException('Doctrine DBAL connection is required.');
        }

        return $connection;
    }
}
