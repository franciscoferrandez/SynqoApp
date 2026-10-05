<?php

declare(strict_types=1);

namespace App\Application\Team;

use App\Domain\Team\TeamDeletionPolicy;
use DateTimeImmutable;

interface TeamCleanupRepository
{
    public function deleteEligible(DateTimeImmutable $now, TeamDeletionPolicy $policy): int;
}
