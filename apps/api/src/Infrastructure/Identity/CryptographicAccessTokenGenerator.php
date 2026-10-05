<?php

declare(strict_types=1);

namespace App\Infrastructure\Identity;

use App\Application\Team\AccessTokenGenerator;

final class CryptographicAccessTokenGenerator implements AccessTokenGenerator
{
    public function generate(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
