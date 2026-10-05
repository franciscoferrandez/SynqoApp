<?php

declare(strict_types=1);

namespace App\Domain\Team;

final class ParticipantName
{
    public static function normalize(string $name): string
    {
        $trimmed = trim($name);
        $decomposed = \Normalizer::normalize($trimmed, \Normalizer::FORM_D);
        $withoutMarks = preg_replace('/\\p{Mn}+/u', '', $decomposed === false ? $trimmed : $decomposed);
        return mb_strtolower($withoutMarks ?? $trimmed);
    }
    public static function isValid(string $name): bool
    {
        return trim($name) !== '' && mb_strlen($name) <= 50;
    }
}
