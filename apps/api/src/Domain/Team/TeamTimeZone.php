<?php

declare(strict_types=1);

namespace App\Domain\Team;

use DateTimeZone;

final class TeamTimeZone
{
    public static function orDefault(?string $timeZone): string
    {
        if ($timeZone === null) {
            return 'Europe/Madrid';
        }
        try {
            new DateTimeZone($timeZone);
            return $timeZone;
        } catch (\Throwable) {
            return 'Europe/Madrid';
        }
    }
}
