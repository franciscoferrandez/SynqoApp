<?php

declare(strict_types=1);

namespace App\Domain\Consultation;

final class TextConsultationRules
{
    public const int MAX_OPTIONS = 10;
    public const int MAX_TITLE_LENGTH = 250;
    public const int MAX_OPTION_LENGTH = 50;

    /**
     * @param mixed $title
     * @param mixed $options
     * @return list<string>
     */
    public static function violations(mixed $title, mixed $options): array
    {
        $violations = [];
        if (!is_string($title) || self::isBlank($title) || mb_strlen($title) > self::MAX_TITLE_LENGTH) {
            $violations[] = 'title';
        }
        if (!is_array($options) || !array_is_list($options)) {
            return [...$violations, 'options'];
        }
        if (count($options) < 1 || count($options) > self::MAX_OPTIONS) {
            $violations[] = 'options';
        }

        $normalized = [];
        foreach ($options as $index => $option) {
            $path = 'options.' . $index;
            if (!is_string($option) || self::isBlank($option) || mb_strlen($option) > self::MAX_OPTION_LENGTH) {
                $violations[] = $path;
                continue;
            }
            $normalized[$index] = self::normalizeOption($option);
        }

        foreach ($normalized as $index => $value) {
            foreach ($normalized as $otherIndex => $otherValue) {
                if ($otherIndex < $index && $value === $otherValue) {
                    $violations[] = 'options.' . $otherIndex;
                    $violations[] = 'options.' . $index;
                }
            }
        }

        return array_values(array_unique($violations));
    }

    private static function normalizeOption(string $text): string
    {
        $trimmed = preg_replace('/^[\p{Z}\s]+|[\p{Z}\s]+$/u', '', $text) ?? trim($text);
        $decomposed = \Normalizer::normalize($trimmed, \Normalizer::FORM_D);
        $withoutMarks = preg_replace('/\p{Mn}+/u', '', $decomposed === false ? $trimmed : $decomposed);

        return mb_strtolower($withoutMarks ?? $trimmed);
    }

    private static function isBlank(string $text): bool
    {
        return preg_match('/^[\p{Z}\s]*$/u', $text) === 1;
    }
}
