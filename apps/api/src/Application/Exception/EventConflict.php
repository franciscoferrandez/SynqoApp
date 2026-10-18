<?php

declare(strict_types=1);

namespace App\Application\Exception;

use RuntimeException;

final class EventConflict extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The event is in an incompatible state.');
    }
}
