<?php

declare(strict_types=1);

namespace App\Application\Availability;

use App\Application\Exception\InvalidTeamInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\TeamRepository;
use App\Application\Team\TeamService;
use App\Domain\Availability\DailyAvailability;
use App\Domain\Team\ExpiryCalculator;
use DateTimeImmutable;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class AvailabilityService
{
    public function __construct(
        private TeamService $access,
        private TeamRepository $teams,
        private AvailabilityRepository $availability,
        private ClockInterface $clock,
        private ExpiryCalculator $expiry,
    ) {}

    /** @return array<string, mixed> */
    public function read(?string $token, string $from, string $to): array
    {
        $team = $this->access->current($token);
        if (!DailyAvailability::validDate($from) || !DailyAvailability::validDate($to) || $from > $to || (new DateTimeImmutable($from))->diff(new DateTimeImmutable($to))->days > 41) {
            throw new InvalidTeamInput(['from', 'to']);
        }
        $marks = $this->availability->marks($team['id'], $from, $to);
        $days = [];
        for ($date = new DateTimeImmutable($from); $date->format('Y-m-d') <= $to; $date = $date->modify('+1 day')) {
            $key = $date->format('Y-m-d');
            $days[] = DailyAvailability::day($key, $this->dayMarks($marks, $key));
        }
        return ['days' => $days];
    }

    /** @return array<string, mixed> */
    public function write(?string $token, string $date, string $participantId, mixed $state, mixed $zone): array
    {
        if ($token === null) {
            throw new MissingAccessCredential();
        }
        /** @var array<string, mixed> $result */
        $result = $this->teams->withLockedTeam(hash('sha256', $token), function (?array $team) use ($date, $participantId, $state, $zone): array {
            if ($team === null) {
                throw new TeamNotFound();
            }
            $now = $this->clock->now();
            $last = new DateTimeImmutable($team['last_activity_at']);
            if ($now >= $this->expiry->expiresAt($last, $team['time_zone'])) {
                throw new TeamExpired();
            }
            if (!in_array($participantId, array_column($this->teams->participants($team['id']), 'id'), true)) {
                throw new TeamNotFound();
            }
            if (!DailyAvailability::validDate($date) || ($state !== null && !in_array($state, DailyAvailability::STATES, true))) {
                throw new InvalidTeamInput(['date', 'state']);
            }
            if ($zone !== null && (!is_string($zone) || !in_array($zone, DateTimeZone::listIdentifiers(), true))) {
                throw new InvalidTeamInput(['timeZone']);
            }
            if (!DailyAvailability::editable($date, $now, $zone ?? $team['time_zone'])) {
                throw new InvalidTeamInput(['date']);
            }
            $activity = $now > $last ? $now : $last;
            $changed = $this->availability->save($team['id'], $participantId, $date, $state, $activity->format(DATE_ATOM));
            return ['day' => $this->day($team['id'], $date), 'expiresAt' => $this->expiry->expiresAt($changed ? $activity : $last, $team['time_zone'])->format(DATE_ATOM)];
        });
        return $result;
    }

    /** @return array<string, mixed> */
    private function day(string $teamId, string $date): array
    {
        return DailyAvailability::day($date, $this->dayMarks($this->availability->marks($teamId, $date, $date), $date));
    }

    /**
     * @param list<array{date: string, participantId: string, participantName: string, state: string}> $marks
     * @return list<array{participantId: string, participantName: string, state: string}>
     */
    private function dayMarks(array $marks, string $date): array
    {
        $result = [];
        foreach ($marks as $mark) {
            if ($mark['date'] === $date) {
                $result[] = ['participantId' => $mark['participantId'], 'participantName' => $mark['participantName'], 'state' => $mark['state']];
            }
        }
        return $result;
    }
}
