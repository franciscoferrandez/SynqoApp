<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Exception\DuplicateParticipant;
use App\Application\Exception\CreationLimitExceeded;
use App\Application\Exception\InvalidTeamInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\TeamService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;

final readonly class TeamController
{
    public function __construct(private TeamService $teams, private KernelInterface $kernel) {}

    public function create(Request $request): JsonResponse
    {
        $body = $this->json($request);
        if ($body === null) {
            return $this->problem(400, 'JSON mal formado');
        }
        if (!is_string($body['name'] ?? null) || !is_string($body['firstParticipantName'] ?? null)) {
            return $this->problem(422, 'Revisa los nombres e inténtalo de nuevo.', ['name', 'firstParticipantName']);
        }
        if (array_key_exists('email', $body) && $body['email'] !== null && !is_string($body['email'])) {
            return $this->problem(422, 'Revisa el correo e inténtalo de nuevo.', ['email']);
        }
        try {
            $result = $this->teams->create(
                $body['name'],
                $body['firstParticipantName'],
                is_string($body['timeZone'] ?? null) ? $body['timeZone'] : null,
                is_string($body['email'] ?? null) ? $body['email'] : null,
                $this->clientIpSignal($request),
                $request->headers->get('X-Creation-Device'),
            );
            return $this->success($result, 201);
        } catch (CreationLimitExceeded) {
            return $this->problem(429, 'Has alcanzado el límite de creación de equipos. Inténtalo de nuevo más tarde.', type: 'urn:synqo:problem:creation-limit-exceeded');
        } catch (InvalidTeamInput $error) {
            return $this->problem(422, in_array('email', $error->fields, true) ? 'Revisa el correo e inténtalo de nuevo.' : 'Revisa los nombres e inténtalo de nuevo.', $error->fields);
        }
    }

    public function current(Request $request): JsonResponse
    {
        try {
            return $this->success($this->teams->current($this->bearerToken($request)));
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function addParticipant(Request $request): JsonResponse
    {
        $token = $this->bearerToken($request);
        try {
            $this->teams->current($token);
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
        $body = $this->json($request);
        if ($body === null) {
            return $this->problem(400, 'JSON mal formado');
        }
        if (!is_string($body['name'] ?? null)) {
            return $this->problem(422, 'Indica un nombre de hasta 50 caracteres.', ['name']);
        }
        try {
            return $this->success($this->teams->addParticipant($token, $body['name']), 201);
        } catch (InvalidTeamInput $error) {
            return $this->problem(422, 'Indica un nombre de hasta 50 caracteres.', $error->fields);
        } catch (DuplicateParticipant) {
            return $this->problem(409, 'Ese nombre ya está en uso en este equipo.', type: 'urn:synqo:problem:duplicate-participant');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    /** @return array<string, mixed>|null */
    private function json(Request $request): ?array
    {
        try {
            $value = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($value) ? $value : null;
        } catch (\JsonException) {
            return null;
        }
    }

    private function bearerToken(Request $request): ?string
    {
        $header = $request->headers->get('Authorization');
        return $header !== null && str_starts_with($header, 'Bearer ') ? substr($header, 7) : null;
    }

    private function clientIpSignal(Request $request): ?string
    {
        // In production, an untrusted peer may be an edge proxy. Only consume
        // forwarded client IPs when Symfony has an explicitly trusted proxy.
        if ($this->kernel->getEnvironment() === 'prod' && !$request->isFromTrustedProxy()) {
            return null;
        }

        return $request->getClientIp();
    }

    /** @param array<string, mixed> $body */
    private function success(array $body, int $status = 200): JsonResponse
    {
        $response = new JsonResponse($body, $status);
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }

    private function missingCredential(): JsonResponse
    {
        $response = $this->problem(401, 'Se requiere el enlace de acceso.');
        $response->headers->set('WWW-Authenticate', 'Bearer');
        return $response;
    }

    /** @param list<string> $fields */
    private function problem(int $status, string $detail, array $fields = [], string $type = 'about:blank'): JsonResponse
    {
        $titles = [400 => 'Solicitud incorrecta', 401 => 'Autenticación requerida', 404 => 'No encontrado', 409 => 'Conflicto', 410 => 'Equipo caducado', 422 => 'Datos inválidos', 429 => 'Límite de creación alcanzado'];
        $data = ['type' => $type, 'title' => $titles[$status] ?? 'Error', 'status' => $status, 'detail' => $detail];
        if ($fields !== []) {
            $data['violations'] = array_map(fn(string $field): array => ['propertyPath' => $field, 'message' => 'Este valor no es válido.'], $fields);
        }
        $response = new JsonResponse($data, $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }
}
