<?php

declare(strict_types=1);

namespace App\Domain\Team;

use DateTimeImmutable;
use DateTimeZone;

final class ExpiryCalculator
{
    public function expiresAt(DateTimeImmutable $lastActivity, string $timeZone): DateTimeImmutable
    {
        $zone = new DateTimeZone($timeZone);
        $local = $lastActivity->setTimezone($zone);
        $target = $local->modify('first day of this month')->setTime(0, 0)->modify('+3 months');
        $day = (int) $local->format('j');
        $days = (int) $target->format('t');
        $due = $target->modify('+' . (min($day, $days) - 1) . ' days');
        if ($day > $days) {
            $due = $due->modify('+' . ($day - $days) . ' days');
        }
        return $due->modify('+1 day')->setTime(0, 0)->setTimezone(new DateTimeZone('UTC'));
    }
}
