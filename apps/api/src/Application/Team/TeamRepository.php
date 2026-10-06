<?php

declare(strict_types=1);

namespace App\Application\Team;

interface TeamRepository
{
    /**
     * @param array{id: string, name: string, access_verifier: string, time_zone: string, created_at: string, last_activity_at: string} $team
     * @param array{id: string, name: string, name_normalized: string, created_at: string} $participant
     * @param array{id: string, receipt_verifier: string, payload: string, created_at: string, expires_at: string}|null $mailAttempt persisted in the same transaction
     */
    public function create(array $team, array $participant, ?array $mailAttempt = null): void;

    /** @return array<string, mixed>|null */
    public function findByAccessVerifier(string $verifier): ?array;

    /** @param callable(array<string, mixed>|null): mixed $work */
    public function withLockedTeam(string $verifier, callable $work): mixed;

    /** @return list<array{id: string, name: string}> */
    public function participants(string $teamId): array;

    public function addParticipant(string $id, string $teamId, string $name, string $normalizedName, string $createdAt): void;
}
