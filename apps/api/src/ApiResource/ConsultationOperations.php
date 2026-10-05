<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\ConsultationController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/teams/current/consultations', controller: ConsultationController::class . '::list', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Post(uriTemplate: '/teams/current/consultations', controller: ConsultationController::class . '::create', input: false, output: false, read: false, deserialize: false, validate: false, write: false, status: 201),
    new Get(uriTemplate: '/teams/current/consultations/{consultationId}', controller: ConsultationController::class . '::detail', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/consultations/{consultationId}/votes/{participantId}/options/{optionId}', controller: ConsultationController::class . '::vote', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
    new Put(uriTemplate: '/teams/current/consultations/{consultationId}/resolution', controller: ConsultationController::class . '::resolve', input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class ConsultationOperations {}
