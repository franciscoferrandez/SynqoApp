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
        $teams->expects(self::never())->method('findById');
        $controller = new PublicConfigurationController(new \App\Application\Configuration\FunctionalConfiguration('development'), new CreationLimitPolicy('development', '', ''), new DemoAccessTokenDeriver(str_repeat('s', 32)), new DemoFixture(), $teams, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid');

        $response = $controller();
        $payload = json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertArrayNotHasKey('demo', $payload);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testPreproductionPublishesOnlyCurrentDemoLinksAndNextUtcHour(): void
    {
        $deriver = new DemoAccessTokenDeriver(str_repeat('s', 32));
        $repository = $this->createMock(TeamRepository::class);
        $repository->expects(self::exactly(3))->method('findById')->willReturnCallback(
            static function (string $id) use ($deriver): ?array {
                return match ($id) {
                    '00000000-0000-4000-8000-000000000001' => ['id' => '00000000-0000-4000-8000-000000000001', 'name' => 'La mesa del jueves', 'demo_access_generation' => 2, 'access_verifier' => hash('sha256', $deriver->tokenFor('friends', 2))],
                    '00000000-0000-4000-8000-000000000002' => ['id' => '00000000-0000-4000-8000-000000000002', 'name' => 'La banda del patio', 'demo_access_generation' => 3, 'access_verifier' => hash('sha256', $deriver->tokenFor('band', 3))],
                    default => null,
                };
            },
        );
        $controller = new PublicConfigurationController(new \App\Application\Configuration\FunctionalConfiguration('preproduction', demoResetScheduleEnabled: 'true'), new CreationLimitPolicy('preproduction', '', ''), $deriver, new DemoFixture(), $repository, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid', '00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002');

        $response = $controller();
        $payload = json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertSame('2026-10-08T11:00:00+00:00', $payload['demo']['nextResetAt']);
        self::assertSame(['La mesa del jueves', 'La banda del patio'], array_column($payload['demo']['teams'], 'name'));
        self::assertSame('https://example.invalid/e#t=' . $deriver->tokenFor('friends', 2), $payload['demo']['teams'][0]['accessUrl']);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testPanelOverrideDoesNotImplyAScheduleAndConfigurationIsNotCached(): void
    {
        $repository = $this->createStub(TeamRepository::class);
        $controller = new PublicConfigurationController(new \App\Application\Configuration\FunctionalConfiguration('production', 'demo', 'true'), new CreationLimitPolicy('production', '', ''), new DemoAccessTokenDeriver(''), new DemoFixture(), $repository, new MockClock('2026-10-08T10:37:00Z'), 'http://localhost');
        $response = $controller();
        $payload = json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('demo', $payload['teamCreationEmailMode']);
        self::assertSame(['teams' => []], $payload['demo']);
        self::assertSame(5, $payload['teamCreationMaxTeams']);
        self::assertSame(120, $payload['teamCreationWindowMinutes']);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testMissingDemoFixtureDoesNotPublishStaleLinks(): void
    {
        $repository = $this->createStub(TeamRepository::class);
        $repository->method('findById')->willReturn(null);
        $controller = new PublicConfigurationController(new \App\Application\Configuration\FunctionalConfiguration('preproduction', demoResetScheduleEnabled: 'true'), new CreationLimitPolicy('preproduction', '', ''), new DemoAccessTokenDeriver(str_repeat('s', 32)), new DemoFixture(), $repository, new MockClock('2026-10-08T10:37:00Z'), 'https://example.invalid', '00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002');

        $payload = json_decode((string) $controller()->getContent(), true, flags: JSON_THROW_ON_ERROR);

        self::assertSame([], $payload['demo']['teams']);
    }
}
