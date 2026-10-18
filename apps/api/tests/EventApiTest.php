<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class EventApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
    }

    public function testCreatesGroupsAndReadsEventsWithAuthoredDetails(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Ana');

        $this->client->jsonRequest('POST', '/api/teams/current/events', [
            'participantId' => $team['participantId'],
            'title' => 'Ensayo del viernes',
            'notes' => 'Revisar repertorio',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        self::assertResponseHeaderSame('Cache-Control', 'no-store, private');
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $event = $created['event'];
        self::assertSame('provisional', $event['status']);
        self::assertNull($event['date']);
        self::assertSame('Revisar repertorio', $event['notes']);
        self::assertSame($team['participantId'], $event['createdBy']['id']);
        self::assertNull($event['lastModifiedAt']);
        self::assertNull($event['lastModifiedBy']);
        self::assertSame(1, $event['version']);

        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $list = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertCount(1, $list['unfinalized']);
        self::assertSame($event['id'], $list['unfinalized'][0]['id']);
        self::assertSame([], $list['future']);
        self::assertSame([], $list['past']);
        self::assertSame([], $list['rejected']);

        $this->client->request('GET', '/api/teams/current/events/' . $event['id'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($event, json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event']);
    }

    public function testPastDatesAreAllowedAndLifecycleChangesKeepDataAndAdvanceVersion(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Bea');
        $this->client->jsonRequest('POST', '/api/teams/current/events', [
            'participantId' => $team['participantId'],
            'title' => 'Concierto',
            'date' => '2020-02-29',
            'status' => 'definitive',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        $event = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        self::assertSame('2020-02-29', $event['date']);
        self::assertSame('definitive', $event['status']);

        $clock->modify('+1 second');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
            'participantId' => $team['participantId'],
            'title' => 'Concierto de otoño',
            'notes' => null,
            'date' => '2020-02-29',
            'status' => 'definitive',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $event = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        self::assertSame('Concierto de otoño', $event['title']);
        self::assertSame($team['participantId'], $event['lastModifiedBy']['id']);
        self::assertSame(2, $event['version']);

        $clock->modify('+1 second');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', ['participantId' => $team['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $event = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        self::assertSame('rejected', $event['status']);
        self::assertSame('2020-02-29', $event['date']);
        self::assertSame(3, $event['version']);

        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
            'participantId' => $team['participantId'], 'title' => 'No editable', 'status' => 'provisional',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(409);

        $clock->modify('+1 second');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/recovery', ['participantId' => $team['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $event = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        self::assertSame('provisional', $event['status']);
        self::assertSame('2020-02-29', $event['date']);
        self::assertSame(4, $event['version']);

        $defaulted = $this->createEvent($team, ['title' => 'Fecha provisional por defecto', 'date' => '2026-10-22']);
        self::assertSame('provisional', $defaulted['status']);
        self::assertSame('2026-10-22', $defaulted['date']);
    }

    public function testTodayUsesTeamTimeZoneAndInvalidOrForeignMutationsDoNotPersist(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T00:30:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Clara', 'America/Los_Angeles');
        $other = $this->createTeam('Dani');

        foreach ([
            ['title' => 'Hoy para el equipo', 'date' => '2026-10-17', 'status' => 'definitive'],
            ['title' => 'Después', 'date' => '2026-10-18', 'status' => 'definitive'],
            ['title' => 'Ayer', 'date' => '2026-10-16', 'status' => 'definitive'],
            ['title' => 'Provisional anterior', 'date' => '2026-10-15'],
        ] as $payload) {
            $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], ...$payload], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(201);
        }

        $connection = static::getContainer()->get(Connection::class);
        $before = (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event');
        $invalid = [
            ['title' => str_repeat('x', 251)],
            ['title' => 'Notas demasiado largas', 'notes' => str_repeat('x', 5001)],
            ['title' => 'Invalido', 'date' => '2026-02-30'],
            ['title' => 'Invalido', 'status' => 'rejected'],
            ['title' => 'Invalido', 'date' => null, 'status' => 'definitive'],
        ];
        foreach ($invalid as $payload) {
            $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], ...$payload], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(422);
        }
        $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $other['participantId'], 'title' => 'Ajeno'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(404);
        self::assertSame($before, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event'));

        $this->client->request('GET', '/api/teams/current/events');
        self::assertResponseStatusCodeSame(401);
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        $groups = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['Hoy para el equipo', 'Después'], array_column($groups['future'], 'title'));
        self::assertSame(['Ayer'], array_column($groups['past'], 'title'));
        self::assertSame(['Provisional anterior'], array_column($groups['unfinalized'], 'title'));
    }

    public function testExpiredTeamsRejectEventAccessWithoutChangingStoredEvents(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Eva');
        $event = $this->createEvent($team, ['title' => 'Evento conservado']);
        $connection = static::getContainer()->get(Connection::class);
        $connection->update('team', ['last_activity_at' => '2000-01-01 00:00:00+00'], ['id' => $team['id']]);

        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
        $this->client->request('GET', '/api/teams/current/events/' . $event['id'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);

        self::assertSame(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        self::assertSame('2000-01-01 00:00:00+00', $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    public function testForeignEventsAndRepeatedLifecycleTransitionsReturnNotFoundOrConflict(): void
    {
        $this->client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
        $owner = $this->createTeam('Fátima');
        $other = $this->createTeam('Gabi');
        $foreignEvent = $this->createEvent($other, ['title' => 'Privado']);
        $event = $this->createEvent($owner, ['title' => 'Ciclo']);

        $this->client->request('GET', '/api/teams/current/events/' . $foreignEvent['id'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(404);

        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', ['participantId' => $owner['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(200);
        $rejected = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', ['participantId' => $owner['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(409);
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/recovery', ['participantId' => $owner['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(200);
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/recovery', ['participantId' => $owner['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(409);

        $this->client->request('GET', '/api/teams/current/events/' . $event['id'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(200);
        $active = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
        self::assertSame('Ciclo', $active['title']);
        self::assertSame('provisional', $active['status']);
        self::assertSame(3, $active['version']);
        self::assertSame('rejected', $rejected['status']);
        self::assertSame(2, $rejected['version']);
    }

    public function testEventInsertFailureRollsBackTheEventAndTeamActivity(): void
    {
        $this->client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
        $team = $this->createTeam('Hugo');
        $connection = static::getContainer()->get(Connection::class);
        $activityBefore = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("ALTER TABLE team_event ADD CONSTRAINT test_event_forced_failure CHECK (title <> 'Forzar rollback')");

        try {
            $this->client->jsonRequest('POST', '/api/teams/current/events', [
                'participantId' => $team['participantId'],
                'title' => 'Forzar rollback',
            ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(500);
        } finally {
            $connection->executeStatement('ALTER TABLE team_event DROP CONSTRAINT test_event_forced_failure');
        }

        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        self::assertSame($activityBefore, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    public function testDeletingTeamCascadesItsEvents(): void
    {
        $team = $this->createTeam('Inés');
        $this->createEvent($team, ['title' => 'Se elimina con su equipo']);
        $connection = static::getContainer()->get(Connection::class);

        self::assertSame(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
        $connection->executeStatement('DELETE FROM team WHERE id = ?', [$team['id']]);
        self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM team_event WHERE team_id = ?', [$team['id']]));
    }

    public function testSameDateEventsPutMostRecentlyModifiedFirst(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Julia');
        $olderChange = $this->createEvent($team, ['title' => 'Primer futuro', 'date' => '2026-10-20', 'status' => 'definitive']);
        $clock->modify('+1 second');
        $this->createEvent($team, ['title' => 'Segundo futuro', 'date' => '2026-10-20', 'status' => 'definitive']);
        $clock->modify('+1 second');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $olderChange['id'], [
            'participantId' => $team['participantId'],
            'title' => 'Primer futuro editado',
            'date' => '2026-10-20',
            'status' => 'definitive',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);

        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        $groups = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['Primer futuro editado', 'Segundo futuro'], array_column($groups['future'], 'title'));
    }

    public function testUnfinalizedAndRejectedGroupsUseMostRecentModificationOrCreation(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->createTeam('Karla');
        $olderUnfinalized = $this->createEvent($team, ['title' => 'Provisional anterior']);
        $clock->modify('+1 second');
        $this->createEvent($team, ['title' => 'Provisional reciente']);
        $clock->modify('+1 second');
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        $groups = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['Provisional reciente', 'Provisional anterior'], array_column($groups['unfinalized'], 'title'));

        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $olderUnfinalized['id'], [
            'participantId' => $team['participantId'],
            'title' => 'Provisional anterior editado',
            'date' => null,
            'status' => 'provisional',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $clock->modify('+1 second');
        $this->client->jsonRequest('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        $groups = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['Provisional anterior editado', 'Provisional reciente'], array_column($groups['unfinalized'], 'title'));

        $firstRejected = $this->createEvent($team, ['title' => 'Rechazado primero']);
        $clock->modify('+1 second');
        $secondRejected = $this->createEvent($team, ['title' => 'Rechazado segundo']);
        foreach ([$firstRejected, $secondRejected] as $event) {
            $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', ['participantId' => $team['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(200);
            $clock->modify('+1 second');
        }
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        $groups = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['Rechazado segundo', 'Rechazado primero'], array_column($groups['rejected'], 'title'));
    }

    public function testCalendarReturnsDatedActiveEventsInTabOrderAndExcludesRejectedOrUndatedEvents(): void
    {
        $this->client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
        $team = $this->createTeam('Lola');
        $this->createEvent($team, ['title' => 'Sin fecha']);
        $first = $this->createEvent($team, ['title' => 'Primero', 'date' => '2026-10-20', 'status' => 'provisional']);
        $second = $this->createEvent($team, ['title' => 'Segundo', 'date' => '2026-10-20', 'status' => 'definitive']);
        $rejected = $this->createEvent($team, ['title' => 'Oculto', 'date' => '2026-10-20', 'status' => 'definitive']);
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $rejected['id'] . '/rejection', ['participantId' => $team['participantId']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);

        $this->client->request('GET', '/api/teams/current/events/calendar?from=2026-10-19&to=2026-10-21', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([
            ['id' => $first['id'], 'date' => '2026-10-20', 'title' => 'Primero', 'status' => 'provisional'],
            ['id' => $second['id'], 'date' => '2026-10-20', 'title' => 'Segundo', 'status' => 'definitive'],
        ], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['events']);
    }

    public function testCalendarValidatesRangeAndRequiresLiveAccess(): void
    {
        $this->client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
        $team = $this->createTeam('Marta');

        $this->client->request('GET', '/api/teams/current/events/calendar?from=2026-01-01&to=2026-02-12', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(422);
        $this->client->request('GET', '/api/teams/current/events/calendar?from=2026-02-30&to=2026-02-30', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(422);
        $this->client->request('GET', '/api/teams/current/events/calendar?from=2026-01-01&to=2026-01-01');
        self::assertResponseStatusCodeSame(401);

        static::getContainer()->get(Connection::class)->update('team', ['last_activity_at' => '2000-01-01 00:00:00+00'], ['id' => $team['id']]);
        $this->client->request('GET', '/api/teams/current/events/calendar?from=2026-01-01&to=2026-01-01', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
    }

    /** @param array{title: string, notes?: string|null, date?: string|null, status?: string} $payload
     * @return array<string, mixed>
     */
    private function createEvent(array $team, array $payload): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/events', [
            'participantId' => $team['participantId'],
            ...$payload,
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);

        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['event'];
    }

    private function createTeam(string $participantName, string $timeZone = 'UTC'): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $participantName, 'firstParticipantName' => $participantName, 'timeZone' => $timeZone]);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        return [
            'id' => $created['id'],
            'participantId' => $created['firstParticipant']['id'],
            'token' => substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3),
            'expiresAt' => $created['expiresAt'],
        ];
    }
}
