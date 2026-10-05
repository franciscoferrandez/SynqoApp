<?php

declare(strict_types=1);

namespace App\Domain\Team;

use DateTimeImmutable;
use InvalidArgumentException;

final readonly class TeamDeletionPolicy
{
    private int $days;

    public function __construct(private ExpiryCalculator $expiry, string $retentionDays = '90')
    {
        $days = filter_var($retentionDays, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($days === false) {
            throw new InvalidArgumentException('TEAM_DELETION_RETENTION_DAYS must be a positive integer.');
        }
        $this->days = $days;
    }

    public function deletesAt(DateTimeImmutable $lastActivity, string $timeZone): DateTimeImmutable
    {
        return $this->expiry->expiresAt($lastActivity, $timeZone)->modify('+' . $this->days . ' days');
    }

    public function isEligible(DateTimeImmutable $lastActivity, string $timeZone, DateTimeImmutable $now): bool
    {
        return $now >= $this->deletesAt($lastActivity, $timeZone);
    }
}
