<?php

declare(strict_types=1);

namespace App\Application\Demo;

final readonly class DemoAccessTokenDeriver
{
    public function __construct(private string $secret) {}

    public function isConfigured(): bool
    {
        return strlen($this->secret) >= 32;
    }

    public function tokenFor(string $logicalId): string
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('La clave de acceso demo no está configurada.');
        }

        return rtrim(strtr(base64_encode(hash_hmac('sha256', 'synqo:demo:' . $logicalId, $this->secret, true)), '+/', '-_'), '=');
    }
}
