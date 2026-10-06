<?php

declare(strict_types=1);

namespace App\Application\Mail;

interface TeamLinkMailer
{
    /** Single synchronous attempt; returns only when the transport confirms completion, throws otherwise. */
    public function send(string $recipient, string $teamName, string $accessUrl): void;
}
