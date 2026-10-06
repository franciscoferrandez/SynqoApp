<?php

declare(strict_types=1);

namespace App\Application\Mail;

use App\Application\Exception\MailAttemptNotFound;
use App\Application\Exception\MissingAccessCredential;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class MailAttemptStatusService
{
    public function __construct(private MailAttemptRepository $attempts, private ClockInterface $clock) {}

    public function status(?string $receipt): string
    {
        if ($receipt === null || $receipt === '') {
            throw new MissingAccessCredential();
        }
        // Opportunistic cleanup: an overdue attempt must not keep its payload if the worker is down.
        $this->attempts->expireOverdue($this->clock->now()->setTimezone(new DateTimeZone('UTC')));
        $status = $this->attempts->statusByReceiptVerifier(hash('sha256', $receipt));

        return ($status ?? throw new MailAttemptNotFound())->publicValue();
    }
}
