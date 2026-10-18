<?php

declare(strict_types=1);

namespace App\Application\Exception;

use RuntimeException;

final class InvalidEventInput extends RuntimeException
{
    /** @param list<string> $fields */
    public function __construct(public readonly array $fields)
    {
        parent::__construct('The provided event data is invalid.');
    }
}
