<?php

declare(strict_types=1);

namespace App\Application\Team;

interface AccessTokenGenerator
{
    public function generate(): string;
}
