<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\EventController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/teams/current/events', controller: EventController::class . '::list', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Post(uriTemplate: '/teams/current/events', controller: EventController::class . '::create', input: false, output: false, read: false, deserialize: false, validate: false, write: false, status: 201),
    new Get(uriTemplate: '/teams/current/events/{eventId}', controller: EventController::class . '::detail', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/events/{eventId}', controller: EventController::class . '::update', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/events/{eventId}/rejection', controller: EventController::class . '::reject', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/events/{eventId}/recovery', controller: EventController::class . '::recover', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class EventOperations {}
