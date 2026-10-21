<?php

declare(strict_types=1);

namespace App\Application\Consultation;

use App\Application\Exception\InvalidConsultationInput;
use App\Domain\Consultation\TextConsultationRules;
use Symfony\Component\Uid\Uuid;

final readonly class ConsultationEditInput
{
    /**
     * @param list<array{id: string, text: string}> $add
     * @param list<array{id: string, text: string}> $update
     * @param list<string> $remove
     * @param list<string> $confirmedRemovalOptionIds
     */
    private function __construct(
        public string $participantId,
        public ?string $title,
        public array $add,
        public array $update,
        public array $remove,
        public array $confirmedRemovalOptionIds,
    ) {}

    /** @param array<string, mixed> $body */
    public static function fromPayload(array $body): self
    {
        $fields = [];
        foreach (array_diff(array_keys($body), ['participantId', 'title', 'optionChanges', 'confirmedRemovalOptionIds']) as $field) {
            $fields[] = (string) $field;
        }
        $participantId = self::uuid($body['participantId'] ?? null);
        if ($participantId === null) {
            $fields[] = 'participantId';
        }
        $title = null;
        if (array_key_exists('title', $body)) {
            if (TextConsultationRules::violations($body['title'], ['Option']) !== []) {
                $fields[] = 'title';
            } else {
                $title = (string) $body['title'];
            }
        }
        $changes = $body['optionChanges'] ?? [];
        if (!is_array($changes) || ($changes !== [] && array_is_list($changes))) {
            $fields[] = 'optionChanges';
            $changes = [];
        }
        if (array_key_exists('optionChanges', $body) && $body['optionChanges'] === null) {
            $fields[] = 'optionChanges';
        }
        foreach (array_diff(array_keys($changes), ['add', 'update', 'remove']) as $key) {
            $fields[] = 'optionChanges.' . $key;
        }
        $add = self::textChanges($changes['add'] ?? [], 'optionChanges.add', $fields);
        $update = self::textChanges($changes['update'] ?? [], 'optionChanges.update', $fields);
        $remove = self::ids($changes['remove'] ?? [], 'optionChanges.remove', $fields);
        $confirmed = self::ids($body['confirmedRemovalOptionIds'] ?? [], 'confirmedRemovalOptionIds', $fields);
        foreach (['add', 'update', 'remove'] as $key) {
            if (array_key_exists($key, $changes) && $changes[$key] === null) {
                $fields[] = 'optionChanges.' . $key;
            }
        }
        if (array_key_exists('confirmedRemovalOptionIds', $body) && $body['confirmedRemovalOptionIds'] === null) {
            $fields[] = 'confirmedRemovalOptionIds';
        }
        $allIds = [...array_column($add, 'id'), ...array_column($update, 'id'), ...$remove];
        if (count(array_unique($allIds)) !== count($allIds)) {
            $fields[] = 'optionChanges';
        }
        if (array_diff($confirmed, $remove) !== []) {
            $fields[] = 'confirmedRemovalOptionIds';
        }
        if ($fields !== [] || $participantId === null) {
            throw new InvalidConsultationInput(array_values(array_unique($fields)));
        }

        return new self($participantId, $title, $add, $update, $remove, $confirmed);
    }

    /**
     * @param list<string> $fields
     * @return list<array{id: string, text: string}>
     */
    private static function textChanges(mixed $value, string $path, array &$fields): array
    {
        if (!is_array($value) || !array_is_list($value) || count($value) > TextConsultationRules::MAX_OPTIONS) {
            $fields[] = $path;
            return [];
        }
        $result = [];
        foreach ($value as $index => $entry) {
            if (!is_array($entry) || array_diff(array_keys($entry), ['id', 'text']) !== []) {
                $fields[] = $path . '.' . $index;
                continue;
            }
            $id = self::uuid($entry['id'] ?? null);
            $text = $entry['text'] ?? null;
            if ($id === null) {
                $fields[] = $path . '.' . $index . '.id';
            }
            if (TextConsultationRules::violations('Title', [$text]) !== []) {
                $fields[] = $path . '.' . $index . '.text';
            } elseif ($id !== null && is_string($text)) {
                $result[] = ['id' => $id, 'text' => $text];
            }
        }
        return $result;
    }

    /** @param list<string> $fields
     * @return list<string>
     */
    private static function ids(mixed $value, string $path, array &$fields): array
    {
        if (!is_array($value) || !array_is_list($value) || count($value) > TextConsultationRules::MAX_OPTIONS) {
            $fields[] = $path;
            return [];
        }
        $result = [];
        foreach ($value as $id) {
            $normalized = self::uuid($id);
            if ($normalized === null) {
                $fields[] = $path;
            } else {
                $result[] = $normalized;
            }
        }
        if (count(array_unique($result)) !== count($result)) {
            $fields[] = $path;
        }
        return $result;
    }

    private static function uuid(mixed $value): ?string
    {
        return is_string($value) && Uuid::isValid($value) ? Uuid::fromString($value)->toRfc4122() : null;
    }
}
