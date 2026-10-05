<?php

declare(strict_types=1);

namespace App\Application\Consultation;

interface ConsultationRepository
{
    /** @return array{open: list<array<string, mixed>>, resolved: list<array<string, mixed>>, rejected: list<array<string, mixed>>} */
    public function listForTeam(string $teamId): array;

    /**
     * @param list<string> $options
     * @return array<string, mixed>
     */
    public function create(string $teamId, string $participantId, string $title, string $type, array $options, string $createdAt, string $activityAt): array;

    /** @return array<string, mixed>|null */
    public function detail(string $teamId, string $consultationId): ?array;

    /** @return bool Whether the persisted vote changed. */
    public function setVote(string $teamId, string $consultationId, string $participantId, string $optionId, bool $selected, string $activityAt): bool;

    /** @param list<string> $acceptedOptionIds
     * @return bool Whether the resolution was first recorded.
     */
    public function resolve(string $teamId, string $consultationId, string $participantId, string $state, array $acceptedOptionIds, string $resolvedAt, string $activityAt): bool;
}
