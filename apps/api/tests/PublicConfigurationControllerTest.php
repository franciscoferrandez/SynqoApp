<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoAccessTokenDeriver;
use App\Application\Demo\DemoFixture;
use App\Application\Team\CreationLimitPolicy;
use App\Application\Team\TeamRepository;
use App\Controller\PublicConfigurationController;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

final class PublicConfigurationControllerTest extends TestCase
{
    public function testDemoMetadataIsOmittedOutsidePreproduction(): void
    {
        $teams = $this->createMock(TeamRepository::class);
        $teams->expects(self::never())->method('findByAccessVerifier');
        $controller = new PublicConfigurationController(false, new CreationLimitPolicy('development', '', ''), 'development', new DemoAccessTokenDeriver(str_repeat('s', 32)), new DemoFixture(), $teams, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid');

        $response = $controller();
        $payload = json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertArrayNotHasKey('demo', $payload);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testPreproductionPublishesOnlyCurrentDemoLinksAndNextUtcHour(): void
    {
        $deriver = new DemoAccessTokenDeriver(str_repeat('s', 32));
        $repository = $this->createMock(TeamRepository::class);
        $repository->expects(self::exactly(2))->method('findByAccessVerifier')->willReturnCallback(
            static function (string $hash) use ($deriver): ?array {
                return match ($hash) {
                    hash('sha256', $deriver->tokenFor('friends')) => ['id' => 'team-1', 'name' => 'La mesa del jueves'],
                    hash('sha256', $deriver->tokenFor('band')) => ['id' => 'team-2', 'name' => 'La banda del patio'],
                    default => null,
                };
            },
        );
        $controller = new PublicConfigurationController(false, new CreationLimitPolicy('preproduction', '', ''), 'preproduction', $deriver, new DemoFixture(), $repository, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid');

        $response = $controller();
        $payload = json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertSame('2026-10-08T11:00:00+00:00', $payload['demo']['nextResetAt']);
        self::assertSame(['La mesa del jueves', 'La banda del patio'], array_column($payload['demo']['teams'], 'name'));
        self::assertSame('https://example.invalid/e#t=' . $deriver->tokenFor('friends'), $payload['demo']['teams'][0]['accessUrl']);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testMissingDemoFixtureDoesNotPublishStaleLinks(): void
    {
        $repository = $this->createStub(TeamRepository::class);
        $repository->method('findByAccessVerifier')->willReturn(null);
        $controller = new PublicConfigurationController(false, new CreationLimitPolicy('preproduction', '', ''), 'preproduction', new DemoAccessTokenDeriver(str_repeat('s', 32)), new DemoFixture(), $repository, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid');

        $payload = json_decode((string) $controller()->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertSame([], $payload['demo']['teams']);
    }
}
