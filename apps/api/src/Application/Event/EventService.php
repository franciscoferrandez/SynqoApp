<?php

declare(strict_types=1);

namespace App\Application\Event;

use App\Application\Exception\EventConflict;
use App\Application\Exception\InvalidEventInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\IdentifierGenerator;
use App\Application\Team\TeamRepository;
use App\Application\Team\TeamService;
use App\Domain\Event\EventRules;
use App\Domain\Availability\DailyAvailability;
use App\Domain\Team\ExpiryCalculator;
use DateTimeImmutable;
use DateTimeZone;
use Psr\Clock\ClockInterface;

final readonly class EventService
{
    public function __construct(
        private TeamService $access,
        private TeamRepository $teams,
        private EventRepository $events,
        private IdentifierGenerator $identifiers,
        private ClockInterface $clock,
        private ExpiryCalculator $expiry,
    ) {}

    /** @return array{unfinalized: list<array<string, mixed>>, future: list<array<string, mixed>>, past: list<array<string, mixed>>, rejected: list<array<string, mixed>>} */
    public function list(?string $token): array
    {
        $team = $this->access->current($token);
        $today = $this->now()->setTimezone(new DateTimeZone($team['timeZone']))->format('Y-m-d');
        $groups = ['unfinalized' => [], 'future' => [], 'past' => [], 'rejected' => []];
        foreach ($this->events->listForTeam($team['id']) as $item) {
            $item['_sortAt'] = $item['lastModifiedAt'] ?? $item['_createdAt'];
            $group = match ($item['status']) {
                'rejected' => 'rejected',
                'definitive' => $item['date'] >= $today ? 'future' : 'past',
                default => 'unfinalized',
            };
            $groups[$group][] = $item;
        }

        usort($groups['future'], static fn(array $a, array $b): int => strcmp($a['date'], $b['date']) ?: strcmp($b['_sortAt'], $a['_sortAt']) ?: strcmp($a['id'], $b['id']));
        usort($groups['past'], static fn(array $a, array $b): int => strcmp($b['date'], $a['date']) ?: strcmp($b['_sortAt'], $a['_sortAt']) ?: strcmp($a['id'], $b['id']));
        foreach (['unfinalized', 'rejected'] as $group) {
            usort($groups[$group], static fn(array $a, array $b): int => strcmp($b['_sortAt'], $a['_sortAt']) ?: strcmp($a['id'], $b['id']));
        }
        foreach ($groups as &$items) {
            foreach ($items as &$item) {
                unset($item['_createdAt'], $item['_sortAt']);
            }
            unset($item);
        }
        unset($items);

        return $groups;
    }

    /** @return array{events: list<array{id: string, date: string|null, title: string, status: string}>} */
    public function calendar(?string $token, string $from, string $to): array
    {
        $team = $this->access->current($token);
        if (!DailyAvailability::validDate($from) || !DailyAvailability::validDate($to) || $from > $to || new DateTimeImmutable($from)->diff(new DateTimeImmutable($to))->days > 41) {
            throw new InvalidEventInput(['from', 'to']);
        }

        return ['events' => $this->events->calendarForTeam($team['id'], $from, $to)];
    }

    /** @return array{event: array<string, mixed>} */
    public function detail(?string $token, string $eventId): array
    {
        $team = $this->access->current($token);

        return ['event' => $this->events->detailForTeam($team['id'], $eventId) ?? throw new TeamNotFound()];
    }

    /** @return array{event: array<string, mixed>, expiresAt: string} */
    public function create(?string $token, mixed $participantId, mixed $title, mixed $notes, mixed $date, mixed $status): array
    {
        $status ??= 'provisional';
        $this->validate($participantId, $title, $notes, $date, $status, false);
        /** @var string $participantId */
        /** @var string $title */
        /** @var string|null $date */
        /** @var string $status */
        return $this->mutate($token, function (array $team, DateTimeImmutable $now, DateTimeImmutable $activity) use ($participantId, $title, $notes, $date, $status): array {
            $event = $this->events->create($team['id'], $participantId, $this->identifiers->generate(), trim($title), $this->normalizeNotes($notes), $date, $status, $now->format(DATE_ATOM), $activity->format(DATE_ATOM));
            return ['event' => $event, 'changed' => true];
        });
    }

    /** @return array{event: array<string, mixed>, expiresAt: string} */
    public function update(?string $token, string $eventId, mixed $participantId, mixed $title, mixed $notes, mixed $date, mixed $status): array
    {
        $this->validate($participantId, $title, $notes, $date, $status, true);
        /** @var string $participantId */
        /** @var string $title */
        /** @var string|null $date */
        /** @var string $status */
        return $this->mutate($token, function (array $team, DateTimeImmutable $now, DateTimeImmutable $activity) use ($eventId, $participantId, $title, $notes, $date, $status): array {
            $changed = $this->events->update($team['id'], $eventId, $participantId, trim($title), $this->normalizeNotes($notes), $date, $status, $now->format(DATE_ATOM), $activity->format(DATE_ATOM));
            $event = $this->events->detailForTeam($team['id'], $eventId) ?? throw new TeamNotFound();
            return ['event' => $event, 'changed' => $changed];
        });
    }

    /** @return array{event: array<string, mixed>, expiresAt: string} */
    public function reject(?string $token, string $eventId, mixed $participantId, mixed $disposition = null): array
    {
        if ($disposition !== null && (!is_string($disposition) || !in_array($disposition, ['unlink', 'reject_both'], true))) {
            throw new InvalidEventInput(['disposition']);
        }
        return $this->lifecycle($token, $eventId, $participantId, 'reject', $disposition);
    }

    /** @return array{event: array<string, mixed>, expiresAt: string} */
    public function recover(?string $token, string $eventId, mixed $participantId): array
    {
        return $this->lifecycle($token, $eventId, $participantId, 'recover');
    }

    /** @return array{event: array<string, mixed>, expiresAt: string} */
    private function lifecycle(?string $token, string $eventId, mixed $participantId, string $action, ?string $disposition = null): array
    {
        if (!is_string($participantId) || !\Symfony\Component\Uid\Uuid::isValid($participantId)) {
            throw new InvalidEventInput(['participantId']);
        }
        return $this->mutate($token, function (array $team, DateTimeImmutable $now, DateTimeImmutable $activity) use ($eventId, $participantId, $action, $disposition): array {
            if ($action === 'reject') {
                $changed = $this->events->reject($team['id'], $eventId, $participantId, $disposition, $now->format(DATE_ATOM), $activity->format(DATE_ATOM));
            } else {
                $changed = $this->events->recover($team['id'], $eventId, $participantId, $now->format(DATE_ATOM), $activity->format(DATE_ATOM));
            }
            $event = $this->events->detailForTeam($team['id'], $eventId) ?? throw new TeamNotFound();
            return ['event' => $event, 'changed' => $changed];
        });
    }

    /** @param callable(array<string, mixed>, DateTimeImmutable, DateTimeImmutable): array{event: array<string, mixed>, changed: bool} $work
     * @return array{event: array<string, mixed>, expiresAt: string}
     */
    private function mutate(?string $token, callable $work): array
    {
        if ($token === null) {
            throw new MissingAccessCredential();
        }
        return $this->teams->withLockedTeam(hash('sha256', $token), function (?array $team) use ($work): array {
            if ($team === null) {
                throw new TeamNotFound();
            }
            $now = $this->now();
            $lastActivity = new DateTimeImmutable($team['last_activity_at']);
            if ($now >= $this->expiry->expiresAt($lastActivity, $team['time_zone'])) {
                throw new TeamExpired();
            }
            $activity = $now > $lastActivity ? $now : $lastActivity;
            $result = $work($team, $now, $activity);
            return [
                'event' => $result['event'],
                'expiresAt' => $this->expiry->expiresAt($result['changed'] ? $activity : $lastActivity, $team['time_zone'])->format(DATE_ATOM),
            ];
        });
    }

    private function validate(mixed $participantId, mixed $title, mixed $notes, mixed $date, mixed $status, bool $statusRequired): void
    {
        $violations = EventRules::violations($title, $notes, $date, $status, $statusRequired);
        if (!is_string($participantId) || !\Symfony\Component\Uid\Uuid::isValid($participantId)) {
            $violations[] = 'participantId';
        }
        if ($violations !== []) {
            throw new InvalidEventInput(array_values(array_unique($violations)));
        }
    }

    private function normalizeNotes(mixed $notes): ?string
    {
        return is_string($notes) && trim($notes) !== '' ? $notes : null;
    }

    private function now(): DateTimeImmutable
    {
        return $this->clock->now()->setTimezone(new DateTimeZone('UTC'));
    }
}
