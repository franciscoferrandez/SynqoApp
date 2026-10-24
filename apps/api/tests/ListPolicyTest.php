<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Exception\InvalidListCursor;
use App\Application\Exception\ListContextChanged;
use App\Application\Listing\ListCursor;
use App\Application\Listing\ListPolicy;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class ListPolicyTest extends TestCase
{
    public function testCivilWindowAndAlternativeParametersAcrossDst(): void
    {
        $policy = new ListPolicy(3, 2);
        foreach (['2026-10-25T00:30:00Z', '2026-10-25T01:30:00Z'] as $at) {
            $context = $policy->context(new DateTimeImmutable($at), 'Europe/Madrid');
            self::assertSame(['today' => '2026-10-25', 'timeZone' => 'Europe/Madrid', 'recentDays' => 3, 'loadMoreCount' => 2], $context->toArray());
            self::assertSame('2026-10-23', $context->windowStart());
        }
        self::assertSame('2026-10-26', $policy->context(new DateTimeImmutable('2026-10-25T23:00:00Z'), 'Europe/Madrid')->today);
    }

    public function testCursorRoundTripsAliasAndOffsetZones(): void
    {
        $codec = new ListCursor();
        foreach (['US/Eastern', '+01:00', 'UTC'] as $zone) {
            $context = new ListPolicy()->context(new DateTimeImmutable('2026-10-25T00:30:00Z'), $zone);
            $frontier = ['date' => $context->windowStart(), 'id' => null];
            self::assertSame($frontier, $codec->decode($codec->encode('consultations', 'team', $context, $frontier), 'consultations', 'team', $context));
        }
    }

    public function testCursorRejectsForeignResource(): void
    {
        $context = new ListPolicy()->context(new DateTimeImmutable('2026-10-25T00:30:00Z'), 'UTC');
        $codec = new ListCursor();
        $cursor = $codec->encode('events', 'team', $context, ['date' => $context->windowStart(), 'id' => null]);
        $this->expectException(InvalidListCursor::class);
        $codec->decode($cursor, 'consultations', 'team', $context);
    }

    public function testCursorRejectsChangedDay(): void
    {
        $policy = new ListPolicy();
        $context = $policy->context(new DateTimeImmutable('2026-10-25T00:30:00Z'), 'UTC');
        $codec = new ListCursor();
        $cursor = $codec->encode('consultations', 'team', $context, ['date' => $context->windowStart(), 'id' => null]);
        $this->expectException(ListContextChanged::class);
        $codec->decode($cursor, 'consultations', 'team', $policy->context(new DateTimeImmutable('2026-10-26T00:30:00Z'), 'UTC'));
    }
}
