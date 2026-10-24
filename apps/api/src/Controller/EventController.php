<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Event\EventService;
use App\Application\Exception\EventConflict;
use App\Application\Exception\InvalidEventInput;
use App\Application\Exception\InvalidListCursor;
use App\Application\Exception\ListContextChanged;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\TeamService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class EventController
{
    public function __construct(private EventService $events, private TeamService $teams) {}

    public function list(Request $request): JsonResponse
    {
        return $this->execute($request, fn(): JsonResponse => $this->success($this->events->list($this->bearerToken($request), $request->query->all()['archivedCursor'] ?? null)));
    }

    public function calendar(Request $request): JsonResponse
    {
        return $this->execute($request, function () use ($request): JsonResponse {
            $from = $request->query->get('from');
            $to = $request->query->get('to');
            if (!is_string($from) || !is_string($to)) {
                throw new InvalidEventInput(['from', 'to']);
            }

            return $this->success($this->events->calendar($this->bearerToken($request), $from, $to));
        });
    }

    public function detail(Request $request, string $eventId): JsonResponse
    {
        return $this->execute($request, fn(): JsonResponse => $this->success($this->events->detail($this->bearerToken($request), $eventId)));
    }

    public function create(Request $request): JsonResponse
    {
        return $this->execute($request, function () use ($request): JsonResponse {
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            return $this->success($this->events->create(
                $this->bearerToken($request),
                $body['participantId'] ?? null,
                $body['title'] ?? null,
                $body['notes'] ?? null,
                $body['date'] ?? null,
                $body['status'] ?? null,
            ), 201);
        });
    }

    public function update(Request $request, string $eventId): JsonResponse
    {
        return $this->execute($request, function () use ($request, $eventId): JsonResponse {
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            return $this->success($this->events->update(
                $this->bearerToken($request),
                $eventId,
                $body['participantId'] ?? null,
                $body['title'] ?? null,
                $body['notes'] ?? null,
                $body['date'] ?? null,
                $body['status'] ?? null,
            ));
        });
    }

    public function reject(Request $request, string $eventId): JsonResponse
    {
        return $this->lifecycle($request, $eventId, 'reject');
    }

    public function recover(Request $request, string $eventId): JsonResponse
    {
        return $this->lifecycle($request, $eventId, 'recover');
    }

    private function lifecycle(Request $request, string $eventId, string $action): JsonResponse
    {
        return $this->execute($request, function () use ($request, $eventId, $action): JsonResponse {
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            $result = $action === 'reject'
                ? $this->events->reject($this->bearerToken($request), $eventId, $body['participantId'] ?? null, $body['disposition'] ?? null)
                : $this->events->recover($this->bearerToken($request), $eventId, $body['participantId'] ?? null);
            return $this->success($result);
        });
    }

    private function execute(Request $request, callable $work): JsonResponse
    {
        try {
            $this->teams->current($this->bearerToken($request));
            return $work();
        } catch (InvalidListCursor) {
            return $this->problem(400, 'El cursor de archivados no es válido.');
        } catch (ListContextChanged) {
            return $this->problem(409, 'El día o la zona del equipo han cambiado. Recarga la lista.', type: 'urn:synqo:problem:list-context-changed');
        } catch (InvalidEventInput $error) {
            return $this->problem(422, 'Revisa los datos del evento.', $error->fields);
        } catch (EventConflict) {
            return $this->problem(409, 'El evento cambió o ya no admite esta acción.', type: 'urn:synqo:problem:event-conflict');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo, evento o participante.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
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
            $data['violations'] = array_map(static fn(string $field): array => ['propertyPath' => $field, 'message' => 'Este valor no es válido.'], $fields);
        }
        $response = new JsonResponse($data, $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');
        return $response;
    }
}
