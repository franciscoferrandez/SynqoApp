<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Exception;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ConsultationApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
    }

    public function testCreatesAndListsTextConsultationsInCreationOrder(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Ana');
        $lastActivity = static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        self::assertResponseHeaderSame('Cache-Control', 'no-store, private');
        self::assertSame(['open' => [], 'resolved' => [], 'rejected' => []], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));

        $clock->modify('+10 seconds');
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'participantId' => $team['participantId'],
            'title' => '¿Qué merendamos?',
            'options' => ['Té', 'Café', 'Chocolate'],
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        self::assertResponseHeaderSame('Cache-Control', 'no-store, private');
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('text', $created['consultation']['type']);
        self::assertSame('open', $created['consultation']['state']);
        self::assertSame($team['participantId'], $created['consultation']['createdBy']['id']);
        self::assertSame('¿Qué merendamos?', $created['consultation']['title']);
        self::assertSame(['Té', 'Café', 'Chocolate'], array_column($created['consultation']['options'], 'text'));
        self::assertSame([0, 1, 2], array_column($created['consultation']['options'], 'position'));
        self::assertSame('2026-10-05T12:00:10+00:00', $created['consultation']['createdAt']);
        self::assertNotSame($lastActivity, static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
        self::assertSame(3, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_option'));

        $clock->modify('+10 seconds');
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'participantId' => $team['participantId'],
            'title' => '¿Qué día?',
            'options' => ['Lunes'],
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);

        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $list = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['¿Qué día?', '¿Qué merendamos?'], array_column($list['open'], 'title'));
        self::assertSame([], $list['resolved']);
        self::assertSame([], $list['rejected']);
    }

    public function testInvalidOrUnauthorizedRequestsDoNotPersistOrRenewActivity(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Ana');
        $other = $this->createTeam('Bea');
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => ['Sí']]);
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');

        $invalidPayloads = [
            ['participantId' => $team['participantId'], 'title' => '', 'options' => ['Opción']],
            ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => []],
            ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => [' Café ', 'café']],
            ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => [str_repeat('x', 51)]],
            ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => array_fill(0, 11, 'Opción')],
        ];
        foreach ($invalidPayloads as $payload) {
            $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(422);
            self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        }
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation'));
        self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $other['participantId'], 'title' => 'Pregunta', 'options' => ['Opción']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(404);
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation'));
        self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer invalid']);
        self::assertResponseStatusCodeSame(404);
        $connection->update('team', ['last_activity_at' => '2020-01-01 12:00:00+00'], ['id' => $team['id']]);
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => ['Opción']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation'));
    }

    public function testMalformedJsonIsAProblemAndDoesNotCreatePartialRows(): void
    {
        $team = $this->createTeam('Clara');
        $this->client->request('POST', '/api/teams/current/consultations', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $team['token'],
            'CONTENT_TYPE' => 'application/json',
        ], content: '{');
        self::assertResponseStatusCodeSame(400);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame(0, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation'));
    }

    public function testPersistenceFailureRollsBackConsultationAndActivity(): void
    {
        $connection = static::getContainer()->get(Connection::class);
        $connection->executeStatement('DROP TRIGGER IF EXISTS fail_consultation_option_insert ON consultation_option');
        $connection->executeStatement('DROP FUNCTION IF EXISTS fail_consultation_option_insert()');
        $team = $this->createTeam('Diego');
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("CREATE FUNCTION fail_consultation_option_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced option persistence failure'; END; $$");
        $connection->executeStatement('CREATE TRIGGER fail_consultation_option_insert BEFORE INSERT ON consultation_option FOR EACH ROW EXECUTE FUNCTION fail_consultation_option_insert()');

        try {
            $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
                'participantId' => $team['participantId'],
                'title' => 'Pregunta sin persistencia parcial',
                'options' => ['Primera', 'Segunda'],
            ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);

            self::assertResponseStatusCodeSame(500);
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_option'));
            self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        } finally {
            $connection->executeStatement('DROP TRIGGER IF EXISTS fail_consultation_option_insert ON consultation_option');
            $connection->executeStatement('DROP FUNCTION IF EXISTS fail_consultation_option_insert()');
        }
    }

    public function testListRequiresAnAccessToken(): void
    {
        $this->client->request('GET', '/api/teams/current/consultations');
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');

        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer invalid']);
        self::assertResponseStatusCodeSame(404);
    }

    public function testDateOptionsPersistAsCivilDatesAndDatabaseEnforcesTypedValueAndUniqueness(): void
    {
        $team = $this->createTeam('Elena');
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'participantId' => $team['participantId'],
            'title' => 'Consulta base',
            'options' => ['Texto existente'],
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        $consultationId = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['consultation']['id'];
        $connection = static::getContainer()->get(Connection::class);
        $id = '0199e314-73bd-7a2c-9c00-000000000001';
        $connection->insert('consultation_option', [
            'id' => $id,
            'consultation_id' => $consultationId,
            'option_text' => null,
            'option_date' => '2026-10-15',
            'position' => 1,
        ]);

        self::assertSame('2026-10-15', $connection->fetchOne('SELECT option_date::text FROM consultation_option WHERE id = ?', [$id]));
        self::assertSame('Texto existente', $connection->fetchOne('SELECT option_text FROM consultation_option WHERE consultation_id = ? AND position = 0', [$consultationId]));

        try {
            $connection->insert('consultation_option', [
                'id' => '0199e314-73bd-7a2c-9c00-000000000002',
                'consultation_id' => $consultationId,
                'option_text' => null,
                'option_date' => '2026-10-15',
                'position' => 2,
            ]);
            self::fail('The same date cannot be added twice to a consultation.');
        } catch (Exception) {
            self::assertSame(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE consultation_id = ? AND option_date = ?', [$consultationId, '2026-10-15']));
        }

        try {
            $connection->insert('consultation_option', [
                'id' => '0199e314-73bd-7a2c-9c00-000000000003',
                'consultation_id' => $consultationId,
                'option_text' => null,
                'option_date' => null,
                'position' => 3,
            ]);
            self::fail('An option must have either text or a date.');
        } catch (Exception) {
            self::assertSame(2, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE consultation_id = ?', [$consultationId]));
        }
    }

    public function testCreatesListsAndValidatesDateConsultationsInTheSubmittedTimeZone(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T00:30:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Fátima');
        $clock->modify('+1 minute');
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'type' => 'date',
            'participantId' => $team['participantId'],
            'title' => '¿Qué día nos va bien?',
            'options' => ['2026-10-04', '2026-10-05'],
            'timeZone' => 'America/Los_Angeles',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['consultation'];
        self::assertSame('date', $created['type']);
        self::assertSame(['2026-10-04', '2026-10-05'], array_column($created['options'], 'date'));
        self::assertSame([0, 1], array_column($created['options'], 'position'));
        self::assertArrayNotHasKey('text', $created['options'][0]);
        self::assertNotSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->client->request('GET', '/api/teams/current/consultations', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $listed = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['open'][0];
        self::assertSame('date', $listed['type']);
        self::assertSame(['2026-10-04', '2026-10-05'], array_column($listed['options'], 'date'));

        $beforeInvalid = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $invalidPayloads = [
            ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Ayer', 'options' => ['2026-10-04'], 'timeZone' => 'Europe/Madrid'],
            ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Inválida', 'options' => ['2026-02-30'], 'timeZone' => 'UTC'],
            ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Repetida', 'options' => ['2026-10-05', '2026-10-05'], 'timeZone' => 'UTC'],
            ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Zona', 'options' => ['2026-10-05'], 'timeZone' => 'No/Such_Zone'],
            ['type' => 'unknown', 'participantId' => $team['participantId'], 'title' => 'Tipo', 'options' => ['Valor']],
        ];
        foreach ($invalidPayloads as $payload) {
            $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(422);
        }
        self::assertSame(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$team['id']]));
        self::assertSame($beforeInvalid, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    private function createTeam(string $participantName): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $participantName, 'firstParticipantName' => $participantName, 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        return [
            'id' => $created['id'],
            'participantId' => $created['firstParticipant']['id'],
            'token' => substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3),
        ];
    }
}
