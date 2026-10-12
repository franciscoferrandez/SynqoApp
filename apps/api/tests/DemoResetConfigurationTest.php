<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoResetException;
use App\Application\Demo\DemoResetService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class DemoResetConfigurationTest extends KernelTestCase
{
    public function testSymfonyWiringDistinguishesAbsentFromExplicitlyEmptySelection(): void
    {
        $variables = ['SYNQO_DEPLOYMENT_ENV', 'DEMO_TEAM_IDS'];
        $saved = [];
        foreach ($variables as $name) {
            $saved[$name] = [$_SERVER[$name] ?? null, $_ENV[$name] ?? null, getenv($name)];
        }
        try {
            foreach ([null, ''] as $selection) {
                self::ensureKernelShutdown();
                $_SERVER['SYNQO_DEPLOYMENT_ENV'] = $_ENV['SYNQO_DEPLOYMENT_ENV'] = 'preproduction';
                putenv('SYNQO_DEPLOYMENT_ENV=preproduction');
                if ($selection === null) {
                    unset($_SERVER['DEMO_TEAM_IDS'], $_ENV['DEMO_TEAM_IDS']);
                    putenv('DEMO_TEAM_IDS');
                } else {
                    $_SERVER['DEMO_TEAM_IDS'] = $_ENV['DEMO_TEAM_IDS'] = $selection;
                    putenv('DEMO_TEAM_IDS=' . $selection);
                }
                self::bootKernel(['environment' => 'test']);
                $service = static::getContainer()->get(DemoResetService::class);
                if ($selection === null) {
                    try {
                        $service->reset();
                        self::fail('The missing variable must not become an empty selector.');
                    } catch (DemoResetException $error) {
                        self::assertStringContainsString('debe estar definida', $error->getMessage());
                    }
                } else {
                    self::assertSame([], $service->reset());
                }
                self::assertFalse(static::getContainer()->get(Connection::class)->isConnected());
            }
        } finally {
            self::ensureKernelShutdown();
            foreach ($saved as $name => [$server, $env, $process]) {
                unset($_SERVER[$name], $_ENV[$name]);
                if ($server !== null) {
                    $_SERVER[$name] = $server;
                }
                if ($env !== null) {
                    $_ENV[$name] = $env;
                }
                putenv($process === false ? $name : $name . '=' . $process);
            }
        }
    }
}
