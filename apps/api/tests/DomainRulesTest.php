<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Team\ExpiryCalculator;
use App\Domain\Team\ParticipantName;
use App\Domain\Team\TeamDeletionPolicy;
use DateTimeImmutable;
use InvalidArgumentException;
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

    public function testDeletionPolicyAddsConfiguredDaysToEffectiveExpiryAndHonorsExactBoundary(): void
    {
        $policy = new TeamDeletionPolicy(new ExpiryCalculator());
        $activity = new DateTimeImmutable('2025-01-15T12:00:00+00:00');
        $deletesAt = $policy->deletesAt($activity, 'UTC');

        self::assertSame('2025-07-15T00:00:00+00:00', $deletesAt->format(DATE_ATOM));
        self::assertFalse($policy->isEligible($activity, 'UTC', $deletesAt->modify('-1 second')));
        self::assertTrue($policy->isEligible($activity, 'UTC', $deletesAt));
        self::assertTrue($policy->isEligible($activity, 'UTC', $deletesAt->modify('+1 second')));
    }

    public function testDeletionPolicyAcceptsConfiguredRetentionAndRejectsInvalidValues(): void
    {
        $expiry = new ExpiryCalculator();
        $activity = new DateTimeImmutable('2025-01-15T12:00:00+00:00');
        $configured = new TeamDeletionPolicy($expiry, '30');
        self::assertSame('2025-05-16T00:00:00+00:00', $configured->deletesAt($activity, 'UTC')->format(DATE_ATOM));

        foreach (['', '0', '-1', '1.5', 'abc'] as $invalid) {
            try {
                new TeamDeletionPolicy($expiry, $invalid);
                self::fail('Invalid retention values must be rejected.');
            } catch (InvalidArgumentException) {
                self::assertTrue(true);
            }
        }
    }
}
