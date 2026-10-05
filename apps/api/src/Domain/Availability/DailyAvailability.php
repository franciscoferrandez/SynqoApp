<?php

declare(strict_types=1);

namespace App\Domain\Availability;

use DateTimeImmutable;
use DateTimeZone;

final class DailyAvailability
{
    public const array STATES = ['available', 'maybe', 'unavailable'];

    public static function validDate(string $date): bool
    {
        if (!preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $date) || str_starts_with($date, '0000')) {
            return false;
        }
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        return $parsed !== false && $parsed->format('Y-m-d') === $date;
    }

    public static function editable(string $date, DateTimeImmutable $now, string $zone): bool
    {
        return $date >= $now->setTimezone(new DateTimeZone($zone))->format('Y-m-d');
    }

    /**
     * @param list<array{participantId: string, participantName: string, state: string}> $marks
     * @return array{date: string, state: ?string, counts: array<string, int>, marks: list<array{participantId: string, participantName: string, state: string}>}
     */
    public static function day(string $date, array $marks): array
    {
        $counts = array_fill_keys(self::STATES, 0);
        foreach ($marks as $mark) {
            ++$counts[$mark['state']];
        }
        $state = null;
        foreach (self::STATES as $candidate) {
            if ($counts[$candidate] > 0) {
                $state = $candidate;
            }
        }
        return ['date' => $date, 'state' => $state, 'counts' => $counts, 'marks' => $marks];
    }
}
