<?php

declare(strict_types=1);

namespace App\Application\Mail;

use DateTimeImmutable;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class MailAttemptProcessor
{
    public function __construct(
        private MailAttemptRepository $attempts,
        private PayloadCipher $cipher,
        private TeamLinkMailer $mailer,
        private ClockInterface $clock,
        private string $publicUrl,
    ) {}

    public function expireOverdue(): int
    {
        return $this->attempts->expireOverdue($this->now());
    }

    /** Runs at most one attempt; false when nothing was claimable. */
    public function processNext(): bool
    {
        $claimed = $this->attempts->claimNext($this->now());
        if ($claimed === null) {
            return false;
        }
        $outcome = MailAttemptStatus::Failed;
        try {
            /** @var array{email: string, token: string} $payload */
            $payload = json_decode($this->cipher->decrypt($claimed['payload']), true, 512, JSON_THROW_ON_ERROR);
            $this->mailer->send($payload['email'], $claimed['team_name'], rtrim($this->publicUrl, '/') . '/e#t=' . $payload['token']);
            $outcome = MailAttemptStatus::Succeeded;
        } catch (\Throwable) {
            // Failure details can contain the recipient; only the outcome is kept.
        }
        $this->attempts->finish($claimed['id'], $outcome, $this->now());

        return true;
    }

    private function now(): DateTimeImmutable
    {
        return $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
    }
}
