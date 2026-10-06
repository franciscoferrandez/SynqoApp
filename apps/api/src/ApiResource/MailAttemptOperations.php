<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\MailAttemptController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/mail-attempts/current', controller: MailAttemptController::class . '::current', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class MailAttemptOperations {}
