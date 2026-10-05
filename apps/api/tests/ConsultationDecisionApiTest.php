<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\MockClock;

final class ConsultationDecisionApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
    }

    public function testVoteIsPublicEditableAndIdempotentAndResolutionIsFinal(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->team();
        $consultation = $this->consultation($team);
        $id = $consultation['id'];
        $first = $consultation['options'][0]['id'];
        $second = $consultation['options'][1]['id'];
        $base = "/api/teams/current/consultations/$id";
        $vote = "$base/votes/{$team['participantId']}/options/$first";
        $server = ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
        $connection = static::getContainer()->get(Connection::class);

        $this->client->request('GET', $base, server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([0, 0], array_column($this->body()['options'], 'count'));

        $clock->modify('+1 minute');
        $this->client->jsonRequest('PUT', $vote, ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(1, $this->body()['consultation']['options'][0]['count']);
        self::assertSame($team['participantId'], $this->body()['consultation']['options'][0]['voters'][0]['id']);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $clock->modify('+1 minute');
        $this->client->jsonRequest('PUT', $vote, ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->client->jsonRequest('PUT', "$base/votes/{$team['participantId']}/options/$second", ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([1, 1], array_column($this->body()['consultation']['options'], 'count'));

        $this->client->jsonRequest('PUT', $vote, ['selected' => false], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([0, 1], array_column($this->body()['consultation']['options'], 'count'));

        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$first, $second]], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('resolved', $this->body()['consultation']['state']);
        self::assertSame([$first, $second], $this->body()['consultation']['resolution']['acceptedOptionIds']);

        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$second, $first]], server: $server);
        self::assertResponseStatusCodeSame(200);
        $this->client->jsonRequest('PUT', $vote, ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-closed', $this->body()['type']);
        $this->client->request('GET', '/api/teams/current/consultations', server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([], $this->body()['open']);
        self::assertSame($id, $this->body()['resolved'][0]['id']);
    }

    public function testInvalidForeignOptionsAndRejectedResolutionDoNotWritePartially(): void
    {
        $team = $this->team();
        $consultation = $this->consultation($team);
        $other = $this->consultation($team);
        $base = '/api/teams/current/consultations/' . $consultation['id'];
        $server = ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
        $foreignOption = $other['options'][0]['id'];
        $this->client->jsonRequest('PUT', "$base/votes/{$team['participantId']}/options/$foreignOption", ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(404);
        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$consultation['options'][0]['id'], $foreignOption]], server: $server);
        self::assertResponseStatusCodeSame(404);
        self::assertSame(0, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_resolution_option'));
        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => []], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('rejected', $this->body()['consultation']['state']);
        self::assertSame([], $this->body()['consultation']['resolution']['acceptedOptionIds']);
    }

    public function testPastDateReceivesVotesFromTwoParticipantsAndTeamDeletionCascades(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->team();
        $server = ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Bea'], server: $server);
        self::assertResponseStatusCodeSame(201);
        $second = $this->body()['participant']['id'];
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Fecha', 'options' => ['2026-10-06'], 'timeZone' => 'UTC'], server: $server);
        self::assertResponseStatusCodeSame(201);
        $consultation = $this->body()['consultation'];
        $base = '/api/teams/current/consultations/' . $consultation['id'];
        $option = $consultation['options'][0]['id'];
        $clock->modify('+2 days');
        foreach ([$team['participantId'], $second] as $participant) {
            $this->client->jsonRequest('PUT', "$base/votes/$participant/options/$option", ['selected' => true], server: $server);
            self::assertResponseStatusCodeSame(200);
        }
        self::assertSame(2, $this->body()['consultation']['options'][0]['count']);
        self::assertSame(['Ana', 'Bea'], array_column($this->body()['consultation']['options'][0]['voters'], 'name'));
        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $second, 'status' => 'resolved', 'acceptedOptionIds' => [$option]], server: $server);
        self::assertResponseStatusCodeSame(200);
        $connection = static::getContainer()->get(Connection::class);
        $connection->executeStatement('DELETE FROM team WHERE id = ?', [$team['id']]);
        foreach (['consultation', 'consultation_option', 'consultation_vote', 'consultation_vote_selection', 'consultation_resolution_option'] as $table) {
            self::assertSame(0, (int) $connection->fetchOne("SELECT COUNT(*) FROM $table"), $table);
        }
    }

    public function testVoteAndResolutionSerializeThroughTheTeamLock(): void
    {
        $team = $this->team();
        $consultation = $this->consultation($team);
        $connection = static::getContainer()->get(Connection::class);
        $workers = [];
        $connection->beginTransaction();
        try {
            $connection->executeQuery('SELECT id FROM team WHERE id = ? FOR UPDATE', [$team['id']])->fetchOne();
            foreach (['vote', 'resolve'] as $mode) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_consultation.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                fwrite($pipes[0], json_encode([
                    'mode' => $mode,
                    'token' => $team['token'],
                    'consultationId' => $consultation['id'],
                    'participantId' => $team['participantId'],
                    'optionId' => $consultation['options'][0]['id'],
                ], JSON_THROW_ON_ERROR) . "\n");
                fclose($pipes[0]);
                $workers[] = [$process, $pipes];
            }
            $pids = array_map(static fn(array $worker): string => (string) proc_get_status($worker[0])['pid'], $workers);
            $deadline = microtime(true) + 5;
            do {
                $waiting = (int) $connection->fetchOne("SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name IN (?, ?) AND wait_event_type = 'Lock'", $pids);
                if ($waiting === 2) {
                    break;
                }
                usleep(20_000);
            } while (microtime(true) < $deadline);
            self::assertSame(2, $waiting);
            $connection->commit();
            $outcomes = [];
            foreach ($workers as [$process, $pipes]) {
                $outcomes[] = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
            }
            self::assertSame('SAVED', $outcomes[1]);
            self::assertContains($outcomes[0], ['SAVED', 'CLOSED']);
            self::assertSame('resolved', $connection->fetchOne('SELECT state FROM consultation WHERE id = ?', [$consultation['id']]));
            self::assertSame(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_resolution_option WHERE consultation_id = ?', [$consultation['id']]));
            self::assertLessThanOrEqual(1, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_vote_selection'));
        } finally {
            if ($connection->isTransactionActive()) {
                $connection->rollBack();
            }
            foreach ($workers as [$process, $pipes]) {
                if (is_resource($pipes[0])) {
                    fclose($pipes[0]);
                }
                if (is_resource($pipes[1])) {
                    fclose($pipes[1]);
                }
                if (is_resource($pipes[2])) {
                    fclose($pipes[2]);
                }
                if (is_resource($process)) {
                    proc_terminate($process);
                }
            }
        }
    }

    public function testFailedVotePersistenceRollsBackSelectionAndActivity(): void
    {
        $this->client->disableReboot();
        $clock = new MockClock('2026-10-05T12:00:00+00:00');
        static::getContainer()->set('clock', $clock);
        $team = $this->team();
        $consultation = $this->consultation($team);
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("CREATE FUNCTION fail_consultation_vote_selection() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced vote failure'; END; $$");
        $connection->executeStatement('CREATE TRIGGER fail_consultation_vote_selection BEFORE INSERT ON consultation_vote_selection FOR EACH ROW EXECUTE FUNCTION fail_consultation_vote_selection()');
        try {
            $clock->modify('+1 minute');
            $path = '/api/teams/current/consultations/' . $consultation['id'] . '/votes/' . $team['participantId'] . '/options/' . $consultation['options'][0]['id'];
            $this->client->jsonRequest('PUT', $path, ['selected' => true], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(500);
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_vote'));
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_vote_selection'));
            self::assertSame($activity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        } finally {
            $connection->executeStatement('DROP TRIGGER IF EXISTS fail_consultation_vote_selection ON consultation_vote_selection');
            $connection->executeStatement('DROP FUNCTION IF EXISTS fail_consultation_vote_selection()');
        }
    }

    public function testDetailAndMutationsRejectMissingForeignAndExpiredAccess(): void
    {
        $team = $this->team();
        $consultation = $this->consultation($team);
        $other = $this->team();
        $base = '/api/teams/current/consultations/' . $consultation['id'];
        $vote = "$base/votes/{$team['participantId']}/options/{$consultation['options'][0]['id']}";
        $this->client->request('GET', $base);
        self::assertResponseStatusCodeSame(401);
        $this->client->jsonRequest('PUT', $vote, ['selected' => true]);
        self::assertResponseStatusCodeSame(401);
        $this->client->request('GET', $base, server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $other['token']]);
        self::assertResponseStatusCodeSame(404);
        $this->client->jsonRequest('PUT', $vote, ['selected' => true], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $other['token']]);
        self::assertResponseStatusCodeSame(404);
        $connection = static::getContainer()->get(Connection::class);
        $connection->update('team', ['last_activity_at' => '2020-01-01 00:00:00+00'], ['id' => $team['id']]);
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $this->client->request('GET', $base, server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
        $this->client->jsonRequest('PUT', "$base/resolution", ['participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => []], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(410);
    }

    /** @return array<string, mixed> */
    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }

    /** @return array{id: string, participantId: string, token: string} */
    private function team(): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $team = $this->body();
        return ['id' => $team['id'], 'participantId' => $team['firstParticipant']['id'], 'token' => substr($team['accessUrl'], strpos($team['accessUrl'], '#t=') + 3)];
    }

    /** @param array{id: string, participantId: string, token: string} $team
     * @return array<string, mixed>
     */
    private function consultation(array $team): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => ['Sí', 'No']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        return $this->body()['consultation'];
    }
}
