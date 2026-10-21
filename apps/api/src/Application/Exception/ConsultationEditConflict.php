<?php

declare(strict_types=1);

namespace App\Application\Exception;

use RuntimeException;

final class ConsultationEditConflict extends RuntimeException
{
    /** @param array<string, mixed> $consultation */
    public function __construct(public readonly array $consultation)
    {
        parent::__construct('The current consultation no longer permits these option changes.');
    }
}
