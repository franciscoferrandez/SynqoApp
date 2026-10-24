<?php

declare(strict_types=1);

namespace App\Application\Listing;

use DateTimeImmutable;
use DateTimeZone;

final readonly class ListPolicy
{
    public const int RECENT_DAYS = 7;
    public const int LOAD_MORE_COUNT = 10;

    public function __construct(private int $recentDays = self::RECENT_DAYS, private int $loadMoreCount = self::LOAD_MORE_COUNT)
    {
        if ($recentDays < 1 || $loadMoreCount < 1) {
            throw new \InvalidArgumentException('List limits must be positive.');
        }
    }

    public function context(DateTimeImmutable $now, string $timeZone): ListContext
    {
        return new ListContext($now->setTimezone(new DateTimeZone($timeZone))->format('Y-m-d'), $timeZone, $this->recentDays, $this->loadMoreCount);
    }
}
