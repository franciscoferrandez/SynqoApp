<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Mail\MailAttemptProcessor;
use App\Application\Mail\MailAttemptStatus;
use App\Application\Mail\TeamLinkMailer;
use App\Infrastructure\Mail\EmailLayout;
use App\Infrastructure\Mail\SodiumPayloadCipher;
use App\Infrastructure\Mail\TeamLinkMessage;
use App\Infrastructure\Persistence\OrmMailAttemptRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\MockClock;

final class TeamMailAttemptTest extends WebTestCase
{
    private KernelBrowser $client;
    private Connection $db;
    private MockClock $clock;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        $this->client->disableReboot();
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM participant');
        $this->db->executeStatement('DELETE FROM team');
        $this->clock = new MockClock('now');
        static::getContainer()->set('clock', $this->clock);
    }

    public function testCreationWithoutEmailCreatesNoEventAndNoAttempt(): void
    {
        foreach ([[], ['email' => null], ['email' => '   ']] as $extra) {
            $created = $this->create($extra);
            self::assertArrayNotHasKey('mailAttempt', $created);
        }
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_mail_attempt'));
    }

    public function testInvalidEmailIsRejectedBeforeAnythingIsStored(): void
    {
        foreach (['no-es-un-correo', 'a@b', str_repeat('a', 250) . '@example.com', "x@example.com\r\nBcc: y@example.com"] as $email) {
            $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'email' => $email]);
            self::assertResponseStatusCodeSame(422);
            self::assertSame('email', json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['violations'][0]['propertyPath']);
        }
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'email' => 42]);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_mail_attempt'));
    }

    public function testCreationStoresOnlyProtectedPendingEventAndAReceipt(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $token = $this->token($created);
        self::assertSame('pending', $created['mailAttempt']['status']);
        $receipt = $created['mailAttempt']['receipt'];
        self::assertNotSame($token, $receipt);
        self::assertSame(43, strlen($receipt));

        $row = $this->db->fetchAssociative('SELECT * FROM team_mail_attempt WHERE team_id = ?', [$created['id']]);
        self::assertSame('pending', $row['status']);
        self::assertSame(hash('sha256', $receipt), trim($row['receipt_verifier']));
        $dump = json_encode($row, JSON_THROW_ON_ERROR);
        foreach (['persona@example.com', $token, $receipt] as $secret) {
            self::assertStringNotContainsString($secret, $dump);
        }
        $decoded = json_decode((new SodiumPayloadCipher($_SERVER['MAIL_EVENT_KEY']))->decrypt($row['payload']), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame(['email' => 'persona@example.com', 'token' => $token], $decoded);
        self::assertSame(1800, (new DateTimeImmutable($row['expires_at']))->getTimestamp() - (new DateTimeImmutable($row['created_at']))->getTimestamp());
    }

    public function testTeamAndEventAreCreatedTogetherOrNotAtAll(): void
    {
        $first = $this->create(['email' => 'uno@example.com']);
        $verifier = hash('sha256', $first['mailAttempt']['receipt']);
        $repository = static::getContainer()->get('doctrine')->getManager();
        self::assertNotNull($repository);
        $teams = static::getContainer()->get(\App\Application\Team\TeamRepository::class);
        $before = (int) $this->db->fetchOne('SELECT COUNT(*) FROM team');
        $now = '2026-10-06 10:00:00+00';
        try {
            $teams->create(
                ['id' => '00000000-0000-4000-8000-000000000001', 'name' => 'Huérfano', 'access_verifier' => str_repeat('a', 64), 'time_zone' => 'UTC', 'created_at' => $now, 'last_activity_at' => $now],
                ['id' => '00000000-0000-4000-8000-000000000002', 'name' => 'Ana', 'name_normalized' => 'ana', 'created_at' => $now],
                ['id' => '00000000-0000-4000-8000-000000000003', 'receipt_verifier' => $verifier, 'payload' => 'x', 'created_at' => $now, 'expires_at' => $now],
            );
            self::fail('The duplicate receipt must abort the transaction.');
        } catch (\Throwable) {
        }
        self::assertSame($before, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM participant WHERE id = ?', ['00000000-0000-4000-8000-000000000002']));
    }

    public function testMissingEncryptionKeyFailsCreationWithoutStoringAnything(): void
    {
        $service = new \App\Application\Team\TeamService(
            static::getContainer()->get(\App\Application\Team\TeamRepository::class),
            $this->clock,
            new \App\Domain\Team\ExpiryCalculator(),
            new \App\Infrastructure\Identity\UuidGenerator(),
            new \App\Infrastructure\Identity\CryptographicAccessTokenGenerator(),
            new SodiumPayloadCipher(''),
            'http://localhost:4200',
            1800,
        );
        try {
            $service->create('Equipo', 'Ana', 'UTC', 'persona@example.com');
            self::fail('A missing key must fail closed.');
        } catch (\RuntimeException) {
        }
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team'));
    }

    public function testStatusEndpointIsPrivateAndOnlyReturnsStatus(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $receipt = $created['mailAttempt']['receipt'];

        $this->client->request('GET', '/api/mail-attempts/current');
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'MailReceipt');
        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_X_MAIL_RECEIPT' => 'otro']);
        self::assertResponseStatusCodeSame(404);
        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $this->token($created)]);
        self::assertResponseStatusCodeSame(401);
        $this->client->request('GET', '/api/mail-attempts/' . $receipt);
        self::assertResponseStatusCodeSame(404);

        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_X_MAIL_RECEIPT' => $receipt]);
        self::assertResponseStatusCodeSame(200);
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        self::assertSame(['status' => 'pending'], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));

        $this->processor(new RecordingMailer())->processNext();
        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_X_MAIL_RECEIPT' => $receipt]);
        self::assertSame(['status' => 'succeeded'], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));
    }

    public function testSuccessfulAttemptSendsOnceAndClearsSecrets(): void
    {
        $created = $this->create(['email' => 'persona@example.com', 'name' => 'La cena']);
        $mailer = new RecordingMailer();
        $processor = $this->processor($mailer);

        self::assertTrue($processor->processNext());
        self::assertFalse($processor->processNext());
        self::assertSame([['persona@example.com', 'La cena', 'http://localhost:4200/e#t=' . $this->token($created)]], $mailer->sent);
        $this->assertClosed($created, 'succeeded');
    }

    public function testFailureTimeoutAndUncertainResultAreFailedWithoutRetry(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $mailer = new RecordingMailer(new \RuntimeException('persona@example.com rechazado'));
        $processor = $this->processor($mailer);

        self::assertTrue($processor->processNext());
        self::assertFalse($processor->processNext());
        self::assertFalse($processor->processNext());
        self::assertCount(1, $mailer->sent);
        $this->assertClosed($created, 'failed');
    }

    public function testAttemptIsStartedDurablyBeforeTheAdapterIsCalled(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $observed = null;
        $db = $this->db;
        $mailer = new RecordingMailer(onSend: static function () use (&$observed, $db, $created): void {
            $observed = $db->fetchOne('SELECT status FROM team_mail_attempt WHERE team_id = ?', [$created['id']]);
        });
        $this->processor($mailer)->processNext();
        self::assertSame('started', $observed);
    }

    public function testCrashAfterClaimNeverRetriesAndExpiryClosesIt(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $repository = new OrmMailAttemptRepository(static::getContainer()->get('doctrine'));
        self::assertNotNull($repository->claimNext($this->clock->now()));
        $mailer = new RecordingMailer();
        $processor = $this->processor($mailer);

        self::assertFalse($processor->processNext());
        self::assertSame(MailAttemptStatus::Started->value, $this->db->fetchOne('SELECT status FROM team_mail_attempt WHERE team_id = ?', [$created['id']]));
        $this->clock->sleep(1799);
        self::assertSame(0, $processor->expireOverdue());
        $this->clock->sleep(1);
        self::assertSame(1, $processor->expireOverdue());
        self::assertSame([], $mailer->sent);
        $this->assertClosed($created, 'failed');
    }

    public function testOverduePendingEventIsClosedWithoutCallingTheProvider(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $mailer = new RecordingMailer();
        $processor = $this->processor($mailer);
        $this->clock->sleep(1800);

        self::assertFalse($processor->processNext());
        self::assertSame(1, $processor->expireOverdue());
        self::assertSame([], $mailer->sent);
        $this->assertClosed($created, 'failed');
    }

    public function testExpiryRacingAFinishingWorkerKeepsTheFirstClosure(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $repository = new OrmMailAttemptRepository(static::getContainer()->get('doctrine'));
        $claimed = $repository->claimNext($this->clock->now());
        self::assertNotNull($claimed);
        $this->clock->sleep(1800);
        self::assertSame(1, $repository->expireOverdue($this->clock->now()));
        self::assertFalse($repository->finish($claimed['id'], MailAttemptStatus::Succeeded, $this->clock->now()));
        $this->assertClosed($created, 'failed');
    }

    public function testClaimSkipsRowsLockedByAnotherWorkerAndNeverReclaims(): void
    {
        $first = $this->create(['email' => 'uno@example.com']);
        $second = $this->create(['email' => 'dos@example.com']);
        $other = DriverManager::getConnection(static::getContainer()->get(Connection::class)->getParams());
        $other->beginTransaction();
        $other->fetchOne("SELECT id FROM team_mail_attempt WHERE team_id = ? FOR UPDATE", [$first['id']]);
        try {
            $repository = new OrmMailAttemptRepository(static::getContainer()->get('doctrine'));
            $claimed = $repository->claimNext($this->clock->now());
            self::assertNotNull($claimed);
            self::assertSame($this->db->fetchOne('SELECT id FROM team_mail_attempt WHERE team_id = ?', [$second['id']]), $claimed['id']);
            self::assertNull($repository->claimNext($this->clock->now()));
        } finally {
            $other->rollBack();
            $other->close();
        }
    }

    public function testTwoWorkersSendEachEventExactlyOnce(): void
    {
        $recipients = [];
        for ($i = 1; $i <= 6; ++$i) {
            $this->create(['email' => "persona{$i}@example.com"]);
            $recipients[] = "persona{$i}@example.com";
        }
        $log = tempnam(sys_get_temp_dir(), 'mail-log');
        self::assertIsString($log);
        $processes = [];
        try {
            for ($i = 0; $i < 2; ++$i) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_mail_worker.php', $log], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, [...getenv(), 'MAIL_EVENT_KEY' => $_SERVER['MAIL_EVENT_KEY']]);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                $processes[] = [$process, $pipes];
            }
            foreach ($processes as [, $pipes]) {
                fwrite($pipes[0], "GO\n");
                fclose($pipes[0]);
            }
            $total = 0;
            foreach ($processes as [$process, $pipes]) {
                $output = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
                $total += (int) substr($output, strlen('DONE '));
            }
            self::assertSame(6, $total);
            $sent = array_filter(explode("\n", (string) file_get_contents($log)));
            sort($sent);
            self::assertSame($recipients, $sent);
            self::assertSame(6, (int) $this->db->fetchOne("SELECT COUNT(*) FROM team_mail_attempt WHERE status = 'succeeded' AND payload IS NULL"));
        } finally {
            unlink($log);
        }
    }

    public function testStatusReadClosesOverdueAttemptsEvenWithoutAWorker(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $this->clock->sleep(1800);
        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_X_MAIL_RECEIPT' => $created['mailAttempt']['receipt']]);
        self::assertSame(['status' => 'failed'], json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR));
        $this->assertClosed($created, 'failed');
    }

    public function testDeletingATeamDeletesItsAttemptResult(): void
    {
        $created = $this->create(['email' => 'persona@example.com']);
        $this->db->executeStatement('DELETE FROM team WHERE id = ?', [$created['id']]);
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team_mail_attempt'));
        $this->client->request('GET', '/api/mail-attempts/current', server: ['HTTP_X_MAIL_RECEIPT' => $created['mailAttempt']['receipt']]);
        self::assertResponseStatusCodeSame(404);
    }

    public function testMessageHasHtmlAndTextWithEscapedContentAndNoExternalResources(): void
    {
        $url = 'http://localhost:4200/e#t=' . str_repeat('abc-_', 40);
        $message = (new TeamLinkMessage(new EmailLayout()))->compose('Equipo <script>&"\'', $url);

        self::assertStringContainsString('lang="es"', $message['html']);
        self::assertStringContainsString('name="viewport"', $message['html']);
        self::assertStringNotContainsString('<script>', $message['html']);
        self::assertStringContainsString('Equipo &lt;script&gt;', $message['html']);
        self::assertSame(2, substr_count($message['html'], 'href="' . $url . '"'));
        self::assertStringContainsString($url . '</a>', $message['html']);
        self::assertDoesNotMatchRegularExpression('/<img|src=|url\(|@import|<link/i', $message['html']);
        self::assertStringContainsString($url, $message['text']);
        self::assertStringContainsString('Equipo <script>', $message['text']);
        self::assertStringNotContainsString('<', strip_tags(str_replace('Equipo <script>&"\'', '', $message['text'])));
    }

    /**
     * @param array<string, mixed> $extra
     * @return array<string, mixed>
     */
    private function create(array $extra): array
    {
        $this->client->jsonRequest('POST', '/api/teams', $extra + ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);

        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }

    /** @param array<string, mixed> $created */
    private function token(array $created): string
    {
        return substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
    }

    private function processor(TeamLinkMailer $mailer): MailAttemptProcessor
    {
        return new MailAttemptProcessor(
            new OrmMailAttemptRepository(static::getContainer()->get('doctrine')),
            new SodiumPayloadCipher($_SERVER['MAIL_EVENT_KEY']),
            $mailer,
            $this->clock,
            'http://localhost:4200',
        );
    }

    /** @param array<string, mixed> $created */
    private function assertClosed(array $created, string $status): void
    {
        $row = $this->db->fetchAssociative('SELECT * FROM team_mail_attempt WHERE team_id = ?', [$created['id']]);
        self::assertSame($status, $row['status']);
        self::assertNull($row['payload']);
        self::assertNotNull($row['finished_at']);
        $dump = json_encode($row, JSON_THROW_ON_ERROR);
        self::assertStringNotContainsString('persona@example.com', $dump);
        self::assertStringNotContainsString($this->token($created), $dump);
    }
}

final class RecordingMailer implements TeamLinkMailer
{
    /** @var list<array{string, string, string}> */
    public array $sent = [];

    public function __construct(private readonly ?\Throwable $failure = null, private readonly ?\Closure $onSend = null) {}

    public function send(string $recipient, string $teamName, string $accessUrl): void
    {
        $this->sent[] = [$recipient, $teamName, $accessUrl];
        if ($this->onSend !== null) {
            ($this->onSend)();
        }
        if ($this->failure !== null) {
            throw $this->failure;
        }
    }
}
