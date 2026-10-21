<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Uid\Uuid;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ConsultationEditingApiTest extends WebTestCase
{
    private KernelBrowser $client;
    private MockClock $clock;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        $this->clock = new MockClock('2026-10-21T12:00:00+00:00');
        static::getContainer()->set('clock', $this->clock);
    }

    public function testAnyTeamParticipantCanEditTitleAndOptionsWithoutReplacingTheirIdentityOrVotes(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Ana');
        $actor = $this->addParticipant($team, 'Bea');
        $consultation = $this->createConsultation($team, ['Té', 'Café', 'Agua']);
        $server = $this->auth($team);
        $this->vote($consultation, $team['participantId'], $consultation['options'][0]['id'], $server);
        $before = $this->body()['consultation'];
        $createdAt = $before['createdAt'];
        $createdBy = $before['createdBy']['id'];
        $this->clock->modify('+1 minute');
        $addedId = Uuid::v7()->toRfc4122();

        $this->patch($consultation['id'], [
            'participantId' => $actor['participantId'],
            'title' => '¿Qué tomamos?',
            'optionChanges' => [
                'add' => [['id' => $addedId, 'text' => 'Zumo']],
                'update' => [['id' => $consultation['options'][1]['id'], 'text' => 'Café solo']],
                'remove' => [$consultation['options'][2]['id']],
            ],
        ], $server);

        self::assertResponseStatusCodeSame(200);
        $edited = $this->body()['consultation'];
        self::assertSame('¿Qué tomamos?', $edited['title']);
        self::assertSame([$consultation['options'][0]['id'], $consultation['options'][1]['id'], $addedId], array_column($edited['options'], 'id'));
        self::assertSame(['Té', 'Café solo', 'Zumo'], array_column($edited['options'], 'text'));
        self::assertSame([0, 1, 2], array_column($edited['options'], 'position'));
        self::assertSame(1, $edited['options'][0]['count']);
        self::assertSame($team['participantId'], $edited['options'][0]['voters'][0]['id']);
        self::assertSame($createdAt, $edited['createdAt']);
        self::assertSame($createdBy, $edited['createdBy']['id']);
        self::assertSame($actor['participantId'], $edited['lastModifiedBy']['id']);
        self::assertSame('2026-10-21T12:01:00+00:00', $edited['lastModifiedAt']);
    }

    public function testRemovingVotedOptionsRequiresConfirmationAndPreservesUnrelatedSelections(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Celia');
        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Dani'], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        $secondParticipant = $this->body()['participant']['id'];
        $consultation = $this->createConsultation($team, ['Primera', 'Retirada', 'Tercera']);
        $server = $this->auth($team);
        $retainedId = $consultation['options'][0]['id'];
        $removedId = $consultation['options'][1]['id'];
        $this->vote($consultation, $team['participantId'], $retainedId, $server);
        $this->vote($consultation, $team['participantId'], $removedId, $server);
        $this->vote($consultation, $secondParticipant, $removedId, $server);
        $activity = $this->activity($team['id']);
        $beforeConfirmation = $this->getDetail($consultation['id'], $server);

        $changes = ['participantId' => $team['participantId'], 'title' => 'Título nuevo', 'optionChanges' => ['remove' => [$removedId]]];
        $this->patch($consultation['id'], $changes, $server);
        self::assertResponseStatusCodeSame(409);
        $problem = $this->body();
        self::assertSame('urn:synqo:problem:consultation-removal-confirmation-required', $problem['type']);
        self::assertSame([['id' => $removedId, 'text' => 'Retirada', 'count' => 2]], $problem['optionsWithVotes']);
        self::assertSame($beforeConfirmation, $this->getDetail($consultation['id'], $server));
        self::assertSame($activity, $this->activity($team['id']));

        $changes['confirmedRemovalOptionIds'] = [$removedId];
        $this->patch($consultation['id'], $changes, $server);
        self::assertResponseStatusCodeSame(200);
        $edited = $this->body()['consultation'];
        self::assertSame('Título nuevo', $edited['title']);
        self::assertSame([$retainedId, $consultation['options'][2]['id']], array_column($edited['options'], 'id'));
        self::assertTrue(array_is_list($edited['options']));
        self::assertSame(1, $edited['options'][0]['count']);
        self::assertSame(0, $edited['options'][1]['count']);
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_vote_selection'));
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_vote'));
        self::assertSame($team['participantId'], $edited['options'][0]['voters'][0]['id']);

        $metadata = [$edited['lastModifiedAt'], $edited['lastModifiedBy']['id']];
        $this->clock->modify('+1 minute');
        $this->patch($consultation['id'], $changes, $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($metadata[0], $this->body()['consultation']['lastModifiedAt']);
        self::assertSame($metadata[1], $this->body()['consultation']['lastModifiedBy']['id']);
    }

    public function testRenamingAnOptionWithVotesConflictsWithoutSavingOtherFields(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Elena');
        $consultation = $this->createConsultation($team, ['Tiene votos', 'Sin votos']);
        $server = $this->auth($team);
        $option = $consultation['options'][0];
        $this->vote($consultation, $team['participantId'], $option['id'], $server);
        $before = $this->body()['consultation'];
        $activity = $this->activity($team['id']);

        $this->patch($consultation['id'], [
            'participantId' => $team['participantId'], 'title' => 'No debe guardarse',
            'optionChanges' => ['update' => [['id' => $option['id'], 'text' => 'Texto distinto']]],
        ], $server);

        self::assertResponseStatusCodeSame(409);
        $problem = $this->body();
        self::assertSame('urn:synqo:problem:consultation-edit-conflict', $problem['type']);
        self::assertArrayHasKey('consultation', $problem);
        self::assertSame($before['title'], $problem['consultation']['title']);
        self::assertSame($before['options'][0]['text'], $problem['consultation']['options'][0]['text']);
        self::assertSame($activity, $this->activity($team['id']));
    }

    public function testNoopAndIdenticalAddRetryDoNotRefreshEditMetadataOrActivity(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Fina');
        $consultation = $this->createConsultation($team, ['Base']);
        $later = $this->createConsultation($team, ['Otra']);
        $server = $this->auth($team);
        $newOptionId = Uuid::v7()->toRfc4122();
        $add = ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $newOptionId, 'text' => 'Nueva']]]];
        $this->clock->modify('+30 seconds');
        $this->patch($consultation['id'], $add, $server);
        self::assertResponseStatusCodeSame(200);
        $firstSave = $this->body()['consultation'];
        self::assertSame(2, count($firstSave['options']));
        $activity = $this->activity($team['id']);
        $lastModifiedAt = $firstSave['lastModifiedAt'];
        $lastModifiedBy = $firstSave['lastModifiedBy']['id'];

        $this->clock->modify('+30 seconds');
        $this->patch($consultation['id'], $add, $server);
        self::assertResponseStatusCodeSame(200);
        self::assertCount(2, $this->body()['consultation']['options']);
        self::assertSame($activity, $this->activity($team['id']));
        self::assertSame($lastModifiedAt, $this->body()['consultation']['lastModifiedAt']);
        self::assertSame($lastModifiedBy, $this->body()['consultation']['lastModifiedBy']['id']);

        $this->patch($consultation['id'], [
            'participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $newOptionId, 'text' => 'Distinta']]],
        ], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-edit-conflict', $this->body()['type']);
        self::assertSame($activity, $this->activity($team['id']));

        $this->client->request('GET', '/api/teams/current/consultations', server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame([$later['id'], $consultation['id']], array_column($this->body()['open'], 'id'));

        $this->clock->modify('+30 seconds');
        $this->patch($consultation['id'], ['participantId' => $team['participantId']], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($activity, $this->activity($team['id']));
        self::assertSame($lastModifiedAt, $this->body()['consultation']['lastModifiedAt']);
    }

    public function testPaddedValuesMatchingCreationAreNoopEdits(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Lola');
        $consultation = $this->createConsultation($team, ['  Cena  '], '  ¿Qué cenamos?  ');
        $server = $this->auth($team);
        $before = $this->getDetail($consultation['id'], $server);
        $activity = $this->activity($team['id']);

        $this->patch($consultation['id'], [
            'participantId' => $team['participantId'],
            'title' => '  ¿Qué cenamos?  ',
            'optionChanges' => ['update' => [['id' => $consultation['options'][0]['id'], 'text' => '  Cena  ']]],
        ], $server);

        self::assertResponseStatusCodeSame(200);
        self::assertSame($before, $this->body()['consultation']);
        self::assertSame($activity, $this->activity($team['id']));
    }

    public function testInvalidLimitsDuplicatesAndTypeOrLifecycleDoNotWrite(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Gala');
        $consultation = $this->createConsultation($team, ['Uno', 'Dos']);
        $dateConsultation = $this->createDateConsultation($team);
        $server = $this->auth($team);
        $activity = $this->activity($team['id']);
        $invalidRequests = [
            ['title' => str_repeat('x', 251)],
            ['optionChanges' => ['add' => [['id' => Uuid::v7()->toRfc4122(), 'text' => '']]]],
            ['optionChanges' => ['update' => [['id' => $consultation['options'][0]['id'], 'text' => str_repeat('x', 51)]]]],
            ['optionChanges' => ['update' => [['id' => $consultation['options'][0]['id'], 'text' => 'Dos']]]],
            ['optionChanges' => ['add' => [['id' => Uuid::v7()->toRfc4122(), 'text' => 'uno']]]],
            ['optionChanges' => ['remove' => array_column($consultation['options'], 'id')]],
            ['optionChanges' => ['remove' => []], 'confirmedRemovalOptionIds' => [$consultation['options'][0]['id']]],
        ];
        foreach ($invalidRequests as $fields) {
            $this->patch($consultation['id'], ['participantId' => $team['participantId'], ...$fields], $server);
            self::assertResponseStatusCodeSame(422);
        }
        $this->patch($consultation['id'], [
            'participantId' => $team['participantId'],
            'optionChanges' => ['add' => [['id' => $dateConsultation['options'][0]['id'], 'text' => 'ID ajeno']]],
        ], $server);
        self::assertResponseStatusCodeSame(422);

        $max = $this->createConsultation($team, array_map(static fn(int $index): string => 'Opción ' . $index, range(1, 10)));
        $this->patch($max['id'], [
            'participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => Uuid::v7()->toRfc4122(), 'text' => 'Undécima']]],
        ], $server);
        self::assertResponseStatusCodeSame(422);
        $this->patch($dateConsultation['id'], ['participantId' => $team['participantId'], 'title' => 'Fecha'], $server);
        self::assertResponseStatusCodeSame(422);
        $this->resolve($consultation, $team, $server);
        $this->patch($consultation['id'], ['participantId' => $team['participantId'], 'title' => 'Cerrada'], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-closed', $this->body()['type']);

        self::assertSame('Pregunta', $this->consultationRow($consultation['id'])['title']);
        self::assertSame(2, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE consultation_id = ?', [$consultation['id']]));
        self::assertSame($activity, $this->activity($team['id']));
    }

    public function testAccessAndForeignActorOrConsultationDoNotWrite(): void
    {
        $this->client->disableReboot();
        $owner = $this->createTeam('Hana');
        $other = $this->createTeam('Inés');
        $consultation = $this->createConsultation($owner, ['Una', 'Dos']);
        $foreignConsultation = $this->createConsultation($other, ['Ajena']);
        $path = '/api/teams/current/consultations/' . $consultation['id'];
        $activity = $this->activity($owner['id']);

        $this->client->jsonRequest('PATCH', $path, ['participantId' => $owner['participantId'], 'title' => 'Sin auth']);
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');
        $this->client->jsonRequest('PATCH', $path, ['participantId' => $owner['participantId'], 'title' => 'Token incorrecto'], server: ['HTTP_AUTHORIZATION' => 'Bearer altered']);
        self::assertResponseStatusCodeSame(404);
        $this->patch($consultation['id'], ['participantId' => $other['participantId'], 'title' => 'Actor ajeno'], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);
        $this->patch($foreignConsultation['id'], ['participantId' => $owner['participantId'], 'title' => 'Consulta ajena'], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);

        $connection = static::getContainer()->get(Connection::class);
        $connection->update('team', ['last_activity_at' => '2000-01-01 12:00:00+00'], ['id' => $owner['id']]);
        $this->patch($consultation['id'], ['participantId' => $owner['participantId'], 'title' => 'Caducada'], $this->auth($owner));
        self::assertResponseStatusCodeSame(410);
        self::assertSame('Pregunta', $this->consultationRow($consultation['id'])['title']);
        self::assertNull($this->consultationRow($consultation['id'])['last_modified_at']);
        self::assertSame('2000-01-01 12:00:00+00', $this->activity($owner['id']));
        self::assertNotSame($activity, $this->activity($owner['id']));
    }

    public function testForcedPersistenceFailureRollsBackTitleOptionsVotesMetadataAndActivity(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Julia');
        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => 'Kira'], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        $participant = $this->body()['participant']['id'];
        $consultation = $this->createConsultation($team, ['Conservar', 'Retirar']);
        $server = $this->auth($team);
        $this->vote($consultation, $team['participantId'], $consultation['options'][1]['id'], $server);
        $before = $this->consultationRow($consultation['id']);
        $beforeOptions = $this->optionRows($consultation['id']);
        $beforeVotes = $this->voteRows($consultation['id']);
        $activity = $this->activity($team['id']);
        $newId = Uuid::v7()->toRfc4122();
        $this->clock->modify('+1 minute');
        $connection = static::getContainer()->get(Connection::class);
        $connection->executeStatement("ALTER TABLE consultation ADD CONSTRAINT test_consultation_edit_failure CHECK (title <> 'Forzar rollback')");

        try {
            $this->patch($consultation['id'], [
                'participantId' => $participant, 'title' => 'Forzar rollback',
                'optionChanges' => ['add' => [['id' => $newId, 'text' => 'Alta']], 'remove' => [$consultation['options'][1]['id']]],
                'confirmedRemovalOptionIds' => [$consultation['options'][1]['id']],
            ], $server);
            self::assertResponseStatusCodeSame(500);
            self::assertSame($before, $this->consultationRow($consultation['id']));
            self::assertSame($beforeOptions, $this->optionRows($consultation['id']));
            self::assertSame($beforeVotes, $this->voteRows($consultation['id']));
            self::assertSame($activity, $this->activity($team['id']));
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE id = ?', [$newId]));
        } finally {
            $connection->executeStatement('ALTER TABLE consultation DROP CONSTRAINT IF EXISTS test_consultation_edit_failure');
        }
    }

    public function testOpenApiDocumentsPatchContractAndEditProblemTypes(): void
    {
        $this->client->request('GET', '/api/docs.jsonopenapi');
        self::assertResponseStatusCodeSame(200);
        $spec = $this->body();
        $operation = $spec['paths']['/api/teams/current/consultations/{consultationId}']['patch'];
        $schema = $operation['requestBody']['content']['application/json']['schema'];
        self::assertContains('participantId', $schema['required']);
        self::assertSame('object', $schema['properties']['optionChanges']['type']);
        self::assertFalse($schema['additionalProperties']);
        self::assertStringContainsString('urn:synqo:problem:consultation-removal-confirmation-required', json_encode($operation['responses']['409'], JSON_THROW_ON_ERROR));
        self::assertArrayHasKey('200', $operation['responses']);
        self::assertArrayHasKey('409', $operation['responses']);
    }

    private function createTeam(string $name): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $name, 'firstParticipantName' => $name, 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $team = $this->body();
        return ['id' => $team['id'], 'participantId' => $team['firstParticipant']['id'], 'token' => substr($team['accessUrl'], strpos($team['accessUrl'], '#t=') + 3)];
    }

    private function addParticipant(array $team, string $name): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/participants', ['name' => $name], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return ['participantId' => $this->body()['participant']['id']];
    }

    private function createConsultation(array $team, array $options, string $title = 'Pregunta'): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['participantId' => $team['participantId'], 'title' => $title, 'options' => $options], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['consultation'];
    }

    private function createDateConsultation(array $team): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Fecha', 'options' => ['2026-10-22'], 'timeZone' => 'UTC'], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['consultation'];
    }

    private function patch(string $consultationId, array $payload, array $server): void
    {
        $this->client->jsonRequest('PATCH', '/api/teams/current/consultations/' . $consultationId, $payload, server: $server);
    }

    private function vote(array $consultation, string $participantId, string $optionId, array $server): void
    {
        $path = '/api/teams/current/consultations/' . $consultation['id'] . '/votes/' . $participantId . '/options/' . $optionId;
        $this->client->jsonRequest('PUT', $path, ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(200);
    }

    private function resolve(array $consultation, array $team, array $server): void
    {
        $this->client->jsonRequest('PUT', '/api/teams/current/consultations/' . $consultation['id'] . '/resolution', [
            'participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => [],
        ], server: $server);
        self::assertResponseStatusCodeSame(200);
    }

    private function getDetail(string $consultationId, array $server): array
    {
        $this->client->request('GET', '/api/teams/current/consultations/' . $consultationId, server: $server);
        self::assertResponseStatusCodeSame(200);
        return $this->body();
    }

    private function consultationRow(string $id): array
    {
        return static::getContainer()->get(Connection::class)->fetchAssociative('SELECT title, state, created_at, created_by_participant_id, last_modified_at, last_modified_by_participant_id FROM consultation WHERE id = ?', [$id]);
    }

    private function optionRows(string $consultationId): array
    {
        return static::getContainer()->get(Connection::class)->fetchAllAssociative('SELECT id, option_text, position FROM consultation_option WHERE consultation_id = ? ORDER BY position', [$consultationId]);
    }

    private function voteRows(string $consultationId): array
    {
        return static::getContainer()->get(Connection::class)->fetchAllAssociative('SELECT vote.participant_id, selection.option_id FROM consultation_vote vote JOIN consultation_vote_selection selection ON selection.vote_id = vote.id WHERE vote.consultation_id = ? ORDER BY vote.participant_id, selection.option_id', [$consultationId]);
    }

    private function activity(string $teamId): string
    {
        return static::getContainer()->get(Connection::class)->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$teamId]);
    }

    private function auth(array $team): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
    }

    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}
