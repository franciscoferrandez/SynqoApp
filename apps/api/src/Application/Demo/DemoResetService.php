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
        if ($appEnvironment !== 'dev' || $deploymentEnvironment !== 'development' || !$this->repository->isLocalPostgreSql()) {
            throw new \RuntimeException('El reset demo requiere desarrollo local y una conexión PostgreSQL local permitida.');
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

    /** @return list<array{name: string, token: string}> */
    public function reset(): array
    {
        return $this->repository->replace($this->clock->now());
    }
}
