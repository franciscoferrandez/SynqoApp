<?php

declare(strict_types=1);

namespace App\Application\Team;

interface TeamRepository
{
    /**
     * @param array{id: string, name: string, access_verifier: string, time_zone: string, created_at: string, last_activity_at: string} $team
     * @param array{id: string, name: string, name_normalized: string, created_at: string} $participant
     */
    public function create(array $team, array $participant): void;

    /** @return array<string, mixed>|null */
    public function findByAccessVerifier(string $verifier): ?array;

    /** @param callable(array<string, mixed>|null): mixed $work */
    public function withLockedTeam(string $verifier, callable $work): mixed;

    /** @return list<array{id: string, name: string}> */
    public function participants(string $teamId): array;

    public function addParticipant(string $id, string $teamId, string $name, string $normalizedName, string $createdAt): void;
}
