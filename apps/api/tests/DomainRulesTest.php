<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Team\ExpiryCalculator;
use App\Domain\Team\ParticipantName;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class DomainRulesTest extends TestCase
{
    public function testParticipantNamesIgnoreAccentsCaseAndOuterSpaces(): void
    {
        self::assertSame(ParticipantName::normalize('  ÁLVARO '), ParticipantName::normalize('alvaro'));
        self::assertFalse(ParticipantName::isValid(str_repeat('a', 51)));
    }

    public function testExpiryUsesCalendarMonthsAndCarriesOverflowDays(): void
    {
        $expiry = new ExpiryCalculator();
        self::assertSame('2026-12-01T23:00:00+00:00', $expiry->expiresAt(new DateTimeImmutable('2026-08-31T12:00:00+02:00'), 'Europe/Madrid')->format(DATE_ATOM));
        self::assertSame('2027-03-02T23:00:00+00:00', $expiry->expiresAt(new DateTimeImmutable('2026-11-30T12:00:00+01:00'), 'Europe/Madrid')->format(DATE_ATOM));
    }
}
