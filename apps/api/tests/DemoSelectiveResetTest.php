<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoAccessTokenDeriver;
use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoResetException;
use App\Application\Demo\DemoResetService;
use App\Application\Team\IdentifierGenerator;
use App\Application\Team\TeamService;
use App\Infrastructure\Console\ResetDemoCommand;
use App\Infrastructure\Persistence\OrmDemoResetRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Console\Tester\CommandTester;

final class DemoSelectiveResetTest extends KernelTestCase
{
    private Connection $db;
    /** @var list<array{name: string, token: string, id?: string}> */
    private array $demo;
    private string $selection;

    protected function setUp(): void
    {
        self::bootKernel(['environment' => 'test']);
        static::getContainer()->set('clock', new MockClock('2026-10-12T10:00:00Z'));
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM team');
        $this->db->executeStatement('DELETE FROM team_creation_origin_event');
        $this->demo = $this->repository('')->initialize(new DateTimeImmutable('2026-10-12T10:00:00Z'));
        $this->selection = implode(',', array_column($this->demo, 'id'));
    }

    public function testResetPreservesEveryRealTeamTableAndRotatesTokensOnStableDemoRoots(): void
    {
        $real = static::getContainer()->get(TeamService::class)->create('La mesa del jueves', 'Real', 'Europe/Madrid', clientIp: '192.0.2.1');
        $id = $real['id'];
        $participant = $real['firstParticipant']['id'];
        $ids = static::getContainer()->get(IdentifierGenerator::class);
        $consultation = $ids->generate();
        $option = $ids->generate();
        $vote = $ids->generate();
        $now = '2026-10-12 10:00:00+00';
        $this->db->insert('availability', ['id' => $ids->generate(), 'team_id' => $id, 'participant_id' => $participant, 'date' => '2026-10-13', 'state' => 'available']);
        $this->db->insert('consultation', ['id' => $consultation, 'team_id' => $id, 'created_by_participant_id' => $participant, 'type' => 'text', 'title' => 'Real', 'state' => 'resolved', 'created_at' => $now, 'resolved_by_participant_id' => $participant, 'resolved_at' => $now]);
        $this->db->insert('consultation_option', ['id' => $option, 'consultation_id' => $consultation, 'option_text' => 'Sí', 'position' => 0]);
        $this->db->insert('consultation_vote', ['id' => $vote, 'consultation_id' => $consultation, 'participant_id' => $participant]);
        $this->db->insert('consultation_vote_selection', ['vote_id' => $vote, 'option_id' => $option]);
        $this->db->insert('consultation_resolution_option', ['consultation_id' => $consultation, 'option_id' => $option]);
        $this->db->insert('team_mail_attempt', ['id' => $ids->generate(), 'team_id' => $id, 'receipt_verifier' => str_repeat('r', 64), 'status' => 'pending', 'payload' => 'encrypted-test-payload', 'created_at' => $now, 'expires_at' => '2026-10-12 10:30:00+00']);
        $before = $this->snapshot($id);
        $oldParticipants = $this->db->fetchFirstColumn('SELECT id FROM participant WHERE team_id = ?', [$this->demo[0]['id']]);
        $this->db->executeStatement('UPDATE participant SET name = ? WHERE team_id = ?', ['Contenido alterado', $this->demo[0]['id']]);
        $this->db->executeStatement('UPDATE team SET name = ?, time_zone = ? WHERE id = ?', ['Alterado', 'Europe/Madrid', $this->demo[0]['id']]);
        $rootBefore = $this->db->fetchAllKeyValue('SELECT id, created_at FROM team ORDER BY id');

        $first = $this->repository($this->selection)->replace(new DateTimeImmutable('2026-10-12T11:00:00Z'));
        $last = $this->repository(strtoupper(str_replace(',', ', ', $this->selection)))->replace(new DateTimeImmutable('2026-10-12T12:00:00Z'));

        self::assertSame($before, $this->snapshot($id));
        self::assertSame($rootBefore, $this->db->fetchAllKeyValue('SELECT id, created_at FROM team ORDER BY id'));
        self::assertSame(array_column($this->demo, 'id'), array_column($first, 'id'));
        self::assertSame(array_column($this->demo, 'id'), array_column($last, 'id'));
        self::assertNotSame(array_column($first, 'token'), array_column($last, 'token'));
        self::assertSame(3, (int) $this->db->fetchOne('SELECT MIN(demo_access_generation) FROM team WHERE id IN (?)', [$this->selection ? explode(',', $this->selection) : []], [\Doctrine\DBAL\ArrayParameterType::STRING]));
        self::assertSame(3, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertSame($this->demo[0]['id'], static::getContainer()->get(TeamService::class)->current($last[0]['token'])['id']);
        $oldTokenRevoked = false;
        try {
            static::getContainer()->get(TeamService::class)->current($this->demo[0]['token']);
        } catch (\App\Application\Exception\TeamNotFound) {
            $oldTokenRevoked = true;
        }
        self::assertTrue($oldTokenRevoked, 'The previous demo link must be revoked.');
        self::assertNotSame($oldParticipants, $this->db->fetchFirstColumn('SELECT id FROM participant WHERE team_id = ?', [$this->demo[0]['id']]));
        self::assertSame(0, (int) $this->db->fetchOne("SELECT COUNT(*) FROM participant WHERE name = 'Contenido alterado'"));
        self::assertSame('UTC', $this->db->fetchOne('SELECT time_zone FROM team WHERE id = ?', [$this->demo[0]['id']]));
        $token = substr($real['accessUrl'], strpos($real['accessUrl'], '#t=') + 3);
        self::assertSame($id, static::getContainer()->get(TeamService::class)->current($token)['id']);
    }

    public function testAbsentInvalidPartialOrDuplicateConfigurationNeverMutates(): void
    {
        $before = $this->snapshot();
        $id = (string) $this->demo[0]['id'];
        foreach ([null, ' ', 'bad,input', $id, $id . ',' . strtoupper($id), $this->selection . ',' . $id] as $selection) {
            try {
                $this->repository($selection)->replace(new DateTimeImmutable('2026-10-12T11:00:00Z'));
                self::fail('Expected invalid selector rejection.');
            } catch (DemoResetException) {
                self::assertSame($before, $this->snapshot());
            }
        }
        self::assertSame([], $this->repository('')->replace(new DateTimeImmutable('2026-10-12T11:00:00Z')));
        self::assertSame($before, $this->snapshot());
    }

    public function testMissingOrWrongDemoIdentityNeverMutates(): void
    {
        $before = $this->snapshot();
        try {
            $this->repository($this->demo[0]['id'] . ',00000000-0000-4000-8000-000000000001')->replace(new DateTimeImmutable('now'));
            self::fail('Expected missing team rejection.');
        } catch (DemoResetException $error) {
            self::assertStringContainsString('se encontraron 1', $error->getMessage());
            self::assertSame($before, $this->snapshot());
        }
        $this->db->executeStatement('UPDATE team SET access_verifier = ? WHERE id = ?', [hash('sha256', $this->demo[0]['token']), $this->demo[1]['id']]);
        $before = $this->snapshot();
        try {
            $this->repository($this->selection)->replace(new DateTimeImmutable('now'));
            self::fail('Expected duplicate demo identity rejection.');
        } catch (DemoResetException) {
            self::assertSame($before, $this->snapshot());
        }
    }

    public function testAllowNonEmptyInitializationAddsDemoWithoutChangingExistingTeam(): void
    {
        $real = static::getContainer()->get(TeamService::class)->create('La mesa del jueves', 'Real', 'Europe/Madrid', clientIp: '192.0.2.8');
        $realId = $real['id'];
        $this->db->executeStatement('DELETE FROM team WHERE id IN (?)', [array_column($this->demo, 'id')], [\Doctrine\DBAL\ArrayParameterType::STRING]);
        $before = $this->snapshot($realId);

        $created = $this->repository('')->initialize(new DateTimeImmutable('2026-10-12T11:00:00Z'), true);

        self::assertCount(2, $created);
        self::assertSame($before, $this->snapshot($realId));
        self::assertSame(3, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
    }

    public function testUuidOfRealHomonymousTeamIsRejected(): void
    {
        $real = static::getContainer()->get(TeamService::class)->create('La mesa del jueves', 'Real', 'UTC', clientIp: '192.0.2.2');
        $before = $this->snapshot();
        try {
            $this->repository($real['id'] . ',' . $this->demo[1]['id'])->replace(new DateTimeImmutable('now'));
            self::fail('Expected real team rejection.');
        } catch (DemoResetException) {
            self::assertSame($before, $this->snapshot());
        }
    }

    public function testSuppressedRootUpdateRollsBackAllChildDeletions(): void
    {
        $this->assertTriggerRollback('team', 'UPDATE', 'se actualizaron 0');
    }

    public function testSuppressedChildDeletionRollsBackEarlierDeletions(): void
    {
        $this->assertTriggerRollback('availability', 'DELETE', 'datos dependientes anteriores');
    }

    public function testFixtureWriteFailureRollsBackRootsAndChildren(): void
    {
        $before = $this->snapshot();
        $this->db->executeStatement("ALTER TABLE participant ADD CONSTRAINT demo_test_participant_fail CHECK (name <> 'Ana') NOT VALID");
        try {
            try {
                $this->repository($this->selection)->replace(new DateTimeImmutable('now'));
                self::fail('Expected fixture constraint failure.');
            } catch (\Doctrine\DBAL\Exception\DriverException) {
                self::assertSame($before, $this->snapshot());
            }
        } finally {
            $this->db->executeStatement('ALTER TABLE participant DROP CONSTRAINT demo_test_participant_fail');
        }
    }

    public function testConcurrentResetIsRejectedAndInitializationCannotTouchOccupiedDatabase(): void
    {
        $before = $this->snapshot();
        $other = DriverManager::getConnection($this->db->getParams());
        $other->beginTransaction();
        $other->fetchOne('SELECT pg_advisory_xact_lock(?)', [OrmDemoResetRepository::LOCK_KEY]);
        try {
            try {
                $this->repository($this->selection)->replace(new DateTimeImmutable('now'));
                self::fail('Expected concurrent reset rejection.');
            } catch (\RuntimeException) {
                self::assertSame($before, $this->snapshot());
            }
        } finally {
            $other->rollBack();
            $other->close();
        }
        foreach (['', $this->selection, null] as $selection) {
            try {
                $this->repository($selection)->initialize(new DateTimeImmutable('now'));
                self::fail('Expected initialization rejection.');
            } catch (DemoResetException) {
                self::assertSame($before, $this->snapshot());
            }
        }
    }

    public function testCommandShowsSafeMismatchAndInitializationIdsWithoutTokens(): void
    {
        // Mock only the host profile: all mutations still use the real PostgreSQL repository.
        $registry = $this->createStub(ManagerRegistry::class);
        $private = DriverManager::getConnection(['driver' => 'pdo_pgsql', 'host' => 'db.railway.internal', 'serverVersion' => '18']);
        $registry->method('getConnection')->willReturn($private);
        $registry->method('getManager')->willReturn(static::getContainer()->get(ManagerRegistry::class)->getManager());
        $build = fn(?string $selection): CommandTester => $this->tester(new ResetDemoCommand(
            new DemoResetService($this->repository($selection, $registry), new MockClock('2026-10-12T11:00:00Z'), new DemoAccessTokenDeriver(str_repeat('s', 32))),
            'prod',
            'preproduction',
            'https://example.invalid',
            true,
            'db.railway.internal',
            'preproduction',
        ));
        $tester = $build($this->demo[0]['id'] . ',00000000-0000-4000-8000-000000000001');
        self::assertSame(1, $tester->execute(['--force' => true, '--no-interaction' => true], ['interactive' => false]));
        self::assertStringContainsString('se encontraron 1', preg_replace('/\s+/', ' ', $tester->getDisplay()));
        $tester = $build('');
        self::assertSame(0, $tester->execute(['--force' => true, '--no-interaction' => true], ['interactive' => false]));
        self::assertStringContainsString('no se ha modificado', $tester->getDisplay());
        $this->db->executeStatement('DELETE FROM team');
        self::assertSame(0, $tester->execute(['--force' => true, '--no-interaction' => true, '--initialize' => true], ['interactive' => false]));
        self::assertMatchesRegularExpression('/DEMO_TEAM_IDS=[0-9a-f-]{36},[0-9a-f-]{36}/', $tester->getDisplay());
        foreach ($this->demo as $team) {
            self::assertStringNotContainsString($team['token'], $tester->getDisplay());
        }
        self::assertStringNotContainsString('#t=', $tester->getDisplay());
        $tester = $build(null);
        self::assertSame(1, $tester->execute(['--force' => true, '--no-interaction' => true], ['interactive' => false]));
        self::assertStringContainsString('debe estar definida', $tester->getDisplay());
    }

    public function testInitializationIsNotLimitedToPreproduction(): void
    {
        $this->db->executeStatement('DELETE FROM team');
        $now = new DateTimeImmutable('2026-10-12T11:00:00Z');
        $localRepository = new OrmDemoResetRepository(
            static::getContainer()->get(ManagerRegistry::class),
            new DemoFixture(),
            static::getContainer()->get(IdentifierGenerator::class),
            new DemoAccessTokenDeriver(str_repeat('s', 32)),
            'development',
            '',
        );
        $created = $localRepository->initialize($now);
        self::assertCount(2, $created);
        self::assertSame(2, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
    }

    public function testInitializationExcludesConcurrentNormalTeamCreation(): void
    {
        $this->db->executeStatement('DELETE FROM team');
        $other = DriverManager::getConnection($this->db->getParams());
        $other->executeStatement("SET lock_timeout = '100ms'");
        $generator = static::getContainer()->get(IdentifierGenerator::class);
        $identifiers = $this->createStub(IdentifierGenerator::class);
        $checked = false;
        $identifiers->method('generate')->willReturnCallback(function () use ($other, $generator, &$checked): string {
            if (!$checked) {
                $checked = true;
                try {
                    $other->insert('team', ['id' => $generator->generate(), 'name' => 'Concurrent real team', 'access_verifier' => str_repeat('x', 64), 'time_zone' => 'UTC', 'created_at' => '2026-10-12 10:00:00+00', 'last_activity_at' => '2026-10-12 10:00:00+00']);
                    self::fail('Expected table lock to exclude the concurrent insert.');
                } catch (\Doctrine\DBAL\Exception\DriverException $error) {
                    self::assertSame('55P03', $error->getSQLState());
                    self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
                }
            }
            return $generator->generate();
        });
        $repository = new OrmDemoResetRepository(static::getContainer()->get(ManagerRegistry::class), new DemoFixture(), $identifiers, new DemoAccessTokenDeriver(str_repeat('s', 32)), 'preproduction', '');
        try {
            self::assertCount(2, $repository->initialize(new DateTimeImmutable('2026-10-12T11:00:00Z')));
            self::assertTrue($checked);
        } finally {
            $other->close();
        }
    }

    public function testEveryEnvironmentPreservesRealDataAndRequiresItsOwnSecret(): void
    {
        $real = static::getContainer()->get(TeamService::class)->create('Persistente', 'Real', 'UTC', clientIp: '192.0.2.20');
        $before = $this->snapshot($real['id']);
        foreach (['development', 'preproduction', 'production'] as $environment) {
            $repository = new OrmDemoResetRepository(
                static::getContainer()->get(ManagerRegistry::class),
                new DemoFixture(),
                static::getContainer()->get(IdentifierGenerator::class),
                new DemoAccessTokenDeriver(str_repeat('s', 32)),
                $environment,
                $this->selection,
            );
            self::assertSame(array_column($this->demo, 'id'), array_column($repository->replace(new DateTimeImmutable('2026-10-12T11:00:00Z')), 'id'));
            self::assertSame($before, $this->snapshot($real['id']));
            self::assertSame(8, (int) $this->db->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id IN (?)', [explode(',', $this->selection)], [\Doctrine\DBAL\ArrayParameterType::STRING]));
            $wrongSecret = new OrmDemoResetRepository(
                static::getContainer()->get(ManagerRegistry::class),
                new DemoFixture(),
                static::getContainer()->get(IdentifierGenerator::class),
                new DemoAccessTokenDeriver(str_repeat('x', 32)),
                $environment,
                $this->selection,
            );
            $all = $this->snapshot();
            try {
                $wrongSecret->replace(new DateTimeImmutable('2026-10-12T12:00:00Z'));
                self::fail('A secret from another environment must not authorize the roots.');
            } catch (DemoResetException) {
                self::assertSame($all, $this->snapshot());
            }
        }
    }

    private function tester(ResetDemoCommand $command): CommandTester
    {
        $application = new \Symfony\Component\Console\Application();
        $application->addCommand($command);
        return new CommandTester($command);
    }

    private function assertTriggerRollback(string $table, string $operation, string $message): void
    {
        $before = $this->snapshot();
        $this->db->executeStatement('CREATE FUNCTION demo_test_suppress() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NULL; END $$');
        $this->db->executeStatement('CREATE TRIGGER demo_test_suppress BEFORE ' . $operation . ' ON ' . $table . ' FOR EACH ROW EXECUTE FUNCTION demo_test_suppress()');
        try {
            try {
                $this->repository($this->selection)->replace(new DateTimeImmutable('2026-10-12T11:00:00Z'));
                self::fail('Expected suppressed mutation rejection.');
            } catch (DemoResetException $error) {
                self::assertStringContainsString($message, $error->getMessage());
                self::assertSame($before, $this->snapshot());
            }
        } finally {
            $this->db->executeStatement('DROP TRIGGER demo_test_suppress ON ' . $table);
            $this->db->executeStatement('DROP FUNCTION demo_test_suppress()');
        }
    }

    private function repository(?string $selection, ?ManagerRegistry $registry = null): OrmDemoResetRepository
    {
        return new OrmDemoResetRepository(
            $registry ?? static::getContainer()->get(ManagerRegistry::class),
            new DemoFixture(),
            static::getContainer()->get(IdentifierGenerator::class),
            new DemoAccessTokenDeriver(str_repeat('s', 32)),
            'preproduction',
            $selection,
        );
    }

    /** @return array<string, list<array<string, mixed>>> */
    private function snapshot(?string $realId = null): array
    {
        $joins = [
            'team' => 'WHERE id = ?',
            'participant' => 'WHERE team_id = ?',
            'availability' => 'WHERE team_id = ?',
            'consultation' => 'WHERE team_id = ?',
            'team_mail_attempt' => 'WHERE team_id = ?',
            'consultation_option' => 'JOIN consultation c ON c.id = t.consultation_id WHERE c.team_id = ?',
            'consultation_vote' => 'JOIN consultation c ON c.id = t.consultation_id WHERE c.team_id = ?',
            'consultation_vote_selection' => 'JOIN consultation_vote v ON v.id = t.vote_id JOIN consultation c ON c.id = v.consultation_id WHERE c.team_id = ?',
            'consultation_resolution_option' => 'JOIN consultation c ON c.id = t.consultation_id WHERE c.team_id = ?',
            'team_creation_origin_event' => '',
        ];
        $result = [];
        foreach ($joins as $table => $join) {
            $filtered = $realId !== null && $join !== '';
            $result[$table] = $this->db->fetchAllAssociative('SELECT t.* FROM ' . $table . ' t ' . ($filtered ? $join : '') . ' ORDER BY 1, 2', $filtered ? [$realId] : []);
        }
        return $result;
    }
}
