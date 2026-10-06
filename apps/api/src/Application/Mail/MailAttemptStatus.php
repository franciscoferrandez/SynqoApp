<?php

declare(strict_types=1);

namespace App\Application\Mail;

enum MailAttemptStatus: string
{
    case Pending = 'pending';
    case Started = 'started';
    case Succeeded = 'succeeded';
    case Failed = 'failed';

    /** The public contract only distinguishes pending from the two final outcomes. */
    public function publicValue(): string
    {
        return match ($this) {
            self::Pending, self::Started => 'pending',
            self::Succeeded => 'succeeded',
            self::Failed => 'failed',
        };
    }
}
