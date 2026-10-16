<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Availability\DailyAvailability;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class DailyAvailabilityTest extends TestCase
{
    /**
     * @param list<string> $states
     * @param array{worst: ?string, median: ?string, mostFrequent: ?string} $expected
     */
    #[DataProvider('cases')]
    public function testSummaryRules(array $states, array $expected): void
    {
        $marks = array_map(static fn(string $state, int $index): array => [
            'participantId' => (string) $index,
            'participantName' => 'Persona',
            'state' => $state,
        ], $states, array_keys($states));
        $day = DailyAvailability::day('2026-10-16', $marks);
        self::assertSame($expected, $day['summaryStates']);
        self::assertSame($expected['worst'], $day['state']);
        self::assertSame(count($marks), array_sum($day['counts']));
        self::assertSame($marks, $day['marks']);
    }

    /** @return iterable<string, array{list<string>, array{worst: ?string, median: ?string, mostFrequent: ?string}}> */
    public static function cases(): iterable
    {
        yield 'sin marcas' => [[], ['worst' => null, 'median' => null, 'mostFrequent' => null]];
        yield 'una marca' => [['maybe'], ['worst' => 'maybe', 'median' => 'maybe', 'mostFrequent' => 'maybe']];
        yield 'extremos' => [['available', 'unavailable'], ['worst' => 'unavailable', 'median' => 'maybe', 'mostFrequent' => 'available']];
        yield 'quizá y disponible' => [['maybe', 'available'], ['worst' => 'maybe', 'median' => 'available', 'mostFrequent' => 'available']];
        yield 'quizá y no disponible' => [['unavailable', 'maybe'], ['worst' => 'unavailable', 'median' => 'maybe', 'mostFrequent' => 'maybe']];
        yield 'empate triple' => [['available', 'maybe', 'unavailable'], ['worst' => 'unavailable', 'median' => 'maybe', 'mostFrequent' => 'available']];
        yield 'par con extremos centrales' => [['unavailable', 'unavailable', 'available', 'available'], ['worst' => 'unavailable', 'median' => 'maybe', 'mostFrequent' => 'available']];
        yield 'frecuencia sin empate' => [['available', 'maybe', 'maybe', 'unavailable'], ['worst' => 'unavailable', 'median' => 'maybe', 'mostFrequent' => 'maybe']];
    }
}
