<?php

declare(strict_types=1);

namespace App\Application\Demo;

use DateTimeImmutable;

interface DemoResetRepository
{
    /** @return list<array{name: string, token: string}> */
    public function replace(DateTimeImmutable $now): array;

    public function isLocalPostgreSql(): bool;
}
