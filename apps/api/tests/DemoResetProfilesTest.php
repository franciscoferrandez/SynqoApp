<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoAccessTokenDeriver;
use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoResetException;
use App\Application\Demo\DemoResetRepository;
use App\Application\Demo\DemoResetService;
use App\Application\Team\IdentifierGenerator;
use App\Infrastructure\Console\ResetDemoCommand;
use App\Infrastructure\Persistence\OrmDemoResetRepository;
use Doctrine\DBAL\DriverManager;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Console\Tester\CommandTester;

final class DemoResetProfilesTest extends TestCase
{
    public function testLocalSimulationRequiresLocalPostgresForEveryEnvironment(): void
    {
        foreach (['development', 'preproduction', 'production'] as $environment) {
            foreach ([true, false] as $local) {
                $repository = $this->createStub(DemoResetRepository::class);
                $repository->method('isLocalPostgreSql')->willReturn($local);
                $service = new DemoResetService($repository, new MockClock(), new DemoAccessTokenDeriver(str_repeat('k', 32)));
                try {
                    $service->assertLocalProfile('dev', $environment);
                    self::assertTrue($local);
                } catch (DemoResetException) {
                    self::assertFalse($local);
                }
            }
        }
    }

    public function testProductionRequiresAllGuardsButNoProviderVariable(): void
    {
        foreach ([['prod', 'production', true, true, true], ['dev', 'production', true, true, true], ['prod', 'preproduction', true, true, true], ['prod', 'production', false, true, true], ['prod', 'production', true, false, true], ['prod', 'production', true, true, false]] as $index => [$app, $environment, $enabled, $secret, $host]) {
            $repository = $this->createStub(DemoResetRepository::class);
            $repository->method('isPrivateProductionPostgreSql')->willReturn($host);
            $service = new DemoResetService($repository, new MockClock(), new DemoAccessTokenDeriver($secret ? str_repeat('k', 32) : ''));
            try {
                $service->assertProductionProfile($app, $environment, $enabled, '10.2.3.4');
                self::assertSame(0, $index);
            } catch (DemoResetException) {
                self::assertNotSame(0, $index);
            }
        }
    }

    public function testProductionHostGuardRejectsPublicReservedLocalAndMismatchedHosts(): void
    {
        foreach (['10.2.3.4' => true, '172.16.0.2' => true, '172.31.255.254' => true, '192.168.0.2' => true, 'fd12::1' => true, 'fc00::2' => true, '127.0.0.2' => false, '::1' => false, '169.254.2.3' => false, 'fe80::1' => false, '100.64.0.1' => false, '224.0.0.1' => false, '8.8.8.8' => false, '2001:db8::1' => false, 'localhost' => false, 'database' => false, '' => false] as $host => $expected) {
            $connection = DriverManager::getConnection(['driver' => 'pdo_pgsql', 'host' => $host, 'serverVersion' => '18']);
            $registry = $this->createStub(ManagerRegistry::class);
            $registry->method('getConnection')->willReturn($connection);
            $repository = new OrmDemoResetRepository($registry, new DemoFixture(), $this->createStub(IdentifierGenerator::class), new DemoAccessTokenDeriver(str_repeat('k', 32)), 'production', '');
            self::assertSame($expected, $repository->isPrivateProductionPostgreSql($host), $host);
            self::assertFalse($repository->isPrivateProductionPostgreSql('another-host'));
            self::assertFalse($connection->isConnected());
        }
    }

    public function testAutomationRequiresBothFlagsAndInteractiveForceStillAsks(): void
    {
        foreach ([[], ['--force' => true], ['--no-interaction' => true], ['--force' => true, '--no-interaction' => true]] as $arguments) {
            $repository = $this->createMock(DemoResetRepository::class);
            $repository->method('isLocalPostgreSql')->willReturn(true);
            $authorized = count($arguments) === 2;
            $repository->expects($authorized ? self::once() : self::never())->method('replace')->willReturn([]);
            $service = new DemoResetService($repository, new MockClock(), new DemoAccessTokenDeriver(str_repeat('k', 32)));
            $tester = $this->tester(new ResetDemoCommand($service, 'dev', 'production', 'http://localhost', false, '', null));
            self::assertSame($authorized ? 0 : 1, $tester->execute($arguments, ['interactive' => false]));
            self::assertStringContainsString('Entorno de destino: production', $tester->getDisplay());
        }
        foreach (['development' => 'green', 'preproduction' => '#ff8800', 'production' => 'red'] as $environment => $color) {
            $repository = $this->createMock(DemoResetRepository::class);
            $repository->method('isLocalPostgreSql')->willReturn(true);
            $repository->expects(self::never())->method('replace');
            $service = new DemoResetService($repository, new MockClock(), new DemoAccessTokenDeriver(str_repeat('k', 32)));
            $tester = $this->tester(new ResetDemoCommand($service, 'dev', $environment, 'http://localhost', false, '', null));
            $tester->setInputs(['no']);
            self::assertSame(0, $tester->execute(['--force' => true], ['interactive' => true, 'decorated' => true]));
            self::assertStringContainsString('Reset cancelado', $tester->getDisplay());
            self::assertStringContainsString($environment, $tester->getDisplay());
            self::assertStringContainsString("\033[", $tester->getDisplay());
        }
    }    private function tester(ResetDemoCommand $command): CommandTester
    {
        $application = new \Symfony\Component\Console\Application();
        $application->addCommand($command);
        return new CommandTester($command);
    }


}
