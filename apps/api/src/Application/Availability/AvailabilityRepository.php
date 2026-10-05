<?php

declare(strict_types=1);

namespace App\Application\Availability;

interface AvailabilityRepository
{
    /** @return list<array{date: string, participantId: string, participantName: string, state: string}> */
    public function marks(string $teamId, string $from, string $to): array;
    public function save(string $teamId, string $participantId, string $date, ?string $state, string $activity): bool;
}
