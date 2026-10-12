<?php

declare(strict_types=1);

namespace App\Application\Demo;

use DateTimeImmutable;

interface DemoResetRepository
{
    /** @return list<array{name: string, token: string, id: string}> */
    public function replace(DateTimeImmutable $now): array;

    /** @return list<array{name: string, token: string, id: string}> */
    public function initialize(DateTimeImmutable $now, bool $allowNonEmpty = false): array;

    public function isLocalPostgreSql(): bool;

    public function isPrivatePreproductionPostgreSql(string $expectedHost, ?string $railwayEnvironmentName): bool;
}
