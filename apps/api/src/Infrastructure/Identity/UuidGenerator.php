<?php

declare(strict_types=1);

namespace App\Infrastructure\Identity;

use App\Application\Team\IdentifierGenerator;
use Symfony\Component\Uid\Uuid;

final class UuidGenerator implements IdentifierGenerator
{
    public function generate(): string
    {
        return Uuid::v7()->toRfc4122();
    }
}
