<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_not_found_root', priority: -100)]
#[Route('/api/{path}', name: 'api_not_found_path', requirements: ['path' => '.+'], priority: -100)]
final class ApiNotFoundController
{
    public function __invoke(?string $path = null): JsonResponse
    {
        $response = new JsonResponse([
            'type' => 'about:blank',
            'title' => 'No encontrado',
            'status' => 404,
            'detail' => 'La operación solicitada no existe.',
        ], 404, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
