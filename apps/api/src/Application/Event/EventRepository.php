<?php

declare(strict_types=1);

namespace App\Application\Event;

use App\Application\Listing\ListContext;

interface EventRepository
{
    /** @param array{date: string, id: string|null}|null $frontier
     * @return array{active?: list<array<string, mixed>>, archived: list<array<string, mixed>>, nextFrontier: array{date: string, id: string|null}|null}
     */
    public function listForTeam(string $teamId, ListContext $context, ?array $frontier): array;

    /** @return list<array<string, mixed>> */
    public function calendarForTeam(string $teamId, string $from, string $to): array;

    /** @return array<string, mixed>|null */
    public function detailForTeam(string $teamId, string $eventId): ?array;

    /** @return array<string, mixed> */
    public function create(string $teamId, string $participantId, string $eventId, string $title, ?string $notes, ?string $date, string $status, string $at, string $activityAt): array;

    public function update(string $teamId, string $eventId, string $participantId, string $title, ?string $notes, ?string $date, string $status, string $at, string $activityAt): bool;

    public function reject(string $teamId, string $eventId, string $participantId, ?string $disposition, string $at, string $activityAt): bool;

    public function recover(string $teamId, string $eventId, string $participantId, string $at, string $activityAt): bool;
}
