<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Team\CreationLimitPolicy;
use App\Application\Team\CreationLimitPurger;
use App\Application\Team\TeamRepository;
use App\Application\Exception\CreationLimitExceeded;
use App\Application\Team\TeamService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\MockClock;

final class TeamCreationLimitTest extends WebTestCase
{
    private KernelBrowser $client;
    private Connection $db;
    /** @var array<string, array{process: string|false, server: mixed, env: mixed, hasServer: bool, hasEnv: bool}> */
    private array $savedEnvironment = [];

    protected function setUp(): void
    {
        $this->setTestEnvironment('TEAM_CREATION_LIMIT', '2');
        $this->setTestEnvironment('TEAM_CREATION_WINDOW_MINUTES', '1');
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        $this->client->disableReboot();
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM team_creation_origin_event');
        $this->db->executeStatement('DELETE FROM participant');
        $this->db->executeStatement('DELETE FROM team');
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        foreach ($this->savedEnvironment as $name => $value) {
            if ($value['process'] === false) {
                putenv($name);
            } else {
                putenv($name . '=' . $value['process']);
            }
            if ($value['hasServer']) {
                $_SERVER[$name] = $value['server'];
            } else {
                unset($_SERVER[$name]);
            }
            if ($value['hasEnv']) {
                $_ENV[$name] = $value['env'];
            } else {
                unset($_ENV[$name]);
            }
        }
    }

    public function testAnySignalAtItsLimitBlocksAndStoresOnlyKeyedDigests(): void
    {
        $this->client->request('GET', '/api/configuration');
        self::assertResponseIsSuccessful();
        $configuration = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertIsBool($configuration['teamCreationEmailEnabled']);
        self::assertSame(2, $configuration['teamCreationMaxTeams']);
        self::assertSame(1, $configuration['teamCreationWindowMinutes']);

        $this->create('192.0.2.1', 'origin-one');
        $this->create('192.0.2.1', 'origin-two');
        self::assertResponseStatusCodeSame(201);

        // The same IP has two successful creations with different device keys.
        $this->create('192.0.2.1', 'origin-three');
        self::assertLimitResponse();
        self::assertSame(2, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertSame(4, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));
        $rows = $this->db->fetchAllAssociative('SELECT signal_type, signal_digest FROM team_creation_origin_event');
        foreach ($rows as $row) {
            self::assertMatchesRegularExpression('/^[a-f0-9]{64}$/', trim($row['signal_digest']));
            self::assertContains($row['signal_type'], ['ip', 'device']);
        }
        $columns = $this->db->fetchFirstColumn("SELECT column_name FROM information_schema.columns WHERE table_name = 'team_creation_origin_event'");
        self::assertNotContains('team_id', $columns);
        self::assertNotContains('team_uuid', $columns);
    }

    public function testDeviceSignalIsAlsoIndependentlyEnforcedAndInvalidRequestsDoNotConsumeLimit(): void
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => '', 'firstParticipantName' => 'Ana'], server: ['REMOTE_ADDR' => '192.0.2.10', 'HTTP_X_CREATION_DEVICE' => 'device-shared']);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));

        $this->create('192.0.2.10', 'device-shared');
        self::assertResponseStatusCodeSame(201);
        $this->create('192.0.2.11', 'device-shared');
        self::assertResponseStatusCodeSame(201);
        $this->create('192.0.2.12', 'device-shared');
        self::assertLimitResponse();
        self::assertSame(2, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
    }

    public function testCreationFailsClosedWhenNoOriginSignalIsAvailable(): void
    {
        try {
            static::getContainer()->get(TeamService::class)->create('Equipo', 'Ana', 'UTC');
            self::fail('Creation without an origin signal must be rejected.');
        } catch (CreationLimitExceeded) {
            self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
            self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));
        }
    }

    public function testWindowExpiryAllowsCreationAndOpportunisticallyPurgesExpiredRows(): void
    {
        $repository = static::getContainer()->get(TeamRepository::class);
        $key = self::deviceKey('device-window');
        $origin = [['type' => 'device', 'digest' => hash_hmac('sha256', 'device:' . $key, 'local-test-secret')]];
        $this->persistLimitedTeam($repository, '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', '2026-10-07 12:00:00+00', $origin);
        $this->persistLimitedTeam($repository, '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', '2026-10-07 12:00:00+00', $origin);
        $this->persistLimitedTeam($repository, '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000203', '2026-10-07 12:01:01+00', $origin);
        self::assertSame(3, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));
    }

    public function testPurgerDeletesExpiredRowsAndRetainsActiveRows(): void
    {
        $this->db->insert('team_creation_origin_event', ['signal_type' => 'ip', 'signal_digest' => str_repeat('a', 64), 'created_at' => '2026-10-07 11:58:59+00']);
        $this->db->insert('team_creation_origin_event', ['signal_type' => 'device', 'signal_digest' => str_repeat('b', 64), 'created_at' => '2026-10-07 11:59:30+00']);

        $clock = new MockClock('2026-10-07T12:00:00+00:00');
        $purger = new CreationLimitPurger(static::getContainer()->get(TeamRepository::class), new CreationLimitPolicy('test', '2', '1'), $clock);
        self::assertSame(1, $purger->purgeExpired());
        self::assertSame([str_repeat('b', 64)], array_map('trim', $this->db->fetchFirstColumn('SELECT signal_digest FROM team_creation_origin_event')));
    }

    public function testFailedTeamPersistenceRollsBackTheSignalEvents(): void
    {
        $repository = static::getContainer()->get(TeamRepository::class);
        $before = (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event');
        $now = '2026-10-07 12:00:00+00';
        $baselineTeamId = '00000000-0000-4000-8000-000000000301';
        $baselineParticipantId = '00000000-0000-4000-8000-000000000401';
        $deviceDigest = hash_hmac('sha256', 'device:' . self::deviceKey('device-rollback'), 'local-test-secret');
        $this->persistLimitedTeam($repository, $baselineTeamId, $baselineParticipantId, $now, [['type' => 'device', 'digest' => $deviceDigest]]);
        $before = (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event');

        try {
            $repository->createWithOriginLimit(
                ['id' => '00000000-0000-4000-8000-000000000088', 'name' => 'Duplicado', 'access_verifier' => str_repeat('c', 64), 'time_zone' => 'UTC', 'created_at' => $now, 'last_activity_at' => $now],
                ['id' => $baselineParticipantId, 'name' => 'Otra', 'name_normalized' => 'otra', 'created_at' => $now],
                null,
                [['type' => 'device', 'digest' => $deviceDigest]],
                2,
                60,
            );
            self::fail('Duplicate team ID should abort the team and event transaction.');
        } catch (\Throwable) {
            self::assertSame($before, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));
            self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team WHERE id = ?', ['00000000-0000-4000-8000-000000000088']));
        }
    }

    public function testConcurrentRequestsCannotExceedConfiguredLimit(): void
    {
        // The helper uses a separate kernel/connection and a max of one to exercise
        // the transaction-scoped advisory lock against an initially empty pool.
        $this->db->executeStatement('DELETE FROM team_creation_origin_event');
        $this->db->executeStatement('DELETE FROM participant');
        $this->db->executeStatement('DELETE FROM team');
        $processes = [];
        try {
            foreach ([1, 2] as $sequence) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_team_creation.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                $processes[] = [$process, $pipes, $sequence];
            }
            foreach ($processes as [, $pipes, $sequence]) {
                fwrite($pipes[0], json_encode(['sequence' => $sequence, 'device' => self::deviceKey('same-device-key')], JSON_THROW_ON_ERROR) . "\n");
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
            self::assertSame(1, count(array_filter($outcomes, static fn(string $result): bool => $result === 'CREATED')));
            self::assertSame(1, count(array_filter($outcomes, static fn(string $result): bool => $result === 'LIMITED')));
            self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
            self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_creation_origin_event'));
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

    private function create(string $ip, string $device): void
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana'], server: [
            'REMOTE_ADDR' => $ip,
            'HTTP_X_CREATION_DEVICE' => self::deviceKey($device),
        ]);
    }

    private static function deviceKey(string $label): string
    {
        return rtrim(strtr(base64_encode(hash('sha256', $label, true)), '+/', '-_'), '=');
    }

    private function setTestEnvironment(string $name, string $value): void
    {
        $this->savedEnvironment[$name] = [
            'process' => getenv($name),
            'server' => $_SERVER[$name] ?? null,
            'env' => $_ENV[$name] ?? null,
            'hasServer' => array_key_exists($name, $_SERVER),
            'hasEnv' => array_key_exists($name, $_ENV),
        ];
        putenv($name . '=' . $value);
        $_SERVER[$name] = $value;
        $_ENV[$name] = $value;
    }

    /** @param list<array{type: 'ip'|'device', digest: string}> $origins */
    private function persistLimitedTeam(TeamRepository $repository, string $id, string $participantId, string $createdAt, array $origins): void
    {
        $repository->createWithOriginLimit(
            ['id' => $id, 'name' => 'Equipo', 'access_verifier' => hash('sha256', $id), 'time_zone' => 'UTC', 'created_at' => $createdAt, 'last_activity_at' => $createdAt],
            ['id' => $participantId, 'name' => 'Ana', 'name_normalized' => 'ana', 'created_at' => $createdAt],
            null,
            $origins,
            2,
            60,
        );
    }

    private function assertLimitResponse(): void
    {
        self::assertResponseStatusCodeSame(429);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame([
            'type' => 'urn:synqo:problem:creation-limit-exceeded',
            'title' => 'Límite de creación alcanzado',
            'status' => 429,
            'detail' => 'Has alcanzado el límite de creación de equipos. Inténtalo de nuevo más tarde.',
        ], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));
    }
}
