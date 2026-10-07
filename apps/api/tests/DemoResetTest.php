<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Demo\DemoFixture;
use App\Application\Demo\DemoResetService;
use App\Application\Team\IdentifierGenerator;
use App\Application\Team\AccessTokenGenerator;
use Doctrine\Persistence\ManagerRegistry;
use App\Infrastructure\Console\ResetDemoCommand;
use App\Infrastructure\Persistence\OrmDemoResetRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Console\Tester\CommandTester;

final class DemoResetTest extends KernelTestCase
{
    private Connection $db;
    private DemoResetService $service;

    protected function setUp(): void
    {
        self::bootKernel(['environment' => 'test']);
        static::getContainer()->set('clock', new MockClock('2026-10-07T10:00:00+00:00'));
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM team_creation_origin_event');
        $this->service = static::getContainer()->get(DemoResetService::class);
    }

    public function testFixtureIsDeterministicAcrossUtcBoundaryAndYearChange(): void
    {
        $fixture = new DemoFixture();
        $now = new DateTimeImmutable('2026-01-01T01:00:00+02:00');
        $marks = $fixture->availability($now, 0);
        self::assertEquals($marks, $fixture->availability($now, 0));
        self::assertSame('2025-11-01', $marks[0]['date']->format('Y-m-d'));
        self::assertSame('2026-03-31', $marks[array_key_last($marks)]['date']->format('Y-m-d'));
        $dates = array_map(static fn(array $mark): string => $mark['date']->format('Y-m-d'), $marks);
        foreach (['2025-12-22', '2026-01-05', '2026-01-12'] as $date) {
            self::assertContains($date, $dates);
        }
        foreach ($fixture->consultations($now, 0) as $consultation) {
            if ($consultation['type'] === 'date') {
                foreach ($consultation['options'] as $date) {
                    self::assertGreaterThan('2025-12-31', $date);
                    self::assertLessThanOrEqual('2026-03-31', $date);
                }
            }
        }
    }

    public function testRestoreIsCompleteRepeatableAndDoesNotSendMailOrTouchOtherTables(): void
    {
        // The demo reset must preserve the real, active creation-origin pool.
        $activeDigest = str_repeat('c', 64);
        $this->db->insert('team_creation_origin_event', [
            'signal_type' => 'device',
            'signal_digest' => $activeDigest,
            'created_at' => '2026-10-07 09:59:30+00',
        ]);
        $first = $this->service->reset();
        self::assertCount(2, $first);
        self::assertSame(['La mesa del jueves', 'La banda del patio'], array_column($first, 'name'));
        self::assertSame(8, (int) $this->db->fetchOne('SELECT COUNT(*) FROM participant'));
        self::assertSame(4, (int) $this->db->fetchOne('SELECT COUNT(*) FROM consultation'));
        self::assertSame(['open' => 2, 'rejected' => 1, 'resolved' => 1], $this->db->fetchAllKeyValue('SELECT state, COUNT(*)::int FROM consultation GROUP BY state ORDER BY state'));
        self::assertSame(12, (int) $this->db->fetchOne('SELECT COUNT(*) FROM consultation_vote'));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_mail_attempt'));
        self::assertSame('2026-09-01', $this->db->fetchOne('SELECT MIN(date)::text FROM availability'));
        self::assertSame('2027-01-31', $this->db->fetchOne('SELECT MAX(date)::text FROM availability'));
        $oldIds = $this->db->fetchFirstColumn('SELECT id FROM team');
        $second = $this->service->reset();
        self::assertNotSame($first[0]['token'], $second[0]['token']);
        self::assertSame(2, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertNotEquals($oldIds, $this->db->fetchFirstColumn('SELECT id FROM team'));
        self::assertSame([$activeDigest], array_map('trim', $this->db->fetchFirstColumn('SELECT signal_digest FROM team_creation_origin_event')));
        foreach ($second as $team) {
            $current = static::getContainer()->get(\App\Application\Team\TeamService::class)->current($team['token']);
            self::assertSame($team['name'], $current['name']);
            self::assertCount(4, $current['participants']);
            self::assertSame($team['name'], $this->db->fetchOne('SELECT name FROM team WHERE access_verifier = ?', [hash('sha256', $team['token'])]));
            self::assertStringNotContainsString($team['token'], (string) $this->db->fetchOne('SELECT access_verifier FROM team WHERE name = ?', [$team['name']]));
        }
    }

    public function testFailureRollsBackDeletionAndPartialFixture(): void
    {
        $this->service->reset();
        $oldIds = $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id');
        $count = (int) $this->db->fetchOne('SELECT COUNT(*) FROM availability');
        $this->db->executeStatement("ALTER TABLE team ADD CONSTRAINT demo_test_fail CHECK (name <> 'La banda del patio') NOT VALID");
        try {
            try {
                $this->service->reset();
                self::fail('Expected a rejected fixture write.');
            } catch (\Doctrine\DBAL\Exception\DriverException) {
                self::assertSame($oldIds, $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id'));
                self::assertSame($count, (int) $this->db->fetchOne('SELECT COUNT(*) FROM availability'));
            }
        } finally {
            $this->db->executeStatement('ALTER TABLE team DROP CONSTRAINT demo_test_fail');
        }
    }

    public function testAdvisoryLockRejectsSimultaneousResetWithoutChangingData(): void
    {
        $this->service->reset();
        $oldIds = $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id');
        $other = DriverManager::getConnection($this->db->getParams());
        $other->beginTransaction();
        $other->fetchOne('SELECT pg_advisory_xact_lock(?)', [OrmDemoResetRepository::LOCK_KEY]);
        try {
            try {
                $this->service->reset();
                self::fail('Expected concurrent reset rejection.');
            } catch (\RuntimeException $error) {
                self::assertStringContainsString('reset demo', $error->getMessage());
                self::assertSame($oldIds, $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id'));
            }
        } finally {
            $other->rollBack();
            $other->close();
        }
        self::assertCount(2, $this->service->reset());
    }

    public function testCommandRequiresConfirmationAndNeverPrintsTokensInAutomation(): void
    {
        $tester = new CommandTester(new ResetDemoCommand($this->service, 'dev', 'development', 'http://localhost:4200'));
        $this->service->reset();
        $ids = $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id');
        self::assertSame(1, $tester->execute([], ['interactive' => false]));
        self::assertSame($ids, $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id'));
        $tester->setInputs(['no']);
        self::assertSame(0, $tester->execute([], ['interactive' => true]));
        self::assertSame($ids, $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id'));
        self::assertSame(0, $tester->execute(['--force' => true], ['interactive' => false]));
        self::assertStringNotContainsString('#t=', $tester->getDisplay());
        $tester->setInputs(['yes']);
        self::assertSame(0, $tester->execute([], ['interactive' => true]));
        self::assertStringContainsString('http://localhost:4200/e#t=', $tester->getDisplay());
    }

    public function testHostGuardRejectsRemoteSocketAndNonPostgresWithoutConnecting(): void
    {
        foreach (['database', 'localhost', '127.0.0.1', '::1', 'remote.example', '', null] as $host) {
            $connection = DriverManager::getConnection(['driver' => 'pdo_pgsql', 'host' => $host, 'password' => 'secret-should-not-appear', 'serverVersion' => '18']);
            $registry = $this->createStub(ManagerRegistry::class);
            $registry->method('getConnection')->willReturn($connection);
            $repository = new OrmDemoResetRepository($registry, new DemoFixture(), $this->createStub(IdentifierGenerator::class), $this->createStub(AccessTokenGenerator::class));
            self::assertSame(in_array($host, ['database', 'localhost', '127.0.0.1', '::1'], true), $repository->isLocalPostgreSql());
            self::assertFalse($connection->isConnected());
            if (!in_array($host, ['database', 'localhost', '127.0.0.1', '::1'], true)) {
                $service = new DemoResetService($repository, new MockClock());
                $tester = new CommandTester(new ResetDemoCommand($service, 'dev', 'development', 'http://localhost:4200'));
                self::assertSame(1, $tester->execute(['--force' => true], ['interactive' => false]));
                self::assertStringNotContainsString('secret-should-not-appear', $tester->getDisplay());
            }
        }
        $registry = $this->createStub(ManagerRegistry::class);
        $registry->method('getConnection')->willReturn(DriverManager::getConnection(['driver' => 'pdo_sqlite', 'host' => 'localhost', 'memory' => true]));
        $repository = new OrmDemoResetRepository($registry, new DemoFixture(), $this->createStub(IdentifierGenerator::class), $this->createStub(AccessTokenGenerator::class));
        self::assertFalse($repository->isLocalPostgreSql());
    }

    public function testCommandRejectsUnsafeEnvironmentsWithoutModifyingData(): void
    {
        $this->service->reset();
        $ids = $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id');
        foreach ([['prod', 'development'], ['dev', 'production'], ['dev', null], ['test', 'development']] as [$app, $deployment]) {
            $tester = new CommandTester(new ResetDemoCommand($this->service, $app, $deployment, 'http://localhost:4200'));
            self::assertSame(1, $tester->execute(['--force' => true], ['interactive' => false]));
            self::assertSame($ids, $this->db->fetchFirstColumn('SELECT id FROM team ORDER BY id'));
        }
    }
}
