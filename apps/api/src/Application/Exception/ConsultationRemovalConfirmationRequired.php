<?php

declare(strict_types=1);

namespace App\Application\Exception;

use RuntimeException;

final class ConsultationRemovalConfirmationRequired extends RuntimeException
{
    /** @param list<array{id: string, text: string, count: int}|array{id: string, date: string, count: int}> $optionsWithVotes */
    public function __construct(public readonly array $optionsWithVotes)
    {
        parent::__construct('Removing voted options requires explicit confirmation.');
    }
}
