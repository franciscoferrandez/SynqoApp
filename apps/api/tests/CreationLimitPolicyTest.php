<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Team\CreationLimitPolicy;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CreationLimitPolicyTest extends TestCase
{
    #[DataProvider('environmentDefaults')]
    public function testEnvironmentDefaults(string $environment, int $maxTeams, int $windowMinutes): void
    {
        $policy = new CreationLimitPolicy($environment, '', '');

        self::assertSame($maxTeams, $policy->maxTeams);
        self::assertSame($windowMinutes, $policy->windowMinutes);
    }

    /** @return iterable<string, array{string, int, int}> */
    public static function environmentDefaults(): iterable
    {
        yield 'development' => ['development', 2, 60];
        yield 'preproduction' => ['preproduction', 2, 60];
        yield 'production' => ['production', 5, 120];
        yield 'test' => ['test', 2, 60];
    }

    public function testMaxAndWindowCanBeOverriddenIndependently(): void
    {
        $maxOverrideOnly = new CreationLimitPolicy('preproduction', '7', '');
        self::assertSame(7, $maxOverrideOnly->maxTeams);
        self::assertSame(60, $maxOverrideOnly->windowMinutes);

        $windowOverrideOnly = new CreationLimitPolicy('production', '', '30');
        self::assertSame(5, $windowOverrideOnly->maxTeams);
        self::assertSame(30, $windowOverrideOnly->windowMinutes);
    }

    #[DataProvider('invalidOverrides')]
    public function testInvalidOverridesAreRejected(string $max, string $window): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new CreationLimitPolicy('development', $max, $window);
    }

    /** @return iterable<string, array{string, string}> */
    public static function invalidOverrides(): iterable
    {
        yield 'zero max' => ['0', ''];
        yield 'negative max' => ['-1', ''];
        yield 'non-integer max' => ['2.5', ''];
        yield 'leading zero' => ['02', ''];
        yield 'zero window' => ['', '0'];
        yield 'non-integer window' => ['', '1.5'];
    }

    public function testUnknownEnvironmentIsRejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new CreationLimitPolicy('preview', '', '');
    }
}
