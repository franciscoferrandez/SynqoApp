<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Consultation\ConsultationService;
use App\Application\Exception\InvalidConsultationInput;
use App\Application\Exception\ConsultationClosed;
use App\Application\Exception\ConsultationEditConflict;
use App\Application\Exception\ConsultationRemovalConfirmationRequired;
use App\Application\Exception\EventConflict;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Exception\InvalidListCursor;
use App\Application\Exception\ListContextChanged;
use App\Application\Team\TeamService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class ConsultationController
{
    public function __construct(private ConsultationService $consultations, private TeamService $teams) {}

    public function list(Request $request): JsonResponse
    {
        try {
            return $this->success($this->consultations->list($this->bearerToken($request), $request->query->all()['archivedCursor'] ?? null));
        } catch (InvalidListCursor) {
            return $this->problem(400, 'El cursor de archivadas no es válido.');
        } catch (ListContextChanged) {
            return $this->problem(409, 'El día o la zona del equipo han cambiado. Recarga la lista.', type: 'urn:synqo:problem:list-context-changed');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function create(Request $request): JsonResponse
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
            return $this->problem(400, 'JSON mal formado.');
        }
        try {
            $created = $this->consultations->create($token, $body['participantId'] ?? null, $body['title'] ?? null, $body['options'] ?? null, $body['type'] ?? null, $body['timeZone'] ?? null, $body['eventId'] ?? null, array_key_exists('createEvent', $body) ? $body['createEvent'] : false);
            return $this->success($created, 201);
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa el tipo, el título, la zona horaria y las opciones.', $error->fields);
        } catch (EventConflict) {
            return $this->eventConflict();
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo o participante.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function detail(Request $request, string $consultationId): JsonResponse
    {
        try {
            return $this->success($this->consultations->detail($this->bearerToken($request), $consultationId));
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos esta consulta.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function edit(Request $request, string $consultationId): JsonResponse
    {
        $token = $this->bearerToken($request);
        try {
            $this->teams->current($token);
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            return $this->success($this->consultations->edit($token, $consultationId, $body));
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa el título y los cambios de opciones.', $error->fields);
        } catch (ConsultationEditConflict $error) {
            return $this->problem(409, 'La consulta ha cambiado o alguna opción ya tiene votos. Revisa los datos actuales.', type: 'urn:synqo:problem:consultation-edit-conflict', extensions: ['consultation' => $error->consultation]);
        } catch (ConsultationRemovalConfirmationRequired $error) {
            return $this->problem(409, 'Confirma la retirada de las opciones y todos sus votos.', type: 'urn:synqo:problem:consultation-removal-confirmation-required', extensions: ['optionsWithVotes' => $error->optionsWithVotes]);
        } catch (ConsultationClosed) {
            return $this->problem(409, 'Esta consulta ya está cerrada.', type: 'urn:synqo:problem:consultation-closed');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos esta consulta o participante.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function setEvent(Request $request, string $consultationId): JsonResponse
    {
        $token = $this->bearerToken($request);
        try {
            $this->teams->current($token);
            $body = $this->json($request);
            if ($body === null || !array_key_exists('eventId', $body)) {
                return $this->problem(400, 'Indica el evento o null para retirar el vínculo.');
            }
            return $this->success($this->consultations->setEvent($token, $consultationId, $body['eventId']));
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa el evento elegido.', $error->fields);
        } catch (EventConflict) {
            return $this->eventConflict();
        } catch (ConsultationClosed) {
            return $this->problem(409, 'Esta consulta ya está cerrada.', type: 'urn:synqo:problem:consultation-closed');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos la consulta o el evento.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function vote(Request $request, string $consultationId, string $participantId, string $optionId): JsonResponse
    {
        $token = $this->bearerToken($request);
        try {
            $this->teams->current($token);
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            return $this->success($this->consultations->vote($token, $consultationId, $participantId, $optionId, $body['selected'] ?? null));
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa el estado de la opción.', $error->fields);
        } catch (ConsultationClosed) {
            return $this->problem(409, 'Esta consulta ya está cerrada.', type: 'urn:synqo:problem:consultation-closed');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos esta consulta, participante u opción.');
        } catch (TeamExpired) {
            return $this->problem(410, 'Este equipo ha caducado.');
        }
    }

    public function resolve(Request $request, string $consultationId): JsonResponse
    {
        $token = $this->bearerToken($request);
        try {
            $this->teams->current($token);
            $body = $this->json($request);
            if ($body === null) {
                return $this->problem(400, 'JSON mal formado.');
            }
            return $this->success($this->consultations->resolve($token, $consultationId, $body['participantId'] ?? null, $body['status'] ?? null, $body['acceptedOptionIds'] ?? null, array_key_exists('eventId', $body), $body['eventId'] ?? null, $body['expectedEventVersion'] ?? null));
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa la resolución.', $error->fields);
        } catch (EventConflict) {
            return $this->eventConflict();
        } catch (ConsultationClosed) {
            return $this->problem(409, 'Esta consulta ya tiene otra resolución.', type: 'urn:synqo:problem:consultation-closed');
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos esta consulta, participante u opción.');
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

    private function eventConflict(): JsonResponse
    {
        return $this->problem(409, 'El evento ha cambiado o ya no admite este vínculo. Revisa su estado antes de confirmar.', type: 'urn:synqo:problem:event-conflict');
    }

    /** @param list<string> $fields
     * @param array<string, mixed> $extensions
     */
    private function problem(int $status, string $detail, array $fields = [], string $type = 'about:blank', array $extensions = []): JsonResponse
    {
        $titles = [400 => 'Solicitud incorrecta', 401 => 'Autenticación requerida', 404 => 'No encontrado', 409 => 'Conflicto', 410 => 'Equipo caducado', 422 => 'Datos inválidos'];
        $data = ['type' => $type, 'title' => $titles[$status] ?? 'Error', 'status' => $status, 'detail' => $detail];
        if ($fields !== []) {
            $data['violations'] = array_map(static fn(string $field): array => ['propertyPath' => $field, 'message' => 'Este valor no es válido.'], $fields);
        }
        $response = new JsonResponse($data + $extensions, $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
