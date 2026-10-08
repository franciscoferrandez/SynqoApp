<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoAccessTokenDeriver;
use PHPUnit\Framework\TestCase;

final class DemoAccessTokenDeriverTest extends TestCase
{
    public function testDemoTokenIsStableSeparatedAndHasThirtyTwoDecodedBytes(): void
    {
        $deriver = new DemoAccessTokenDeriver(str_repeat('s', 32));
        $friends = $deriver->tokenFor('friends');

        self::assertSame($friends, $deriver->tokenFor('friends'));
        self::assertNotSame($friends, $deriver->tokenFor('band'));
        self::assertSame(32, strlen((string) base64_decode(strtr($friends, '-_', '+/') . str_repeat('=', (4 - strlen($friends) % 4) % 4), true)));
        self::assertMatchesRegularExpression('/^[A-Za-z0-9_-]{43}$/', $friends);
    }

    public function testShortSecretFailsClosed(): void
    {
        $deriver = new DemoAccessTokenDeriver(str_repeat('s', 31));

        self::assertFalse($deriver->isConfigured());
        $this->expectException(\RuntimeException::class);
        $deriver->tokenFor('friends');
    }
}
