<?php

declare(strict_types=1);

namespace App\Tests;

use App\Domain\Team\TeamDeletionPolicy;
use DateTimeImmutable;
use InvalidArgumentException;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class TeamDeletionConfigurationTest extends KernelTestCase
{
    private string|false $previousEnv;
    private ?string $previousServer;
    private ?string $previousEnvironment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->previousEnv = getenv('TEAM_DELETION_RETENTION_DAYS');
        $this->previousServer = $_SERVER['TEAM_DELETION_RETENTION_DAYS'] ?? null;
        $this->previousEnvironment = $_ENV['TEAM_DELETION_RETENTION_DAYS'] ?? null;
    }

    protected function tearDown(): void
    {
        $this->setValue($this->previousEnv === false ? null : $this->previousEnv);
        if ($this->previousServer === null) {
            unset($_SERVER['TEAM_DELETION_RETENTION_DAYS']);
        } else {
            $_SERVER['TEAM_DELETION_RETENTION_DAYS'] = $this->previousServer;
        }
        if ($this->previousEnvironment === null) {
            unset($_ENV['TEAM_DELETION_RETENTION_DAYS']);
        } else {
            $_ENV['TEAM_DELETION_RETENTION_DAYS'] = $this->previousEnvironment;
        }
        static::ensureKernelShutdown();
        parent::tearDown();
    }

    public function testDefaultAndExplicitEnvironmentValuesReachThePolicy(): void
    {
        $policy = $this->policyFor(null);
        $activity = new DateTimeImmutable('2025-01-15T12:00:00+00:00');
        self::assertSame('2025-07-15T00:00:00+00:00', $policy->deletesAt($activity, 'UTC')->format(DATE_ATOM));

        $policy = $this->policyFor('30');
        self::assertSame('2025-05-16T00:00:00+00:00', $policy->deletesAt($activity, 'UTC')->format(DATE_ATOM));
    }

    public function testInvalidEnvironmentValuesAreRejectedWhenConfigurationIsResolved(): void
    {
        foreach (['', '0', '-1', '1.5', 'abc'] as $value) {
            try {
                $this->policyFor($value);
                self::fail('Invalid retention values must fail when the policy is resolved.');
            } catch (InvalidArgumentException) {
                self::assertTrue(true);
            }
        }
    }

    private function policyFor(?string $value): TeamDeletionPolicy
    {
        static::ensureKernelShutdown();
        $this->setValue($value);
        static::bootKernel(['environment' => 'test']);
        return static::getContainer()->get(TeamDeletionPolicy::class);
    }

    private function setValue(?string $value): void
    {
        if ($value === null) {
            putenv('TEAM_DELETION_RETENTION_DAYS');
            unset($_SERVER['TEAM_DELETION_RETENTION_DAYS'], $_ENV['TEAM_DELETION_RETENTION_DAYS']);
            return;
        }
        putenv('TEAM_DELETION_RETENTION_DAYS=' . $value);
        $_SERVER['TEAM_DELETION_RETENTION_DAYS'] = $value;
        $_ENV['TEAM_DELETION_RETENTION_DAYS'] = $value;
    }
}
