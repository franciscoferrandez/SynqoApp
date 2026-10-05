<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Team\TeamCleanupService;
use App\Infrastructure\Console\CleanupTeamsCommand;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Console\Tester\CommandTester;

final class TeamCleanupTest extends WebTestCase
{
    private Connection $db;
    private MockClock $clock;
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        $this->client->disableReboot();
        $this->clock = new MockClock('2025-07-14T23:59:59+00:00');
        static::getContainer()->set('clock', $this->clock);
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM participant');
        $this->db->executeStatement('DELETE FROM team');
    }

    public function testCommandDeletesAtExactBoundaryAndIsSafeToRepeat(): void
    {
        $client = $this->client;
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Caducado', 'firstParticipantName' => 'Ana', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $token = substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3);
        $headers = ['HTTP_AUTHORIZATION' => 'Bearer ' . $token];
        $client->jsonRequest('POST', '/api/teams/current/consultations', [
            'participantId' => $created['firstParticipant']['id'],
            'title' => 'Consulta que debe borrarse',
            'options' => ['Sí', 'No'],
        ], server: $headers);
        self::assertResponseStatusCodeSame(201);
        $consultation = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['consultation'];
        $futureDate = (new DateTimeImmutable('today', new DateTimeZone('UTC')))->modify('+3 days')->format('Y-m-d');
        $client->jsonRequest('PUT', '/api/teams/current/availability/' . $futureDate . '/participants/' . $created['firstParticipant']['id'], [
            'state' => 'available',
            'timeZone' => 'UTC',
        ], server: $headers);
        self::assertResponseStatusCodeSame(200);
        $this->db->update('team', ['last_activity_at' => '2025-01-15 12:00:00+00'], ['id' => $created['id']]);

        [$codeBefore, $outputBefore] = $this->runCommand();
        self::assertSame(0, $codeBefore);
        self::assertStringContainsString('0.', $outputBefore);
        self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team WHERE id = ?', [$created['id']]));
        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(410);

        $this->clock->sleep(1);
        [$codeAtBoundary, $outputAtBoundary] = $this->runCommand();
        self::assertSame(0, $codeAtBoundary);
        self::assertStringContainsString('1.', $outputAtBoundary);
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team WHERE id = ?', [$created['id']]));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM availability WHERE team_id = ?', [$created['id']]));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM consultation WHERE team_id = ?', [$created['id']]));
        self::assertSame(0, (int) $this->db->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE consultation_id = ?', [$consultation['id']]));

        $client->request('GET', '/api/teams/current', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        self::assertResponseStatusCodeSame(404);
        self::assertStringNotContainsString('Caducado', $client->getResponse()->getContent());
        [$codeAfter, $outputAfter] = $this->runCommand();
        self::assertSame(0, $codeAfter);
        self::assertStringContainsString('0.', $outputAfter);
    }

    public function testFailureToDeleteRootRollsBackTheTeamAndItsParticipants(): void
    {
        $client = $this->client;
        $client->jsonRequest('POST', '/api/teams', ['name' => 'Rollback', 'firstParticipantName' => 'Bea', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        $this->db->update('team', ['last_activity_at' => '2025-01-15 12:00:00+00'], ['id' => $created['id']]);
        $this->clock->sleep(1);
        $this->db->executeStatement("CREATE FUNCTION reject_participant_delete() RETURNS trigger LANGUAGE plpgsql AS '
            BEGIN RAISE EXCEPTION ''forced cleanup failure''; END;
        '");
        $this->db->executeStatement('CREATE TRIGGER reject_participant_delete BEFORE DELETE ON participant FOR EACH ROW EXECUTE FUNCTION reject_participant_delete()');

        try {
            $failed = false;
            try {
                static::getContainer()->get(TeamCleanupService::class)->clean();
            } catch (\Throwable) {
                $failed = true;
            }
            self::assertTrue($failed, 'The injected PostgreSQL failure must abort cleanup.');
            self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM team WHERE id = ?', [$created['id']]));
            self::assertSame(1, (int) $this->db->fetchOne('SELECT COUNT(*) FROM participant WHERE team_id = ?', [$created['id']]));
        } finally {
            $this->db->executeStatement('DROP TRIGGER reject_participant_delete ON participant');
            $this->db->executeStatement('DROP FUNCTION reject_participant_delete()');
        }
    }

    /** @return array{int, string} */
    private function runCommand(): array
    {
        $tester = new CommandTester(static::getContainer()->get(CleanupTeamsCommand::class));
        $code = $tester->execute([]);
        return [$code, $tester->getDisplay()];
    }
}
