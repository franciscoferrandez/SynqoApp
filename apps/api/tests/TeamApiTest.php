<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Team\TeamRepository;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class TeamApiTest extends WebTestCase
{
    private KernelBrowser $client;
    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        $db = static::getContainer()->get(Connection::class);
        $db->executeStatement('DELETE FROM participant');
        $db->executeStatement('DELETE FROM team');
    }

    public function testCreationPersistsProtectedTeamAndRejectsEquivalentDuplicate(): void
    {
        $client = $this->client;
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Álvaro', 'timeZone' => 'Europe/Madrid']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('accessUrl', $created);
        self::assertStringContainsString('/e#t=', $created['accessUrl']);
        self::assertSame(64, strlen(static::getContainer()->get(Connection::class)->fetchOne('SELECT access_verifier FROM team WHERE id = ?', [$created['id']])));
        self::assertStringNotContainsString(substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3), static::getContainer()->get(Connection::class)->fetchOne('SELECT access_verifier FROM team WHERE id = ?', [$created['id']]));
        $manager = static::getContainer()->get(EntityManagerInterface::class);
        $teamRecord = $manager->find(TeamRecord::class, $created['id']);
        $participantRecord = $manager->find(ParticipantRecord::class, $created['firstParticipant']['id']);
        self::assertInstanceOf(TeamRecord::class, $teamRecord);
        self::assertInstanceOf(ParticipantRecord::class, $participantRecord);
        self::assertSame($teamRecord, $participantRecord->team());
        self::assertSame('alvaro', $participantRecord->normalizedName());

        $client->request('GET', '/api/teams/current');
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');

        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(200);
        self::assertResponseHeaderSame('Cache-Control', 'no-store, private');
        self::assertSame('Álvaro', json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['participants'][0]['name']);
        $lastActivity = static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]);
        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertSame($lastActivity, static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]));

        $client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'alvaro'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(409);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame('urn:synqo:problem:duplicate-participant', json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['type']);
        self::assertSame($lastActivity, static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$created['id']]));
        $client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Beatriz'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(201);
        self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));

        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer invalid']);
        self::assertResponseStatusCodeSame(404);

        static::getContainer()->get(Connection::class)->update('team', ['last_activity_at' => '2020-01-01 12:00:00+00'], ['id' => $created['id']]);
        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(410);
        self::assertStringNotContainsString('Equipo Demo', $client->getResponse()->getContent());
        self::assertStringContainsString('no-store', $client->getResponse()->headers->get('Cache-Control'));
    }

    public function testOpenApiListsAllImplementedOperations(): void
    {
        $client = $this->client;
        $client->request('GET', '/api/docs.jsonopenapi');
        self::assertResponseStatusCodeSame(200);
        $spec = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('/api/teams', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/participants', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/availability', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/availability/{date}/participants/{participantId}', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/consultations', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/consultations/{consultationId}', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/consultations/{consultationId}/votes/{participantId}/options/{optionId}', $spec['paths']);
        self::assertArrayHasKey('/api/teams/current/consultations/{consultationId}/resolution', $spec['paths']);
        self::assertArrayHasKey('get', $spec['paths']['/api/teams/current/consultations']);
        self::assertArrayHasKey('post', $spec['paths']['/api/teams/current/consultations']);
        $consultationCreate = $spec['paths']['/api/teams/current/consultations']['post'];
        $requestSchema = $consultationCreate['requestBody']['content']['application/json']['schema'];
        self::assertSame(['participantId', 'title', 'options'], $requestSchema['required']);
        self::assertSame(['text', 'date'], $requestSchema['properties']['type']['enum']);
        self::assertStringContainsString('se omite', $requestSchema['properties']['type']['description']);
        self::assertStringContainsString('IANA', $requestSchema['properties']['timeZone']['description']);
        $consultationResponse = $consultationCreate['responses']['201']['content']['application/json']['schema']['properties']['consultation'];
        self::assertSame(['text', 'date'], $consultationResponse['properties']['type']['enum']);
        self::assertCount(2, $consultationResponse['properties']['options']['items']['oneOf']);
        self::assertCount(9, $spec['paths']);
        $operations = $spec['paths']['/api/teams/current/participants']['post'];
        self::assertSame(['urn:synqo:problem:duplicate-participant'], $operations['responses']['409']['content']['application/problem+json']['schema']['properties']['type']['enum']);
        self::assertArrayHasKey('WWW-Authenticate', $operations['responses']['401']['headers']);
        self::assertArrayHasKey('500', $operations['responses']);
        $participant = $operations['responses']['201']['content']['application/json']['schema']['properties']['participant'];
        self::assertSame(['id', 'name'], $participant['required']);
        self::assertSame('uuid', $participant['properties']['id']['format']);
        $list = $spec['paths']['/api/teams/current']['get']['responses']['200']['content']['application/json']['schema']['properties']['participants'];
        self::assertSame(['id', 'name'], $list['items']['required']);
        self::assertSame(['propertyPath', 'message'], $operations['responses']['422']['content']['application/problem+json']['schema']['properties']['violations']['items']['required']);
    }

    public function testProtectedWritesRequireALiveTeamAndDoNotAcceptItsUuid(): void
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $path = '/api/teams/current/participants';

        $this->client->jsonRequest('POST', $path, ['name' => 'Bea']);
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');
        foreach ([$created['id'], 'invalid'] as $invalidToken) {
            $this->client->jsonRequest('POST', $path, ['name' => 'Bea'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $invalidToken]);
            self::assertResponseStatusCodeSame(404);
        }
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));

        static::getContainer()->get(Connection::class)->update('team', ['last_activity_at' => '2020-01-01 12:00:00+00'], ['id' => $created['id']]);
        $this->client->jsonRequest('POST', $path, ['name' => 'Bea'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(410);
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));

        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team WHERE id = ?', [$created['id']]);
        $this->client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(404);
        $this->client->jsonRequest('POST', $path, ['name' => 'Bea'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(404);
    }

    public function testDifferentTeamsMayHaveTheSameNameAndValidationReturnsFields(): void
    {
        foreach (['Ana', 'Bea'] as $firstParticipant) {
            $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Mismo equipo', 'firstParticipantName' => $firstParticipant]);
            self::assertResponseStatusCodeSame(201);
        }
        self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM team WHERE name = ?', ['Mismo equipo']));

        $this->client->jsonRequest('POST', '/api/teams', ['name' => '', 'firstParticipantName' => str_repeat('x', 51)]);
        self::assertResponseStatusCodeSame(422);
        $problem = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['name', 'firstParticipantName'], array_column($problem['violations'], 'propertyPath'));
        self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM team'));
    }

    public function testControlledClockRejectsWriteAtExactExpiryAndAcceptsItBeforeExpiry(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-01-15T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Reloj', 'firstParticipantName' => 'Ana', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $clock->sleep((new \DateTimeImmutable($created['expiresAt']))->getTimestamp() - $clock->now()->getTimestamp());

        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Bea'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(410);
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));

        $clock->modify('-1 second');
        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Bea'], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(201);
        self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));
    }

    public function testConcurrentEquivalentParticipantNamesCreateOnlyOneParticipant(): void
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Carrera', 'firstParticipantName' => 'Ana']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $processes = [];
        try {
            foreach (['Émile', '  emile  '] as $name) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_participant.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                $processes[] = [$process, $pipes, $name];
            }
            foreach ($processes as [, $pipes, $name]) {
                fwrite($pipes[0], json_encode(['token' => $token, 'name' => $name], JSON_THROW_ON_ERROR) . "\n");
                fclose($pipes[0]);
            }
            $outcomes = [];
            foreach ($processes as [$process, $pipes]) {
                $outcomes[] = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
            }
            self::assertSame(['CREATED', 'DUPLICATE'], array_values(array_intersect(['CREATED', 'DUPLICATE'], $outcomes)));
            self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));
        } finally {
            foreach ($processes as [$process, $pipes]) {
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

    public function testOrmCreationRollsBackTeamWhenParticipantInsertFails(): void
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Inicial', 'firstParticipantName' => 'Ana']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $now = '2026-10-05 12:00:00+00';
        $orphanTeamId = 'b71ff4fd-1ebf-449c-abbb-57062801ee77';
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $repository = static::getContainer()->get(TeamRepository::class);

        try {
            $repository->create(
                ['id' => $orphanTeamId, 'name' => 'Incompleto', 'access_verifier' => str_repeat('0', 64), 'time_zone' => 'Europe/Madrid', 'created_at' => $now, 'last_activity_at' => $now],
                ['id' => $created['firstParticipant']['id'], 'name' => 'Otra persona', 'name_normalized' => 'otra persona', 'created_at' => $now],
            );
            self::fail('A duplicate participant ID must reject the whole transaction.');
        } catch (UniqueConstraintViolationException) {
            self::assertSame(0, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM team WHERE id = ?', [$orphanTeamId]));
        }

        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Posterior', 'firstParticipantName' => 'Bea']);
        self::assertResponseStatusCodeSame(201);
    }

}
