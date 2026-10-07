<?php

declare(strict_types=1);

namespace App\Application\Team;

use Psr\Clock\ClockInterface;

final readonly class CreationLimitPurger
{
    public function __construct(
        private TeamRepository $teams,
        private CreationLimitPolicy $policy,
        private ClockInterface $clock,
    ) {}

    public function purgeExpired(): int
    {
        return $this->teams->purgeExpiredCreationOrigins($this->clock->now(), $this->policy->windowSeconds());
    }
}
