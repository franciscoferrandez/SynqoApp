<?php

declare(strict_types=1);

namespace App\Application\Mail;

interface PayloadCipher
{
    public function encrypt(string $plaintext): string;

    public function decrypt(string $ciphertext): string;
}
