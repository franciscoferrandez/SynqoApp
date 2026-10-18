<?php

declare(strict_types=1);

namespace App\Domain\Event;

use DateTimeImmutable;

final class EventRules
{
    public const int MAX_TITLE_LENGTH = 250;
    public const int MAX_NOTES_LENGTH = 5000;

    /** @return list<string> */
    public static function violations(mixed $title, mixed $notes, mixed $date, mixed $status, bool $statusRequired): array
    {
        $violations = [];
        if (!is_string($title) || preg_match('/^[\p{Z}\s]*$/u', $title) === 1 || mb_strlen($title) > self::MAX_TITLE_LENGTH) {
            $violations[] = 'title';
        }
        if ($notes !== null && (!is_string($notes) || mb_strlen($notes) > self::MAX_NOTES_LENGTH)) {
            $violations[] = 'notes';
        }
        if ($date !== null && !self::isCivilDate($date)) {
            $violations[] = 'date';
        }

        $allowedStatuses = $statusRequired ? ['provisional', 'definitive'] : ['provisional', 'definitive'];
        if ($statusRequired && (!is_string($status) || !in_array($status, $allowedStatuses, true))) {
            $violations[] = 'status';
        } elseif (!$statusRequired && $status !== null && (!is_string($status) || !in_array($status, $allowedStatuses, true))) {
            $violations[] = 'status';
        }

        $effectiveStatus = $status ?? 'provisional';
        if ($date === null && $effectiveStatus !== 'provisional') {
            $violations[] = 'status';
        }

        return array_values(array_unique($violations));
    }

    private static function isCivilDate(mixed $date): bool
    {
        if (!is_string($date) || preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date) !== 1) {
            return false;
        }

        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        $errors = DateTimeImmutable::getLastErrors();

        return $parsed !== false && $parsed->format('Y-m-d') === $date && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0));
    }
}
