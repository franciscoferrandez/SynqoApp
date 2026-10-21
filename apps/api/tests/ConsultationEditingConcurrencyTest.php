<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Uid\Uuid;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ConsultationEditingConcurrencyTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        $this->client->disableReboot();
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        static::getContainer()->set('clock', new MockClock('2026-10-21T12:00:00+00:00'));
    }

    public function testVotingAndRenamingAChoiceSerializeInEitherOrder(): void
    {
        $team = $this->createTeam();
        $consultation = $this->createConsultation($team);
        $option = $consultation['options'][0];
        $edit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['update' => [['id' => $option['id'], 'text' => 'Renombrada']]]],
        ];
        $vote = [
            'method' => 'PUT', 'path' => $this->consultationPath($consultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $option['id'],
            'token' => $team['token'], 'body' => ['selected' => true],
        ];

        $first = $this->runConcurrent($team, [$edit, $vote]);
        self::assertSame(200, $first[0]['status']);
        self::assertSame(200, $first[1]['status']);
        self::assertSame('Renombrada', $this->optionText($option['id']));
        self::assertSame(1, $this->voteCount($consultation['id']));

        $secondConsultation = $this->createConsultation($team);
        $secondOption = $secondConsultation['options'][0];
        $secondVote = [
            'method' => 'PUT', 'path' => $this->consultationPath($secondConsultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $secondOption['id'],
            'token' => $team['token'], 'body' => ['selected' => true],
        ];
        $secondEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($secondConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['update' => [['id' => $secondOption['id'], 'text' => 'Bloqueada por voto']]]],
        ];

        $second = $this->runConcurrent($team, [$secondVote, $secondEdit]);
        self::assertSame(200, $second[0]['status']);
        self::assertSame(409, $second[1]['status']);
        self::assertSame('urn:synqo:problem:consultation-edit-conflict', json_decode($second[1]['body'], true, flags: JSON_THROW_ON_ERROR)['type']);
        self::assertSame('Opción A', $this->optionText($secondOption['id']));
        self::assertSame(1, $this->voteCount($secondConsultation['id']));
    }

    public function testEditingAndResolvingSerializeInEitherOrder(): void
    {
        $team = $this->createTeam();
        $consultation = $this->createConsultation($team);
        $option = $consultation['options'][0];
        $edit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'title' => 'Editada antes de cerrar'],
        ];
        $resolve = [
            'method' => 'PUT', 'path' => $this->consultationPath($consultation['id']) . '/resolution', 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$option['id']]],
        ];

        $first = $this->runConcurrent($team, [$edit, $resolve]);
        self::assertSame([200, 200], array_column($first, 'status'));
        self::assertSame('resolved', $this->consultationState($consultation['id']));
        self::assertSame('Editada antes de cerrar', $this->consultationTitle($consultation['id']));

        $secondConsultation = $this->createConsultation($team);
        $secondResolve = [
            'method' => 'PUT', 'path' => $this->consultationPath($secondConsultation['id']) . '/resolution', 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$secondConsultation['options'][0]['id']]],
        ];
        $secondEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($secondConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'title' => 'No se edita cerrada'],
        ];

        $second = $this->runConcurrent($team, [$secondResolve, $secondEdit]);
        self::assertSame(200, $second[0]['status']);
        self::assertSame(409, $second[1]['status']);
        self::assertSame('urn:synqo:problem:consultation-closed', json_decode($second[1]['body'], true, flags: JSON_THROW_ON_ERROR)['type']);
        self::assertSame('Pregunta', $this->consultationTitle($secondConsultation['id']));
        self::assertSame('resolved', $this->consultationState($secondConsultation['id']));
    }

    public function testConcurrentEditsToDifferentFieldsPreserveBothChangesInEitherOrder(): void
    {
        $team = $this->createTeam();
        $consultation = $this->createConsultation($team);
        $newOptionId = Uuid::v7()->toRfc4122();
        $titleEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'title' => 'Título concurrente'],
        ];
        $optionEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $newOptionId, 'text' => 'Nueva concurrente']]]],
        ];

        $first = $this->runConcurrent($team, [$titleEdit, $optionEdit]);
        self::assertSame([200, 200], array_column($first, 'status'));
        self::assertSame('Título concurrente', $this->consultationTitle($consultation['id']));
        self::assertSame('Nueva concurrente', $this->optionText($newOptionId));

        $otherConsultation = $this->createConsultation($team);
        $otherOptionId = Uuid::v7()->toRfc4122();
        $otherTitleEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($otherConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'title' => 'Otro título'],
        ];
        $otherOptionEdit = [
            'method' => 'PATCH', 'path' => $this->consultationPath($otherConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $otherOptionId, 'text' => 'Otra nueva']]]],
        ];

        $second = $this->runConcurrent($team, [$otherOptionEdit, $otherTitleEdit]);
        self::assertSame([200, 200], array_column($second, 'status'));
        self::assertSame('Otro título', $this->consultationTitle($otherConsultation['id']));
        self::assertSame('Otra nueva', $this->optionText($otherOptionId));
    }

    public function testRemovingAnOptionAndChangingItsVotesSerializeInEitherOrder(): void
    {
        $team = $this->createTeam();
        $consultation = $this->createConsultation($team);
        $optionId = $consultation['options'][0]['id'];
        $remove = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['remove' => [$optionId]]],
        ];
        $vote = [
            'method' => 'PUT', 'path' => $this->consultationPath($consultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $optionId,
            'token' => $team['token'], 'body' => ['selected' => true],
        ];

        $removedFirst = $this->runConcurrent($team, [$remove, $vote]);
        self::assertSame(200, $removedFirst[0]['status']);
        self::assertSame(404, $removedFirst[1]['status']);
        self::assertSame(1, $this->optionCount($consultation['id']));
        self::assertSame(0, $this->voteCount($consultation['id']));

        $secondConsultation = $this->createConsultation($team);
        $secondOptionId = $secondConsultation['options'][0]['id'];
        $secondRemove = [
            'method' => 'PATCH', 'path' => $this->consultationPath($secondConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['remove' => [$secondOptionId]]],
        ];
        $secondVote = [
            'method' => 'PUT', 'path' => $this->consultationPath($secondConsultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $secondOptionId,
            'token' => $team['token'], 'body' => ['selected' => true],
        ];
        $voteFirst = $this->runConcurrent($team, [$secondVote, $secondRemove]);
        self::assertSame(200, $voteFirst[0]['status']);
        self::assertSame(409, $voteFirst[1]['status']);
        self::assertSame('urn:synqo:problem:consultation-removal-confirmation-required', json_decode($voteFirst[1]['body'], true, flags: JSON_THROW_ON_ERROR)['type']);
        self::assertSame(2, $this->optionCount($secondConsultation['id']));
        self::assertSame(1, $this->voteCount($secondConsultation['id']));
    }

    public function testWithdrawingAVoteAndRenamingItsOptionSerializeInEitherOrder(): void
    {
        $team = $this->createTeam();
        $consultation = $this->createConsultation($team);
        $optionId = $consultation['options'][0]['id'];
        $votePath = $this->consultationPath($consultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $optionId;
        $this->client->jsonRequest('PUT', $votePath, ['selected' => true], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $withdraw = ['method' => 'PUT', 'path' => $votePath, 'token' => $team['token'], 'body' => ['selected' => false]];
        $rename = [
            'method' => 'PATCH', 'path' => $this->consultationPath($consultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['update' => [['id' => $optionId, 'text' => 'Retirada antes de renombrar']]]],
        ];

        $withdrawFirst = $this->runConcurrent($team, [$withdraw, $rename]);
        self::assertSame([200, 200], array_column($withdrawFirst, 'status'));
        self::assertSame('Retirada antes de renombrar', $this->optionText($optionId));
        self::assertSame(0, $this->voteCount($consultation['id']));

        $secondConsultation = $this->createConsultation($team);
        $secondOptionId = $secondConsultation['options'][0]['id'];
        $secondVotePath = $this->consultationPath($secondConsultation['id']) . '/votes/' . $team['participantId'] . '/options/' . $secondOptionId;
        $this->client->jsonRequest('PUT', $secondVotePath, ['selected' => true], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
        $secondWithdraw = ['method' => 'PUT', 'path' => $secondVotePath, 'token' => $team['token'], 'body' => ['selected' => false]];
        $secondRename = [
            'method' => 'PATCH', 'path' => $this->consultationPath($secondConsultation['id']), 'token' => $team['token'],
            'body' => ['participantId' => $team['participantId'], 'optionChanges' => ['update' => [['id' => $secondOptionId, 'text' => 'Renombrado primero']]]],
        ];
        $renameFirst = $this->runConcurrent($team, [$secondRename, $secondWithdraw]);
        self::assertSame(409, $renameFirst[0]['status']);
        self::assertSame(200, $renameFirst[1]['status']);
        self::assertSame('Opción A', $this->optionText($secondOptionId));
        self::assertSame(0, $this->voteCount($secondConsultation['id']));
    }

    private function runConcurrent(array $team, array $requests): array
    {
        $connection = static::getContainer()->get(Connection::class);
        $workers = [];
        $connection->beginTransaction();
        try {
            $connection->executeQuery('SELECT id FROM team WHERE id = ? FOR UPDATE', [$team['id']])->fetchOne();
            foreach ($requests as $request) {
                $process = proc_open([PHP_BINARY, '-r', $this->workerScript()], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, dirname(__DIR__));
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                fwrite($pipes[0], json_encode($request, JSON_THROW_ON_ERROR) . "\n");
                fclose($pipes[0]);
                $workers[] = [$process, $pipes];
                $queuedPids = array_map(static fn(array $worker): string => (string) proc_get_status($worker[0])['pid'], $workers);
                $queueDeadline = microtime(true) + 5;
                do {
                    $connection->executeStatement('SELECT pg_stat_clear_snapshot()');
                    $queueSql = count($queuedPids) === 1
                        ? "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name = ? AND wait_event_type = 'Lock'"
                        : "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name IN (?, ?) AND wait_event_type = 'Lock'";
                    $queued = (int) $connection->fetchOne($queueSql, $queuedPids);
                    if ($queued === count($workers)) {
                        break;
                    }
                    usleep(20_000);
                } while (microtime(true) < $queueDeadline);
                if ($queued !== count($workers)) {
                    $sessions = $connection->fetchAllAssociative("SELECT pid, application_name, state, wait_event_type, wait_event FROM pg_stat_activity WHERE datname = current_database()");
                    $states = array_map(static fn(array $worker): array => ['status' => proc_get_status($worker[0]), 'stdout' => stream_get_contents($worker[1][1]), 'stderr' => stream_get_contents($worker[1][2])], $workers);
                    self::fail(sprintf('Workers did not queue on the team lock. PIDs: %s; sessions: %s; workers: %s', json_encode($queuedPids, JSON_THROW_ON_ERROR), json_encode($sessions, JSON_THROW_ON_ERROR), json_encode($states, JSON_THROW_ON_ERROR)));
                }
            }
            $pids = array_map(static fn(array $worker): string => (string) proc_get_status($worker[0])['pid'], $workers);
            $deadline = microtime(true) + 5;
            do {
                $connection->executeStatement('SELECT pg_stat_clear_snapshot()');
                $waiting = (int) $connection->fetchOne("SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND application_name IN (?, ?) AND wait_event_type = 'Lock'", $pids);
                if ($waiting === count($workers)) {
                    break;
                }
                usleep(20_000);
            } while (microtime(true) < $deadline);
            self::assertSame(count($workers), $waiting);
            $connection->commit();
            $outcomes = [];
            foreach ($workers as [$process, $pipes]) {
                $line = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
                $outcomes[] = json_decode($line, true, flags: JSON_THROW_ON_ERROR);
            }
            return $outcomes;
        } finally {
            if ($connection->isTransactionActive()) {
                $connection->rollBack();
            }
            foreach ($workers as [$process, $pipes]) {
                foreach ($pipes as $pipe) {
                    if (is_resource($pipe)) {
                        fclose($pipe);
                    }
                }
                if (is_resource($process)) {
                    proc_terminate($process);
                }
            }
        }
    }

    private function workerScript(): string
    {
        return <<<'PHP'
require getcwd() . '/vendor/autoload.php';
putenv('DEFAULT_URI=http://localhost');
$kernel = new App\Kernel('test', true);
$kernel->boot();
$container = $kernel->getContainer()->get('test.service_container');
$container->set('clock', new Symfony\Component\Clock\MockClock('2026-10-21T12:00:00+00:00'));
$connection = $container->get(Doctrine\DBAL\Connection::class);
$connection->executeStatement('SET application_name TO ' . $connection->quote((string) getmypid()));
fwrite(STDOUT, "READY\n");
$request = json_decode(fgets(STDIN), true, flags: JSON_THROW_ON_ERROR);
$httpRequest = Symfony\Component\HttpFoundation\Request::create($request['path'], $request['method'], [], [], [], [
    'HTTP_AUTHORIZATION' => 'Bearer ' . $request['token'], 'CONTENT_TYPE' => 'application/json',
], json_encode($request['body'], JSON_THROW_ON_ERROR));
$response = $kernel->handle($httpRequest);
fwrite(STDOUT, json_encode(['status' => $response->getStatusCode(), 'body' => $response->getContent()], JSON_THROW_ON_ERROR) . "\n");
$kernel->terminate($httpRequest, $response);
$kernel->shutdown();
PHP;
    }

    private function createTeam(): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Concurrente', 'firstParticipantName' => 'Ana', 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $team = json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        return ['id' => $team['id'], 'participantId' => $team['firstParticipant']['id'], 'token' => substr($team['accessUrl'], strpos($team['accessUrl'], '#t=') + 3)];
    }

    private function createConsultation(array $team): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $team['participantId'], 'title' => 'Pregunta', 'options' => ['Opción A', 'Opción B']], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR)['consultation'];
    }

    private function consultationPath(string $id): string
    {
        return '/api/teams/current/consultations/' . $id;
    }

    private function consultationTitle(string $id): string
    {
        return static::getContainer()->get(Connection::class)->fetchOne('SELECT title FROM consultation WHERE id = ?', [$id]);
    }

    private function consultationState(string $id): string
    {
        return static::getContainer()->get(Connection::class)->fetchOne('SELECT state FROM consultation WHERE id = ?', [$id]);
    }

    private function optionText(string $id): string
    {
        return static::getContainer()->get(Connection::class)->fetchOne('SELECT option_text FROM consultation_option WHERE id = ?', [$id]);
    }

    private function voteCount(string $consultationId): int
    {
        return (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_vote_selection selection JOIN consultation_vote vote ON vote.id = selection.vote_id WHERE vote.consultation_id = ?', [$consultationId]);
    }

    private function optionCount(string $consultationId): int
    {
        return (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE consultation_id = ?', [$consultationId]);
    }
}
