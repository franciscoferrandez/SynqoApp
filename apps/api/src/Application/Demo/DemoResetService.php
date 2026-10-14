<?php

declare(strict_types=1);

namespace App\Application\Demo;

use Psr\Clock\ClockInterface;

final readonly class DemoResetService
{
    public function __construct(
        private DemoResetRepository $repository,
        private ClockInterface $clock,
        private DemoAccessTokenDeriver $demoTokens,
    ) {}

    public function assertLocalProfile(string $appEnvironment, ?string $deploymentEnvironment): void
    {
        if ($appEnvironment !== 'dev' || !in_array($deploymentEnvironment, ['development', 'preproduction', 'production'], true) || !$this->repository->isLocalPostgreSql()) {
            throw new DemoResetException('La simulación local requiere APP_ENV=dev, un entorno conocido y PostgreSQL local permitido.');
        }
    }

    public function assertPreproductionProfile(
        string $appEnvironment,
        ?string $deploymentEnvironment,
        bool $resetEnabled,
        string $expectedDatabaseHost,
        ?string $railwayEnvironmentName,
    ): void {
        if (
            $appEnvironment !== 'prod'
            || $deploymentEnvironment !== 'preproduction'
            || !$resetEnabled
            || !$this->demoTokens->isConfigured()
            || !$this->repository->isPrivatePreproductionPostgreSql($expectedDatabaseHost, $railwayEnvironmentName)
        ) {
            throw new \RuntimeException('El perfil seguro de reset demo no está habilitado para este entorno.');
        }
    }

    public function assertProductionProfile(
        string $appEnvironment,
        ?string $deploymentEnvironment,
        bool $resetEnabled,
        string $expectedDatabaseHost,
    ): void {
        if (
            $appEnvironment !== 'prod'
            || $deploymentEnvironment !== 'production'
            || !$resetEnabled
            || !$this->demoTokens->isConfigured()
            || !$this->repository->isPrivateProductionPostgreSql($expectedDatabaseHost)
        ) {
            throw new DemoResetException('El perfil seguro de reset demo no está habilitado para producción.');
        }
    }

    /** @return list<array{name: string, token: string, id: string}> */
    public function reset(): array
    {
        return $this->repository->replace($this->clock->now());
    }

    /** @return list<array{name: string, token: string, id: string}> */
    public function initialize(bool $allowNonEmpty = false): array
    {
        return $this->repository->initialize($this->clock->now(), $allowNonEmpty);
    }
}
