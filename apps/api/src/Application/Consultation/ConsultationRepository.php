<?php

declare(strict_types=1);

namespace App\Application\Consultation;

use App\Application\Listing\ListContext;

interface ConsultationRepository
{
    /** @param array{date: string, id: string|null}|null $frontier
     * @return array{active?: list<array<string, mixed>>, archived: list<array<string, mixed>>, nextFrontier: array{date: string, id: string|null}|null}
     */
    public function listForTeam(string $teamId, ListContext $context, ?array $frontier): array;

    /**
     * @param list<string> $options
     * @return array<string, mixed>
     */
    public function create(string $teamId, string $participantId, string $title, string $type, array $options, ?string $eventId, string $createdAt, string $activityAt): array;

    public function setEvent(string $teamId, string $consultationId, ?string $eventId, string $activityAt): bool;

    public function edit(string $teamId, string $consultationId, ConsultationEditInput $input, string $at, string $activityAt): bool;

    /** @return array<string, mixed>|null */
    public function detail(string $teamId, string $consultationId): ?array;

    /** @return bool Whether the persisted vote changed. */
    public function setVote(string $teamId, string $consultationId, string $participantId, string $optionId, bool $selected, string $activityAt): bool;

    /** @param list<string> $acceptedOptionIds
     * @return bool Whether the resolution was first recorded.
     */
    public function resolve(string $teamId, string $consultationId, string $participantId, string $state, array $acceptedOptionIds, string $resolvedAt, string $activityAt, bool $changeEvent = false, ?string $eventId = null, ?int $expectedEventVersion = null): bool;
}
