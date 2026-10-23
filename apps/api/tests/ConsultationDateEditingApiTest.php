<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Uid\Uuid;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ConsultationDateEditingApiTest extends WebTestCase
{
    private KernelBrowser $client;
    private MockClock $clock;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        $this->client->disableReboot();
        $this->clock = new MockClock('2026-10-21T12:00:00+00:00');
        static::getContainer()->set('clock', $this->clock);
    }

    public function testAnyParticipantCanEditTitleAndDatesWhilePreservingPastOptionsVotesAndLinkedEvent(): void
    {
        $team = $this->createTeam('Ana');
        $actor = $this->addParticipant($team, 'Bea');
        $consultation = $this->createDateConsultation($team, createEvent: true);
        $server = $this->auth($team);
        $this->vote($consultation, $team['participantId'], $consultation['options'][0]['id'], $server);
        $connection = static::getContainer()->get(Connection::class);
        $event = $connection->fetchAssociative('SELECT * FROM team_event WHERE id = ?', [$consultation['event']['id']]);
        $this->clock->modify('+2 days');
        $addedId = Uuid::v7()->toRfc4122();
        $this->patch($consultation['id'], [
            'participantId' => $actor['participantId'], 'title' => '  Nueva fecha  ',
            'optionChanges' => ['add' => [['id' => $addedId, 'date' => '2026-10-24']]],
        ], $server);
        self::assertResponseStatusCodeSame(200);
        $edited = $this->body()['consultation'];
        self::assertSame('  Nueva fecha  ', $edited['title']);
        self::assertSame([$consultation['options'][0]['id'], $consultation['options'][1]['id'], $addedId], array_column($edited['options'], 'id'));
        self::assertSame(['2026-10-21', '2026-10-23', '2026-10-24'], array_column($edited['options'], 'date'));
        self::assertSame([0, 1, 2], array_column($edited['options'], 'position'));
        self::assertSame(1, $edited['options'][0]['count']);
        self::assertSame(0, $edited['options'][2]['count']);
        self::assertSame($consultation['createdAt'], $edited['createdAt']);
        self::assertSame($consultation['createdBy'], $edited['createdBy']);
        self::assertSame($actor['participantId'], $edited['lastModifiedBy']['id']);
        self::assertSame('2026-10-23T12:00:00+00:00', $edited['lastModifiedAt']);
        self::assertSame($consultation['event'], $edited['event']);
        self::assertSame($event, $connection->fetchAssociative('SELECT * FROM team_event WHERE id = ?', [$consultation['event']['id']]));
    }

    public function testRemovingPastVotedDateRequiresSpecificConfirmationAndNeverTransfersVotes(): void
    {
        $team = $this->createTeam('Ana');
        $actor = $this->addParticipant($team, 'Bea');
        $consultation = $this->createDateConsultation($team);
        $server = $this->auth($team);
        $removed = $consultation['options'][0]['id'];
        $retained = $consultation['options'][1]['id'];
        $this->vote($consultation, $team['participantId'], $removed, $server);
        $this->vote($consultation, $team['participantId'], $retained, $server);
        $this->vote($consultation, $actor['participantId'], $removed, $server);
        $this->clock->modify('+2 days');
        $before = $this->getDetail($consultation['id'], $server);
        $activity = $this->activity($team['id']);
        $newId = Uuid::v7()->toRfc4122();
        $payload = ['participantId' => $actor['participantId'], 'title' => 'Cambio', 'optionChanges' => [
            'remove' => [$removed], 'add' => [['id' => $newId, 'date' => '2026-10-25']],
        ]];
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame([['id' => $removed, 'date' => '2026-10-21', 'count' => 2]], $this->body()['optionsWithVotes']);
        self::assertSame($before, $this->getDetail($consultation['id'], $server));
        self::assertSame($activity, $this->activity($team['id']));
        // A draft undo submits no remove/add: the original past option and votes survive.
        $this->patch($consultation['id'], ['participantId' => $actor['participantId']], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($before, $this->body()['consultation']);
        // Confirmation covers every current vote on the confirmed option,
        // including a vote that arrived after the confirmation prompt.
        $lateVoter = $this->addParticipant($team, 'Celia');
        $this->vote($consultation, $lateVoter['participantId'], $removed, $server);
        $payload['confirmedRemovalOptionIds'] = [$removed];
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(200);
        $edited = $this->body()['consultation'];
        self::assertSame([$retained, $newId], array_column($edited['options'], 'id'));
        self::assertSame([1, 0], array_column($edited['options'], 'count'));
        self::assertSame([0, 1], array_column($edited['options'], 'position'));
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_vote'));
        self::assertSame($team['participantId'], $edited['options'][0]['voters'][0]['id']);
        $metadata = $edited['lastModifiedAt'];
        $activity = $this->activity($team['id']);
        $this->clock->modify('+10 days');
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($metadata, $this->body()['consultation']['lastModifiedAt']);
        self::assertSame($activity, $this->activity($team['id']));
    }

    public function testTitleAndIdenticalAddRetryRemainValidAfterDatesPassWithoutRefreshingActivity(): void
    {
        $team = $this->createTeam('Ana');
        $consultation = $this->createDateConsultation($team);
        $server = $this->auth($team);
        $id = Uuid::v7()->toRfc4122();
        $payload = ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-22']]]];
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(200);
        $before = $this->body()['consultation'];
        $activity = $this->activity($team['id']);
        $this->clock->modify('+3 days');
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($before, $this->body()['consultation']);
        self::assertSame($activity, $this->activity($team['id']));
        $payload['optionChanges']['add'][0]['date'] = '2026-10-25';
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-edit-conflict', $this->body()['type']);
        $this->patch($consultation['id'], ['participantId' => $team['participantId'], 'title' => 'Solo título'], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('Solo título', $this->body()['consultation']['title']);
        self::assertSame($before['options'], $this->body()['consultation']['options']);
    }

    public function testTeamTimezoneFallbackAndExplicitDeviceTimezoneDetermineToday(): void
    {
        $team = $this->createTeam('Ana', 'Pacific/Kiritimati');
        $consultation = $this->createDateConsultation($team, ['2026-10-23']);
        $server = $this->auth($team);
        $this->clock->modify('+11 hours');
        $id = Uuid::v7()->toRfc4122();
        $payload = ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-21']]]];
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(422);
        self::assertStringContainsString('options.' . $id, json_encode($this->body(), JSON_THROW_ON_ERROR));
        $payload['timeZone'] = 'America/Los_Angeles';
        $this->patch($consultation['id'], $payload, $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(['2026-10-23', '2026-10-21'], array_column($this->body()['consultation']['options'], 'date'));
    }

    public function testInvalidDateShapesLimitsAndLifecycleDoNotWrite(): void
    {
        $team = $this->createTeam('Ana');
        $consultation = $this->createDateConsultation($team);
        $text = $this->createConsultation($team, ['Texto']);
        $server = $this->auth($team);
        $before = $this->getDetail($consultation['id'], $server);
        $activity = $this->activity($team['id']);
        $id = Uuid::v7()->toRfc4122();
        $invalid = [
            ['timeZone' => null], ['timeZone' => 'Invalid/Zone'], ['title' => ''], ['title' => str_repeat('x', 251)],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-02-30']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-2-3']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-24T00:00:00Z']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => 20261024]]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-20']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-21']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'text' => 'Otra']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-24', 'text' => 'Mixta']]]],
            ['optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-24'], ['id' => Uuid::v7()->toRfc4122(), 'text' => 'Mixta']]]],
            ['optionChanges' => ['update' => [['id' => $consultation['options'][0]['id'], 'text' => 'Cambio']]]],
            ['optionChanges' => ['update' => [['id' => $consultation['options'][0]['id'], 'date' => '2026-10-25']]]],
            ['optionChanges' => ['remove' => array_column($consultation['options'], 'id')]],
            ['optionChanges' => ['remove' => [$consultation['options'][0]['id']]], 'confirmedRemovalOptionIds' => [$consultation['options'][1]['id']]],
            ['optionChanges' => ['add' => [['id' => $text['options'][0]['id'], 'date' => '2026-10-25']]]],
        ];
        foreach ($invalid as $entry) {
            $this->patch($consultation['id'], ['participantId' => $team['participantId'], 'title' => 'No guardar', ...$entry], $server);
            self::assertResponseStatusCodeSame(422);
            self::assertSame($before, $this->getDetail($consultation['id'], $server));
            self::assertSame($activity, $this->activity($team['id']));
        }
        $this->patch($text['id'], ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $id, 'date' => '2026-10-25']]]], $server);
        self::assertResponseStatusCodeSame(422);
        $max = $this->createDateConsultation($team, array_map(static fn(int $day): string => '2026-11-' . sprintf('%02d', $day), range(1, 10)));
        $this->patch($max['id'], ['participantId' => $team['participantId'], 'optionChanges' => ['add' => [['id' => $id, 'date' => '2026-12-01']]]], $server);
        self::assertResponseStatusCodeSame(422);
        $this->resolve($consultation, $team, $server);
        $this->patch($consultation['id'], ['participantId' => $team['participantId'], 'title' => 'Cerrada'], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-closed', $this->body()['type']);
    }

    public function testAccessActorAndExpirationAreCheckedForDateEditing(): void
    {
        $owner = $this->createTeam('Ana');
        $other = $this->createTeam('Bea');
        $consultation = $this->createDateConsultation($owner);
        $foreign = $this->createDateConsultation($other);
        $payload = ['participantId' => $owner['participantId'], 'title' => 'No guardar'];
        $this->patch($consultation['id'], $payload, []);
        self::assertResponseStatusCodeSame(401);
        $this->patch($consultation['id'], $payload, ['HTTP_AUTHORIZATION' => 'Bearer altered']);
        self::assertResponseStatusCodeSame(404);
        $this->patch($foreign['id'], $payload, $this->auth($owner));
        self::assertResponseStatusCodeSame(404);
        $this->patch($consultation['id'], ['participantId' => $other['participantId'], 'title' => 'No guardar'], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);
        $connection = static::getContainer()->get(Connection::class);
        $connection->update('team', ['last_activity_at' => '2000-01-01 12:00:00+00'], ['id' => $owner['id']]);
        $this->patch($consultation['id'], $payload, $this->auth($owner));
        self::assertResponseStatusCodeSame(410);
        self::assertSame('  Fechas  ', $this->consultationRow($consultation['id'])['title']);
        self::assertNull($this->consultationRow($consultation['id'])['last_modified_at']);
    }

    public function testDateEditFailureRollsBackCompactionVotesMetadataAndActivity(): void
    {
        $team = $this->createTeam('Ana');
        $consultation = $this->createDateConsultation($team);
        $server = $this->auth($team);
        $removed = $consultation['options'][0]['id'];
        $this->vote($consultation, $team['participantId'], $removed, $server);
        $before = $this->consultationRow($consultation['id']);
        $options = $this->optionRows($consultation['id']);
        $votes = $this->voteRows($consultation['id']);
        $activity = $this->activity($team['id']);
        $connection = static::getContainer()->get(Connection::class);
        $connection->executeStatement("ALTER TABLE consultation ADD CONSTRAINT test_date_edit_failure CHECK (title <> 'Forzar rollback')");
        $this->clock->modify('+1 minute');
        try {
            $this->patch($consultation['id'], [
                'participantId' => $team['participantId'], 'title' => 'Forzar rollback',
                'optionChanges' => ['remove' => [$removed], 'add' => [['id' => Uuid::v7()->toRfc4122(), 'date' => '2026-10-25']]],
                'confirmedRemovalOptionIds' => [$removed],
            ], $server);
            self::assertResponseStatusCodeSame(500);
            self::assertSame($before, $this->consultationRow($consultation['id']));
            self::assertSame($options, $this->optionRows($consultation['id']));
            self::assertSame($votes, $this->voteRows($consultation['id']));
            self::assertSame($activity, $this->activity($team['id']));
        } finally {
            $connection->executeStatement('ALTER TABLE consultation DROP CONSTRAINT IF EXISTS test_date_edit_failure');
        }
    }

    public function testOpenApiExposesDateAdditionsTimezoneAndDateConfirmationWithoutChangingTextUpdate(): void
    {
        $this->client->request('GET', '/api/docs.jsonopenapi');
        self::assertResponseStatusCodeSame(200);
        $operation = $this->body()['paths']['/api/teams/current/consultations/{consultationId}']['patch'];
        $properties = $operation['requestBody']['content']['application/json']['schema']['properties'];
        self::assertArrayHasKey('timeZone', $properties);
        $changes = $properties['optionChanges']['properties'];
        self::assertCount(2, $changes['add']['items']['oneOf']);
        self::assertSame(['id', 'date'], $changes['add']['items']['oneOf'][1]['required']);
        self::assertSame(['id', 'text'], $changes['update']['items']['required']);
        $problem = $operation['responses']['409']['content']['application/problem+json']['schema']['oneOf'][2];
        self::assertSame(['id', 'date', 'count'], $problem['properties']['optionsWithVotes']['items']['oneOf'][1]['required']);
    }

    private function createTeam(string $name, string $timeZone = 'UTC'): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $name, 'firstParticipantName' => $name, 'timeZone' => $timeZone]);
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

    private function createDateConsultation(array $team, array $dates = ['2026-10-21', '2026-10-23'], bool $createEvent = false): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', ['type' => 'date', 'participantId' => $team['participantId'], 'title' => '  Fechas  ', 'options' => $dates, 'timeZone' => 'UTC', 'createEvent' => $createEvent], server: $this->auth($team));
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
        return static::getContainer()->get(Connection::class)->fetchAllAssociative('SELECT id, option_text, option_date, position FROM consultation_option WHERE consultation_id = ? ORDER BY position', [$consultationId]);
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
