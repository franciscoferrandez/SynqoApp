<?php

declare(strict_types=1);

namespace App\Domain\Consultation;

use DateTimeImmutable;
use DateTimeZone;

final class DateConsultationRules
{
    public static function isTimeZone(mixed $timeZone): bool
    {
        return is_string($timeZone) && in_array($timeZone, DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC), true);
    }

    /**
     * @param mixed $title
     * @param mixed $options
     * @return list<string>
     */
    public static function violations(mixed $title, mixed $options, mixed $timeZone): array
    {
        $violations = [];
        if (!is_string($title) || preg_match('/^[\p{Z}\s]*$/u', $title) === 1 || mb_strlen($title) > TextConsultationRules::MAX_TITLE_LENGTH) {
            $violations[] = 'title';
        }
        if (!self::isTimeZone($timeZone)) {
            $violations[] = 'timeZone';
        }
        if (!is_array($options) || !array_is_list($options)) {
            return [...$violations, 'options'];
        }
        if (count($options) < 1 || count($options) > TextConsultationRules::MAX_OPTIONS) {
            $violations[] = 'options';
        }

        $seen = [];
        foreach ($options as $index => $date) {
            if (!self::isCivilDate($date)) {
                $violations[] = 'options.' . $index;
                continue;
            }
            if (isset($seen[$date])) {
                $violations[] = 'options.' . $seen[$date];
                $violations[] = 'options.' . $index;
            } else {
                $seen[$date] = $index;
            }
        }

        return array_values(array_unique($violations));
    }

    /**
     * @param list<string> $dates
     * @return list<string>
     */
    public static function pastDateViolations(array $dates, string $timeZone, DateTimeImmutable $now): array
    {
        $today = $now->setTimezone(new DateTimeZone($timeZone))->format('Y-m-d');
        $violations = [];
        foreach ($dates as $index => $date) {
            if ($date < $today) {
                $violations[] = 'options.' . $index;
            }
        }

        return $violations;
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
