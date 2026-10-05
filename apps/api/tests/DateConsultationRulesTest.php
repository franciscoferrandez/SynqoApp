<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Consultation\DateConsultationRules;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class DateConsultationRulesTest extends TestCase
{
    public function testAcceptsStrictCivilDatesAndIanaTimeZones(): void
    {
        self::assertSame([], DateConsultationRules::violations('¿Qué día?', ['2026-10-05', '2026-10-06'], 'Europe/Madrid'));
    }

    public function testRejectsMalformedDatesDuplicatesInvalidZonesAndBoundaries(): void
    {
        $violations = DateConsultationRules::violations('Consulta', ['2026-02-30', '2026-1-01', '2026-02-30'], 'No/Such_Zone');
        self::assertContains('timeZone', $violations);
        self::assertContains('options.0', $violations);
        self::assertContains('options.1', $violations);
        self::assertContains('options.2', $violations);
        self::assertContains('title', DateConsultationRules::violations(str_repeat('x', 251), ['2026-10-05'], 'UTC'));
        self::assertContains('options', DateConsultationRules::violations('Consulta', [], 'UTC'));
        self::assertContains('options', DateConsultationRules::violations('Consulta', array_fill(0, 11, '2026-10-05'), 'UTC'));
    }

    public function testTodayUsesTheSubmittedZoneAndPastOptionsAreReportedByPosition(): void
    {
        $now = new DateTimeImmutable('2026-10-05T00:30:00+00:00');
        self::assertSame([], DateConsultationRules::pastDateViolations(['2026-10-04', '2026-10-05'], 'America/Los_Angeles', $now));
        self::assertSame(['options.0'], DateConsultationRules::pastDateViolations(['2026-10-04', '2026-10-05'], 'Europe/Madrid', $now));
        self::assertSame([], DateConsultationRules::pastDateViolations(['2026-10-05'], 'Europe/Madrid', new DateTimeImmutable('2026-10-04T23:00:00+00:00')));
    }
}
