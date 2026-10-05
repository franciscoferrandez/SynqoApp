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
}
