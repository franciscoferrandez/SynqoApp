<?php

declare(strict_types=1);

namespace App\Domain\Mail;

final class RecipientAddress
{
    private const int MAX_LENGTH = 254;

    public static function isValid(string $value): bool
    {
        $value = trim($value);

        return $value !== ''
            && strlen($value) <= self::MAX_LENGTH
            && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }
}
