<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Controller\ConsultationController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/teams/current/consultations', controller: ConsultationController::class . '::list', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Post(uriTemplate: '/teams/current/consultations', controller: ConsultationController::class . '::create', input: false, output: false, read: false, deserialize: false, validate: false, write: false, status: 201),
])]
final class ConsultationOperations {}
