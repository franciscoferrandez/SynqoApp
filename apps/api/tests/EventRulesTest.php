<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Event\EventRules;
use PHPUnit\Framework\TestCase;

final class EventRulesTest extends TestCase
{
    public function testAcceptsOptionalDateAndDefaultsToProvisional(): void
    {
        self::assertSame([], EventRules::violations('Ensayo', null, null, 'provisional', false));
        self::assertSame([], EventRules::violations('Concierto', 'Notas', '2020-02-29', 'definitive', true));
    }

    public function testRejectsInvalidLengthsDatesAndStatusDateCombinations(): void
    {
        self::assertContains('title', EventRules::violations(' ', null, null, 'provisional', false));
        self::assertContains('title', EventRules::violations(str_repeat('x', 251), null, null, 'provisional', false));
        self::assertContains('notes', EventRules::violations('Ensayo', str_repeat('x', 5001), null, 'provisional', false));
        self::assertContains('date', EventRules::violations('Ensayo', null, '2026-02-30', 'provisional', false));
        self::assertContains('date', EventRules::violations('Ensayo', null, '2026-1-02', 'provisional', false));
        self::assertContains('status', EventRules::violations('Ensayo', null, null, 'definitive', true));
        self::assertContains('status', EventRules::violations('Ensayo', null, null, 'rejected', false));
        self::assertContains('status', EventRules::violations('Ensayo', null, '2026-10-18', null, true));
    }
}
