<?php

declare(strict_types=1);

namespace App\Application\Listing;

use DateTimeImmutable;
use DateTimeZone;

final readonly class ListContext
{
    public function __construct(public string $today, public string $timeZone, public int $recentDays, public int $loadMoreCount) {}

    public function windowStart(): string
    {
        return new DateTimeImmutable($this->today)->modify(sprintf('-%d days', $this->recentDays - 1))->format('Y-m-d');
    }

    public function fixedOffsetSeconds(): ?int
    {
        $zone = new DateTimeZone($this->timeZone);
        // PHP returns false for fixed-offset and abbreviation zones, unlike
        // the narrower getTransitions stub used by the static analyser.
        /** @var array<array-key, mixed>|false $transitions */
        $transitions = $zone->getTransitions();
        return $transitions === false ? $zone->getOffset(new DateTimeImmutable('@0')) : null;
    }

    /** @return array{today: string, timeZone: string, recentDays: int, loadMoreCount: int} */
    public function toArray(): array
    {
        return ['today' => $this->today, 'timeZone' => $this->timeZone, 'recentDays' => $this->recentDays, 'loadMoreCount' => $this->loadMoreCount];
    }
}
