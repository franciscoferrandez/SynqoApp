<?php

declare(strict_types=1);

namespace App\Controller;

use App\Application\Consultation\ConsultationService;
use App\Application\Exception\InvalidConsultationInput;
use App\Application\Exception\MissingAccessCredential;
use App\Application\Exception\TeamExpired;
use App\Application\Exception\TeamNotFound;
use App\Application\Team\TeamService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final readonly class ConsultationController
{
    public function __construct(private ConsultationService $consultations, private TeamService $teams) {}

    public function list(Request $request): JsonResponse
    {
        try {
            return $this->success($this->consultations->list($this->bearerToken($request)));
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
            $created = $this->consultations->create($token, $body['participantId'] ?? null, $body['title'] ?? null, $body['options'] ?? null, $body['type'] ?? null, $body['timeZone'] ?? null);
            return $this->success($created, 201);
        } catch (InvalidConsultationInput $error) {
            return $this->problem(422, 'Revisa el tipo, el título, la zona horaria y las opciones.', $error->fields);
        } catch (MissingAccessCredential) {
            return $this->missingCredential();
        } catch (TeamNotFound) {
            return $this->problem(404, 'No encontramos este equipo o participante.');
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
    private function problem(int $status, string $detail, array $fields = []): JsonResponse
    {
        $titles = [400 => 'Solicitud incorrecta', 401 => 'Autenticación requerida', 404 => 'No encontrado', 410 => 'Equipo caducado', 422 => 'Datos inválidos'];
        $data = ['type' => 'about:blank', 'title' => $titles[$status] ?? 'Error', 'status' => $status, 'detail' => $detail];
        if ($fields !== []) {
            $data['violations'] = array_map(static fn(string $field): array => ['propertyPath' => $field, 'message' => 'Este valor no es válido.'], $fields);
        }
        $response = new JsonResponse($data, $status, ['Content-Type' => 'application/problem+json']);
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
