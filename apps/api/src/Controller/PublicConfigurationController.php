<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

final readonly class PublicConfigurationController
{
    public function __construct(private bool $teamCreationEmailEnabled) {}

    public function __invoke(): JsonResponse
    {
        $response = new JsonResponse(['teamCreationEmailEnabled' => $this->teamCreationEmailEnabled]);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
