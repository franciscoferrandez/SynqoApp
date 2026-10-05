<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Consultation\TextConsultationRules;
use PHPUnit\Framework\TestCase;

final class TextConsultationRulesTest extends TestCase
{
    public function testAllowsMinimumAndMaximumOptionCountsAndUnicodeLengthBoundaries(): void
    {
        self::assertSame([], TextConsultationRules::violations(str_repeat('é', 250), ['a']));
        self::assertSame([], TextConsultationRules::violations('Consulta', array_map(static fn(int $index): string => 'opción ' . $index, range(0, 9))));
    }

    public function testRejectsInvalidCountsBlankAndOversizedFields(): void
    {
        self::assertContains('title', TextConsultationRules::violations(' ', ['válida']));
        self::assertContains('options', TextConsultationRules::violations('Consulta', []));
        self::assertContains('options', TextConsultationRules::violations('Consulta', array_fill(0, 11, 'válida')));
        self::assertContains('options.0', TextConsultationRules::violations('Consulta', [' ']));
        self::assertContains('options.0', TextConsultationRules::violations('Consulta', [str_repeat('x', 51)]));
        self::assertContains('title', TextConsultationRules::violations(str_repeat('x', 251), ['válida']));
    }

    public function testDuplicateTextIgnoresCaseAccentsAndOuterWhitespaceButPreservesInteriorWhitespace(): void
    {
        $duplicates = TextConsultationRules::violations('Consulta', ['  CAFÉ ', 'café']);
        self::assertContains('options.0', $duplicates);
        self::assertContains('options.1', $duplicates);
        self::assertSame([], TextConsultationRules::violations('Consulta', ['dos palabras', 'dos  palabras']));
    }
}
