<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Exception\DuplicateParticipant;
use App\Application\Exception\InvalidTeamInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Availability\AvailabilityService;
use App\Application\Team\TeamService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class AvailabilityController
{
    public function __construct(private AvailabilityService $availability, private TeamService $teams) {}

    public function read(Request $request): JsonResponse
    {
        return $this->execute($request, function () use ($request): JsonResponse {
            $from = $request->query->all()['from'] ?? null;
            $to = $request->query->all()['to'] ?? null;
            if (!is_string($from) || !is_string($to)) {
                return $this->problem(400, 'Indica un intervalo de fechas válido.');
            }
            try {
                return $this->success($this->availability->read($this->bearerToken($request), $from, $to));
            } catch (InvalidTeamInput) {
                return $this->problem(400, 'Indica un intervalo de hasta 42 días.');
            }
        });
    }

    public function write(Request $request, string $date, string $participantId): JsonResponse
    {
        return $this->execute($request, function () use ($request, $date, $participantId): JsonResponse {
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado');
            }
            if (array_key_exists('timeZone', $body) && !is_string($body['timeZone'])) {
                return $this->problem(422, 'Indica una zona horaria válida.', ['timeZone']);
            }
            if (!array_key_exists('state', $body)) {
                return $this->problem(422, 'Indica un estado de disponibilidad.', ['state']);
            }
            return $this->success($this->availability->write($this->bearerToken($request), $date, $participantId, $body['state'], $body['timeZone'] ?? null));
        });
    }

    private function execute(Request $request, callable $work): JsonResponse
    {
        try {
            $this->teams->current($this->bearerToken($request));
            return $work();
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        } catch (InvalidTeamInput $error) {
            return $this->problem(422, 'Revisa la fecha, el estado y la zona horaria.', $error->fields);
        }
    }

    /** @return array<string, mixed>|null */
    private function json(Request $request): ?array
    {
        try {
            $value = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            return is_array($value) && str_starts_with(ltrim($request->getContent()), '{') ? $value : null;
        } catch (\JsonException) {
            return null;
        }
    }

    private function bearerToken(Request $request): ?string
    {
        $header = $request->headers->get('Authorization');
        return $header !== null && str_starts_with($header, 'Bearer ') ? substr($header, 7) : null;
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
        $titles = [400 => 'Solicitud incorrecta', 401 => 'Autenticación requerida', 404 => 'No encontrado', 409 => 'Conflicto', 410 => 'Equipo caducado', 422 => 'Datos inválidos'];
        $data = ['type' => $type, 'title' => $titles[$status] ?? 'Error', 'status' => $status, 'detail' => $detail];
        if ($fields !== []) {
            $data['violations'] = array_map(fn(string $field): array => ['propertyPath' => $field, 'message' => 'Este valor no es válido.'], $fields);
        }
        $response = new JsonResponse($data, $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }
}
