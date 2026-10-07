<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Team\CreationLimitPolicy;
use Symfony\Component\HttpFoundation\JsonResponse;

final readonly class PublicConfigurationController
{
    public function __construct(private bool $teamCreationEmailEnabled, private CreationLimitPolicy $creationLimitPolicy) {}

    public function __invoke(): JsonResponse
    {
        $response = new JsonResponse([
            'teamCreationEmailEnabled' => $this->teamCreationEmailEnabled,
            'teamCreationMaxTeams' => $this->creationLimitPolicy->maxTeams,
            'teamCreationWindowMinutes' => $this->creationLimitPolicy->windowMinutes,
        ]);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
