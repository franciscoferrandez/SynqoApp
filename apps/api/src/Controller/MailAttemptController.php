<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Exception\MailAttemptNotFound;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Mail\MailAttemptStatusService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class MailAttemptController
{
    public function __construct(private MailAttemptStatusService $attempts) {}

    public function current(Request $request): JsonResponse
    {
        try {
            return $this->respond(['status' => $this->attempts->status($request->headers->get('X-Mail-Receipt'))], 200);
        } catch (MissingAccessCredential) {
            $response = $this->problem(401, 'Autenticación requerida', 'Se requiere el recibo del envío.');
            $response->headers->set('WWW-Authenticate', 'MailReceipt');

            return $response;
        } catch (MailAttemptNotFound) {
            return $this->problem(404, 'No encontrado', 'No encontramos este envío.');
        }
    }

    /** @param array<string, mixed> $body */
    private function respond(array $body, int $status): JsonResponse
    {
        $response = new JsonResponse($body, $status);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    private function problem(int $status, string $title, string $detail): JsonResponse
    {
        $response = new JsonResponse(['type' => 'about:blank', 'title' => $title, 'status' => $status, 'detail' => $detail], $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
