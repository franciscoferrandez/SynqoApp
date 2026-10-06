<?php

declare(strict_types=1);

namespace App\Application\Mail;

use DateTimeImmutable;

interface MailAttemptRepository
{
    /**
     * Atomically moves one pending, unexpired attempt to started and commits before returning.
     *
     * @return array{id: string, team_name: string, payload: string}|null
     */
    public function claimNext(DateTimeImmutable $now): ?array;

    /** Closes a started attempt and clears its payload; false when it was already closed by expiry. */
    public function finish(string $id, MailAttemptStatus $outcome, DateTimeImmutable $now): bool;

    /** Closes pending or started attempts past their deadline as failed and clears their payload. */
    public function expireOverdue(DateTimeImmutable $now): int;

    public function statusByReceiptVerifier(string $verifier): ?MailAttemptStatus;
}
