<?php

declare(strict_types=1);

namespace App\Application\Listing;

use App\Application\Exception\InvalidListCursor;
use App\Application\Exception\ListContextChanged;
use App\Domain\Availability\DailyAvailability;
use Symfony\Component\Uid\Uuid;

final readonly class ListCursor
{
    /** @param array{date: string, id: string|null} $frontier */
    public function encode(string $resource, string $teamId, ListContext $context, array $frontier): string
    {
        return rtrim(strtr(base64_encode(json_encode(['version' => 1, 'resource' => $resource, 'team' => $teamId, 'context' => $context->toArray(), 'frontier' => $frontier], JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
    }

    /** @return array{date: string, id: string|null} */
    public function decode(mixed $cursor, string $resource, string $teamId, ListContext $context): array
    {
        if (!is_string($cursor) || $cursor === '' || strlen($cursor) > 2048 || preg_match('/^[A-Za-z0-9_-]+$/D', $cursor) !== 1) {
            throw new InvalidListCursor();
        }
        try {
            $decoded = base64_decode(strtr($cursor, '-_', '+/'), true);
            $value = $decoded === false ? null : json_decode($decoded, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new InvalidListCursor();
        }
        if (!is_array($value) || ($value['version'] ?? null) !== 1 || ($value['resource'] ?? null) !== $resource || ($value['team'] ?? null) !== $teamId || !is_array($value['context'] ?? null) || !is_array($value['frontier'] ?? null)) {
            throw new InvalidListCursor();
        }
        $stored = $value['context'];
        $frontier = $value['frontier'];
        if (!is_string($stored['today'] ?? null) || !DailyAvailability::validDate($stored['today']) || !is_string($stored['timeZone'] ?? null) || !$this->validTimeZone($stored['timeZone']) || ($stored['recentDays'] ?? null) !== $context->recentDays || ($stored['loadMoreCount'] ?? null) !== $context->loadMoreCount || !is_string($frontier['date'] ?? null) || !DailyAvailability::validDate($frontier['date']) || !array_key_exists('id', $frontier) || ($frontier['id'] !== null && (!is_string($frontier['id']) || !Uuid::isValid($frontier['id'])))) {
            throw new InvalidListCursor();
        }
        if ($stored['today'] !== $context->today || $stored['timeZone'] !== $context->timeZone) {
            throw new ListContextChanged();
        }
        if ($frontier['date'] > $context->windowStart() || ($frontier['id'] === null && $frontier['date'] !== $context->windowStart()) || ($frontier['id'] !== null && $frontier['date'] >= $context->windowStart())) {
            throw new InvalidListCursor();
        }

        return ['date' => $frontier['date'], 'id' => $frontier['id']];
    }

    private function validTimeZone(string $timeZone): bool
    {
        try {
            new \DateTimeZone($timeZone);
            return true;
        } catch (\Exception) {
            return false;
        }
    }
}
