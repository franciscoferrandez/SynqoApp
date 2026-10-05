<?php

declare(strict_types=1);

namespace App\Application\Consultation;

interface ConsultationRepository
{
    /** @return array{open: list<array<string, mixed>>, resolved: list<array<string, mixed>>, rejected: list<array<string, mixed>>} */
    public function listForTeam(string $teamId): array;

    /**
     * @param list<string> $options
     * @return array{id: string, type: string, title: string, state: string, createdAt: string, createdBy: array{id: string, name: string}, options: list<array{id: string, text: string, position: int}>}
     */
    public function create(string $teamId, string $participantId, string $title, array $options, string $createdAt, string $activityAt): array;
}
