<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Controller\TeamController;

#[ApiResource(operations: [
    new Post(uriTemplate: '/teams', controller: TeamController::class . '::create', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Get(uriTemplate: '/teams/current', controller: TeamController::class . '::current', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Post(uriTemplate: '/teams/current/participants', controller: TeamController::class . '::addParticipant', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class TeamOperations {}
