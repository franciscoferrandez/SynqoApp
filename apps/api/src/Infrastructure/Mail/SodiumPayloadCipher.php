<?php

declare(strict_types=1);

namespace App\Infrastructure\Mail;

use App\Application\Mail\PayloadCipher;

final readonly class SodiumPayloadCipher implements PayloadCipher
{
    public function __construct(private string $encodedKey) {}

    public function encrypt(string $plaintext): string
    {
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

        return base64_encode($nonce . sodium_crypto_secretbox($plaintext, $nonce, $this->key()));
    }

    public function decrypt(string $ciphertext): string
    {
        $raw = base64_decode($ciphertext, true);
        if ($raw === false || strlen($raw) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
            throw new \RuntimeException('Invalid mail payload.');
        }
        $plaintext = sodium_crypto_secretbox_open(
            substr($raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES),
            substr($raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES),
            $this->key(),
        );
        if ($plaintext === false) {
            throw new \RuntimeException('Invalid mail payload.');
        }

        return $plaintext;
    }

    private function key(): string
    {
        $key = base64_decode($this->encodedKey, true);
        if ($key === false || strlen($key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) {
            throw new \RuntimeException('MAIL_EVENT_KEY must be a base64-encoded 32-byte key.');
        }

        return $key;
    }
}
