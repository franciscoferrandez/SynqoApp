<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AvailabilityApiTest extends WebTestCase
{
    public function testAvailabilityIsSharedPersistedAndOnlyEffectiveWritesRenewActivity(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        $clock = new MockClock('2026-01-15T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');

        $client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'timeZone' => 'Europe/Madrid']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $participantId = $created['firstParticipant']['id'];
        $headers = ['HTTP_AUTHORIZATION' => 'Bearer ' . $token];

        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: $headers);
        self::assertResponseStatusCodeSame(200);
        $initial = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['available' => 0, 'maybe' => 0, 'unavailable' => 0], $initial['days'][0]['counts']);
        self::assertNull($initial['days'][0]['state']);

        $path = '/api/teams/current/availability/2026-01-15/participants/' . $participantId;
        $client->jsonRequest('PUT', $path, ['state' => 'maybe', 'timeZone' => 'Europe/Madrid'], server: $headers);
        self::assertResponseStatusCodeSame(200);
        $saved = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('maybe', $saved['day']['state']);
        self::assertSame(1, $saved['day']['counts']['maybe']);
        self::assertSame(1, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
        $activityAfterSave = $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]);

        $clock->modify('+1 minute');
        $client->jsonRequest('PUT', $path, ['state' => 'maybe', 'timeZone' => 'Europe/Madrid'], server: $headers);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($activityAfterSave, $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]));

        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: $headers);
        self::assertResponseStatusCodeSame(200);
        $reloaded = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('Ana', $reloaded['days'][0]['marks'][0]['participantName']);
        self::assertSame('maybe', $reloaded['days'][0]['marks'][0]['state']);
        self::assertSame($activityAfterSave, $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]));

        $clock->modify('+1 minute');
        $client->jsonRequest('PUT', $path, ['state' => 'available', 'timeZone' => 'Europe/Madrid'], server: $headers);
        self::assertResponseStatusCodeSame(200);
        $activityAfterChange = $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]);
        self::assertNotSame($activityAfterSave, $activityAfterChange);

        $client->jsonRequest('PUT', $path, ['state' => null, 'timeZone' => 'Europe/Madrid'], server: $headers);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(0, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
        self::assertSame(0, json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['day']['counts']['available']);
    }

    public function testWritesRejectPastDatesAndInvalidZonesAndReadsRequireBearer(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-01-15T12:00:00+00:00'));
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'timeZone' => 'Europe/Madrid']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $path = '/api/teams/current/availability/2026-01-14/participants/' . $created['firstParticipant']['id'];

        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15');
        self::assertResponseStatusCodeSame(401);
        $client->jsonRequest('PUT', $path, ['state' => 'available', 'timeZone' => 'Mars/Olympus'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(0, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM availability'));
        $client->jsonRequest('PUT', $path, ['state' => 'available', 'timeZone' => 'Europe/Madrid'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(422);
    }

    public function testDeviceZoneOverridesTeamZoneAndIntervalIsLimitedToFortyTwoDays(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-01-15T00:30:00+00:00'));
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Zona', 'firstParticipantName' => 'Ana', 'timeZone' => 'Europe/Madrid']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $headers = ['HTTP_AUTHORIZATION' => 'Bearer ' . $token];
        $path = '/api/teams/current/availability/2026-01-14/participants/' . $created['firstParticipant']['id'];

        $client->jsonRequest('PUT', $path, ['state' => 'available', 'timeZone' => 'America/Los_Angeles'], server: $headers);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(1, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
        $client->jsonRequest('PUT', $path, ['state' => 'available'], server: $headers);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(1, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));

        $client->request('GET', '/api/teams/current/availability?from=2026-01-01&to=2026-02-11', server: $headers);
        self::assertResponseStatusCodeSame(200);
        $interval = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertCount(42, $interval['days']);
        self::assertSame('available', $interval['days'][13]['state']);
        $client->request('GET', '/api/teams/current/availability?from=2026-01-01&to=2026-02-12', server: $headers);
        self::assertResponseStatusCodeSame(400);
        $client->request('GET', '/api/teams/current/availability?from=2026-02-30&to=2026-02-30', server: $headers);
        self::assertResponseStatusCodeSame(400);
    }

    public function testForeignParticipantIsRejectedAndTeamDeletionCascadesMarks(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-01-15T12:00:00+00:00'));
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');

        $client->jsonRequest('POST', '/api/teams', ['name' => 'Uno', 'firstParticipantName' => 'Ana']);
        $first = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $firstToken = substr($first['accessUrl'], strpos($first['accessUrl'], '#t=') + 3);
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Dos', 'firstParticipantName' => 'Bea']);
        $second = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $secondToken = substr($second['accessUrl'], strpos($second['accessUrl'], '#t=') + 3);
        $path = '/api/teams/current/availability/2026-01-15/participants/' . $second['firstParticipant']['id'];

        $client->jsonRequest('PUT', $path, ['state' => 'available'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $firstToken]);
        self::assertResponseStatusCodeSame(404);
        self::assertSame(0, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));

        $ownPath = '/api/teams/current/availability/2026-01-15/participants/' . $first['firstParticipant']['id'];
        $client->jsonRequest('PUT', $ownPath, ['state' => 'available'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $firstToken]);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(1, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
        $db->executeStatement('DELETE FROM team WHERE id = ?', [$first['id']]);
        self::assertSame(0, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $firstToken]);
        self::assertResponseStatusCodeSame(404);
        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: ['HTTP_AUTHORIZATION' => 'Bearer invalid']);
        self::assertResponseStatusCodeSame(404);
        $db->update('team', ['last_activity_at' => '2025-01-01 12:00:00+00'], ['id' => $second['id']]);
        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $secondToken]);
        self::assertResponseStatusCodeSame(410);
    }

    public function testDailySummaryUsesMostRestrictiveStateAndCountsEachMark(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-01-15T12:00:00+00:00'));
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Resumen', 'firstParticipantName' => 'Ana']);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $headers = ['HTTP_AUTHORIZATION' => 'Bearer ' . $token];
        $participantIds = [$created['firstParticipant']['id']];
        foreach (['Bea', 'Carlos'] as $name) {
            $client->jsonRequest('POST', '/api/teams/current/participants', ['name' => $name], server: $headers);
            self::assertResponseStatusCodeSame(201);
            $participantIds[] = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['participant']['id'];
        }

        foreach (array_combine($participantIds, ['available', 'maybe', 'unavailable']) as $participantId => $state) {
            $path = '/api/teams/current/availability/2026-01-15/participants/' . $participantId;
            $client->jsonRequest('PUT', $path, ['state' => $state], server: $headers);
            self::assertResponseStatusCodeSame(200);
        }
        $client->request('GET', '/api/teams/current/availability?from=2026-01-15&to=2026-01-15', server: $headers);
        self::assertResponseStatusCodeSame(200);
        $day = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['days'][0];
        self::assertSame('unavailable', $day['state']);
        self::assertSame(['available' => 1, 'maybe' => 1, 'unavailable' => 1], $day['counts']);
    }

    public function testFailedAvailabilityWriteRollsBackTheTeamActivityUpdate(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        static::getContainer()->set('clock', new MockClock('2026-01-15T12:00:00+00:00'));
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Rollback', 'firstParticipantName' => 'Ana']);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $before = $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]);
        $db->executeStatement("CREATE FUNCTION reject_availability_write() RETURNS trigger LANGUAGE plpgsql AS '
            BEGIN RAISE EXCEPTION ''forced test failure''; END;
        '");
        $db->executeStatement('CREATE TRIGGER reject_availability_write BEFORE INSERT OR UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION reject_availability_write()');

        try {
            $path = '/api/teams/current/availability/2026-01-15/participants/' . $created['firstParticipant']['id'];
            $client->jsonRequest('PUT', $path, ['state' => 'available'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
            self::assertResponseStatusCodeSame(500);
            self::assertSame(0, (int) $db->fetchOne('SELECT COUNT(*) FROM availability'));
            self::assertSame($before, $db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]));
        } finally {
            $db->executeStatement('DROP TRIGGER reject_availability_write ON availability');
            $db->executeStatement('DROP FUNCTION reject_availability_write()');
        }
    }

    public function testConcurrentWritesWaitForTheTeamLockAndLeaveOneMark(): void
    {
        $client = static::createClient(server: [], options: ['environment' => 'test']);
        $client->disableReboot();
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM availability');
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Concurrencia', 'firstParticipantName' => 'Ana']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $workers = [];
        $db->beginTransaction();

        try {
            $db->executeQuery('SELECT id FROM team WHERE id = ? FOR UPDATE', [$created['id']])->fetchOne();
            foreach (['available', 'maybe'] as $state) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_availability.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                $workers[] = [$process, $pipes, $state];
            }
            foreach ($workers as [, $pipes, $state]) {
                fwrite($pipes[0], json_encode([
                    'token' => $token,
                    'date' => (new \DateTimeImmutable('tomorrow', new \DateTimeZone('UTC')))->format('Y-m-d'),
                    'participantId' => $created['firstParticipant']['id'],
                    'state' => $state,
                ], JSON_THROW_ON_ERROR) . "\n");
                fclose($pipes[0]);
            }

            $applicationNames = array_map(static fn(array $worker): string => (string) proc_get_status($worker[0])['pid'], $workers);
            $deadline = microtime(true) + 5;
            do {
                $waiting = (int) $db->fetchOne(
                    "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name IN (?, ?) AND wait_event_type = 'Lock'",
                    $applicationNames,
                );
                if ($waiting === 2) {
                    break;
                }
                usleep(20_000);
            } while (microtime(true) < $deadline);

            self::assertSame(2, $waiting, 'Both independent writes should be waiting for the held team-row lock.');
            $db->commit();

            $outcomes = [];
            foreach ($workers as [$process, $pipes, $state]) {
                $outcomes[] = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
            }
            self::assertSame(['SAVED', 'SAVED'], $outcomes);
            self::assertSame(1, (int) $db->fetchOne('SELECT COUNT(*) FROM availability WHERE team_id = ?', [$created['id']]));
            self::assertContains($db->fetchOne('SELECT state FROM availability WHERE team_id = ?', [$created['id']]), ['available', 'maybe']);
        } finally {
            if ($db->isTransactionActive()) {
                $db->rollBack();
            }
            foreach ($workers as [$process, $pipes]) {
                foreach ($pipes as $pipe) {
                    if (is_resource($pipe)) {
                        fclose($pipe);
                    }
                }
                if (is_resource($process)) {
                    proc_terminate($process);
                    proc_close($process);
                }
            }
        }
    }
}
