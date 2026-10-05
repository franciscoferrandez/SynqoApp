<?php

declare(strict_types=1);

namespace App\Application\Team;

use App\Domain\Team\TeamDeletionPolicy;
use Psr\Clock\ClockInterface;

final readonly class TeamCleanupService
{
    public function __construct(private TeamCleanupRepository $teams, private ClockInterface $clock, private TeamDeletionPolicy $policy) {}

    public function clean(): int
    {
        return $this->teams->deleteEligible($this->clock->now(), $this->policy);
    }
}
