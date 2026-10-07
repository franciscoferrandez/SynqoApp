<?php

declare(strict_types=1);

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\PublicConfigurationController;

#[ApiResource(operations: [
    new Get(uriTemplate: '/configuration', controller: PublicConfigurationController::class, input: false, output: false, read: false, deserialize: false, validate: false, write: false),
])]
final class PublicConfigurationOperations {}
