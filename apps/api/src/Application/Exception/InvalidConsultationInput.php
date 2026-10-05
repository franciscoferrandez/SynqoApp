<?php

declare(strict_types=1);

namespace App\Application\Exception;

use RuntimeException;

final class InvalidConsultationInput extends RuntimeException
{
    /** @param list<string> $fields */
    public function __construct(public readonly array $fields)
    {
        parent::__construct('The provided consultation data is invalid.');
    }
}
