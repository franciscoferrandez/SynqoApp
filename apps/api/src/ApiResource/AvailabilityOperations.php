<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use App\Controller\AvailabilityController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/teams/current/availability', controller: AvailabilityController::class . '::read', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/availability/{date}/participants/{participantId}', controller: AvailabilityController::class . '::write', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class AvailabilityOperations {}
