<?php

declare(strict_types=1);

namespace App\Application\Team;

interface IdentifierGenerator
{
    public function generate(): string;
}
