<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ConsultationEventCreationApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        static::getContainer()->set('clock', new MockClock('2026-10-19T12:00:00+00:00'));
    }

    public function testCreateEventDefaultsOffAndCreatesOneProvisionalEventWhenEnabled(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Uma');
        $server = $this->auth($team);
        $connection = static::getContainer()->get(Connection::class);

        $withoutFlag = $this->createDateConsultation($team, 'Consulta sin campo');
        $explicitlyOff = $this->createDateConsultation($team, 'Consulta con campo apagado', false);
        self::assertArrayNotHasKey('event', $withoutFlag['event']['consultation']);
        self::assertArrayNotHasKey('event', $explicitlyOff['event']['consultation']);
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));

        $created = $this->createDateConsultation($team, 'Reunión de otoño', true);
        self::assertSame('Reunión de otoño', $created['event']['consultation']['event']['title']);
        $eventId = $created['event']['consultation']['event']['id'];
        self::assertSame($eventId, $connection->fetchOne('SELECT event_id FROM consultation WHERE id = ?', [$created['event']['consultation']['id']]));
        self::assertSame($eventId, $connection->fetchOne('SELECT open_event_id FROM consultation WHERE id = ?', [$created['event']['consultation']['id']]));

        $this->client->request('GET', '/api/teams/current/events/' . $eventId, server: $server);
        self::assertResponseStatusCodeSame(200);
        $event = $this->body()['event'];
        self::assertSame('Reunión de otoño', $event['title']);
        self::assertSame('provisional', $event['status']);
        self::assertNull($event['date']);
        self::assertNull($event['notes']);
        self::assertSame($team['participantId'], $event['createdBy']['id']);
        self::assertSame($created['event']['consultation']['createdAt'], $event['createdAt']);
        self::assertNull($event['lastModifiedAt']);
        self::assertNull($event['lastModifiedBy']);
        self::assertSame(1, $event['version']);

        $again = $this->createDateConsultation($team, 'Reunión de otoño', true);
        self::assertNotSame($eventId, $again['event']['consultation']['event']['id']);
        self::assertSame(2, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
    }

    public function testCreateEventValidationRejectsInvalidFlagsTextAndExplicitEventCombination(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Vera');
        $server = $this->auth($team);
        $connection = static::getContainer()->get(Connection::class);
        $existingEvent = $this->createEvent($team, 'Existente');
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $before = [
            'consultations' => (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]),
            'events' => (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]),
        ];

        foreach ([null, 'true', 1] as $value) {
            $this->postConsultation($team, ['createEvent' => $value], server: $server);
            self::assertResponseStatusCodeSame(422);
        }
        $this->postConsultation($team, ['type' => 'text', 'createEvent' => true], server: $server);
        self::assertResponseStatusCodeSame(422);
        $this->postConsultation($team, ['createEvent' => true, 'eventId' => $existingEvent['id']], server: $server);
        self::assertResponseStatusCodeSame(422);

        self::assertSame($before['consultations'], (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
        self::assertSame($before['events'], (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $legacy = $this->postConsultation($team, ['eventId' => $existingEvent['id']], server: $server);
        self::assertResponseStatusCodeSame(201);
        self::assertSame($existingEvent['id'], $legacy['consultation']['event']['id']);
        self::assertSame($before['events'], (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
    }

    public function testCreateEventAccessAndActorFailuresHappenBeforeAnyWrites(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Wanda');
        $other = $this->createTeam('Xenia');
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $payload = ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Crear conjuntamente', 'options' => ['2026-10-20'], 'timeZone' => 'UTC', 'createEvent' => true];

        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload);
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: ['HTTP_AUTHORIZATION' => 'Bearer altered']);
        self::assertResponseStatusCodeSame(404);
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));

        $foreignActorPayload = [...$payload, 'participantId' => $other['participantId']];
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $foreignActorPayload, server: $this->auth($team));
        self::assertResponseStatusCodeSame(404);
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $connection->update('team', ['last_activity_at' => '2000-01-01 12:00:00+00'], ['id' => $team['id']]);
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: $this->auth($team));
        self::assertResponseStatusCodeSame(410);
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        self::assertSame('2000-01-01 12:00:00+00', $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    public function testConsultationInsertFailureRollsBackTheNewEventAndActivity(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Yara');
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("ALTER TABLE consultation ADD CONSTRAINT test_event_consultation_failure CHECK (title <> 'Forzar fallo atómico')");

        try {
            $this->postConsultation($team, ['title' => 'Forzar fallo atómico', 'createEvent' => true], server: $this->auth($team));
            self::assertResponseStatusCodeSame(500);
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
            self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        } finally {
            $connection->executeStatement('ALTER TABLE consultation DROP CONSTRAINT IF EXISTS test_event_consultation_failure');
        }
    }

    public function testOpenApiDocumentsCreateEventDefaultAndPurpose(): void
    {
        $this->client->request('GET', '/api/docs.jsonopenapi');
        self::assertResponseStatusCodeSame(200);
        $spec = $this->body();
        $createEvent = $spec['paths']['/api/teams/current/consultations']['post']['requestBody']['content']['application/json']['schema']['properties']['createEvent'];

        self::assertSame('boolean', $createEvent['type']);
        self::assertFalse($createEvent['default']);
        self::assertNotEmpty($createEvent['description']);
        self::assertStringNotContainsString('selector', strtolower($createEvent['description']));
        self::assertStringNotContainsString('select existing', strtolower($createEvent['description']));
    }

    private function createTeam(string $participantName): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $participantName, 'firstParticipantName' => $participantName, 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = $this->body();
        return [
            'id' => $created['id'],
            'participantId' => $created['firstParticipant']['id'],
            'token' => substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3),
        ];
    }

    private function createDateConsultation(array $team, string $title, ?bool $createEvent = null): array
    {
        $fields = $createEvent === null ? [] : ['createEvent' => $createEvent];
        $created = $this->postConsultation($team, ['title' => $title, ...$fields], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return ['event' => $created];
    }

    private function createEvent(array $team, string $title): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], 'title' => $title], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['event'];
    }

    private function postConsultation(array $team, array $overrides = [], array $server = []): array
    {
        $payload = [
            'type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Consulta de fechas',
            'options' => ['2026-10-20', '2026-10-21'], 'timeZone' => 'UTC',
            ...$overrides,
        ];
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: $server);
        if ($this->client->getResponse()->getStatusCode() === 201) {
            return $this->body();
        }
        return [];
    }

    private function auth(array $team): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
    }

    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}
