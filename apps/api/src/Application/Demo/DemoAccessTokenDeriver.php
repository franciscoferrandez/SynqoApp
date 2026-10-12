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

    public function tokenFor(string $logicalId, int $generation = 0): string
    {
        if (!$this->isConfigured() || $generation < 0) {
            throw new \RuntimeException('La clave de acceso demo no está configurada.');
        }

        $message = $generation === 0 ? 'synqo:demo:' . $logicalId : 'synqo:demo:' . $logicalId . ':' . $generation;
        return rtrim(strtr(base64_encode(hash_hmac('sha256', $message, $this->secret, true)), '+/', '-_'), '=');
    }
}
