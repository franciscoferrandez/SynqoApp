<?php

declare(strict_types=1);

namespace App\Application\Team;

use App\Application\Exception\InvalidTeamInput;
use App\Application\Exception\CreationLimitExceeded;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Mail\PayloadCipher;
use App\Domain\Mail\RecipientAddress;
use App\Domain\Team\ExpiryCalculator;
use App\Domain\Team\ParticipantName;
use App\Domain\Team\TeamTimeZone;
use DateTimeImmutable;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class TeamService
{
    public function __construct(
        private TeamRepository $teams,
        private ClockInterface $clock,
        private ExpiryCalculator $expiry,
        private IdentifierGenerator $identifiers,
        private AccessTokenGenerator $accessTokens,
        private PayloadCipher $cipher,
        private string $publicUrl,
        private int $mailAttemptTtlSeconds,
        private bool $teamCreationEmailEnabled,
        private CreationLimitPolicy $creationLimitPolicy,
        private string $creationOriginHashSecret,
    ) {}

    /** @return array<string, mixed> */
    public function create(
        string $name,
        string $firstParticipantName,
        ?string $timeZone,
        ?string $email = null,
        ?string $clientIp = null,
        ?string $deviceKey = null,
    ): array {
        $invalidFields = [];
        if (!ParticipantName::isValid($name)) {
            $invalidFields[] = 'name';
        }
        if (!ParticipantName::isValid($firstParticipantName)) {
            $invalidFields[] = 'firstParticipantName';
        }
        $email = $email === null || trim($email) === '' ? null : trim($email);
        if ($email !== null && !$this->teamCreationEmailEnabled) {
            $invalidFields[] = 'email';
        }
        if ($email !== null && !RecipientAddress::isValid($email)) {
            $invalidFields[] = 'email';
        }
        if ($invalidFields !== []) {
            throw new InvalidTeamInput($invalidFields);
        }

        $name = trim($name);
        $firstParticipantName = trim($firstParticipantName);
        $zone = TeamTimeZone::orDefault($timeZone);
        $now = $this->now();
        $origins = $this->creationOrigins($clientIp, $deviceKey);
        if ($origins === []) {
            throw new CreationLimitExceeded();
        }
        $id = $this->identifiers->generate();
        $participantId = $this->identifiers->generate();
        $accessToken = $this->accessTokens->generate();
        $mailAttempt = null;
        $receipt = null;
        if ($email !== null) {
            $receipt = $this->accessTokens->generate();
            $mailAttempt = [
                'id' => $this->identifiers->generate(),
                'receipt_verifier' => hash('sha256', $receipt),
                'payload' => $this->cipher->encrypt(json_encode(['email' => $email, 'token' => $accessToken], JSON_THROW_ON_ERROR)),
                'created_at' => $now->format('Y-m-d H:i:sP'),
                'expires_at' => $now->modify(sprintf('+%d seconds', $this->mailAttemptTtlSeconds))->format('Y-m-d H:i:sP'),
            ];
        }
        $this->teams->createWithOriginLimit(
            ['id' => $id, 'name' => $name, 'access_verifier' => hash('sha256', $accessToken), 'time_zone' => $zone, 'created_at' => $now->format('Y-m-d H:i:sP'), 'last_activity_at' => $now->format('Y-m-d H:i:sP')],
            ['id' => $participantId, 'name' => $firstParticipantName, 'name_normalized' => ParticipantName::normalize($firstParticipantName), 'created_at' => $now->format('Y-m-d H:i:sP')],
            $mailAttempt,
            $origins,
            $this->creationLimitPolicy->maxTeams,
            $this->creationLimitPolicy->windowSeconds(),
        );

        $created = [
            'id' => $id,
            'name' => $name,
            'timeZone' => $zone,
            'expiresAt' => $this->expiry->expiresAt($now, $zone)->format(DATE_ATOM),
            'firstParticipant' => ['id' => $participantId, 'name' => $firstParticipantName],
            'accessUrl' => rtrim($this->publicUrl, '/') . '/e#t=' . $accessToken,
        ];
        if ($receipt !== null) {
            $created['mailAttempt'] = ['status' => 'pending', 'receipt' => $receipt];
        }

        return $created;
    }

    /** @return list<array{type: 'ip'|'device', digest: string}> */
    private function creationOrigins(?string $clientIp, ?string $deviceKey): array
    {
        $origins = [];
        if ($clientIp !== null && filter_var($clientIp, FILTER_VALIDATE_IP) !== false) {
            $packedIp = inet_pton($clientIp);
            if ($packedIp !== false) {
                $origins[] = ['type' => 'ip', 'digest' => hash_hmac('sha256', 'ip:' . bin2hex($packedIp), $this->creationOriginHashSecret)];
            }
        }

        if ($deviceKey !== null && preg_match('/^[A-Za-z0-9_-]{43}$/D', $deviceKey) === 1) {
            $origins[] = ['type' => 'device', 'digest' => hash_hmac('sha256', 'device:' . $deviceKey, $this->creationOriginHashSecret)];
        }

        return $origins;
    }

    /** @return array<string, mixed> */
    public function current(?string $accessToken): array
    {
        $team = $this->authorizedTeam($accessToken);

        return [
            'id' => $team['id'],
            'name' => $team['name'],
            'timeZone' => $team['time_zone'],
            'expiresAt' => $this->expiry->expiresAt(new DateTimeImmutable($team['last_activity_at']), $team['time_zone'])->format(DATE_ATOM),
            'participants' => $this->teams->participants($team['id']),
        ];
    }

    /** @return array<string, mixed> */
    public function addParticipant(?string $accessToken, string $name): array
    {
        if ($accessToken === null) {
            throw new MissingAccessCredential();
        }
        if (!ParticipantName::isValid($name)) {
            throw new InvalidTeamInput(['name']);
        }
        $name = trim($name);
        /** @var array<string, mixed> $result */
        $result = $this->teams->withLockedTeam(hash('sha256', $accessToken), function (?array $team) use ($name): array {
            if ($team === null) {
                throw new TeamNotFound();
            }
            $now = $this->now();
            $lastActivity = new DateTimeImmutable($team['last_activity_at']);
            if ($now >= $this->expiry->expiresAt($lastActivity, $team['time_zone'])) {
                throw new TeamExpired();
            }
            $activity = $now > $lastActivity ? $now : $lastActivity;
            $participantId = $this->identifiers->generate();
            $this->teams->addParticipant($participantId, $team['id'], $name, ParticipantName::normalize($name), $activity->format('Y-m-d H:i:sP'));

            return [
                'participant' => ['id' => $participantId, 'name' => $name],
                'expiresAt' => $this->expiry->expiresAt($activity, $team['time_zone'])->format(DATE_ATOM),
            ];
        });
        return $result;
    }

    /** @return array<string, mixed> */
    private function authorizedTeam(?string $accessToken): array
    {
        if ($accessToken === null) {
            throw new MissingAccessCredential();
        }
        $team = $this->teams->findByAccessVerifier(hash('sha256', $accessToken));
        if ($team === null) {
            throw new TeamNotFound();
        }
        $expiresAt = $this->expiry->expiresAt(new DateTimeImmutable($team['last_activity_at']), $team['time_zone']);
        if ($this->now() >= $expiresAt) {
            throw new TeamExpired();
        }
        return $team;
    }

    private function now(): DateTimeImmutable
    {
        return $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
    }
}
