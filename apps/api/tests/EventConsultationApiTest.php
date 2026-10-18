<?php

declare(strict_types=1);

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class EventConsultationApiTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        static::getContainer()->set('clock', new MockClock('2026-10-18T12:00:00+00:00'));
    }

    public function testLinkCanBeChangedAndRemovedWithoutChangingEventVersionOrModification(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Aina');
        $firstEvent = $this->createEvent($team, 'Primero');
        $secondEvent = $this->createEvent($team, 'Segundo');
        $consultation = $this->createDateConsultation($team, ['2026-10-20', '2026-10-21']);
        $server = $this->auth($team);

        $this->setEvent($consultation['id'], $firstEvent['id'], $server);
        self::assertSame($firstEvent['id'], $this->body()['consultation']['event']['id']);
        $connection = static::getContainer()->get(Connection::class);
        $activityAfterLink = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        static::getContainer()->get('clock')->modify('+1 second');
        $this->setEvent($consultation['id'], $firstEvent['id'], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($activityAfterLink, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->setEvent($consultation['id'], $secondEvent['id'], $server);
        self::assertSame($secondEvent['id'], $this->body()['consultation']['event']['id']);
        $this->setEvent($consultation['id'], null, $server);
        self::assertArrayNotHasKey('event', $this->body()['consultation']);
        self::assertSame(1, $this->eventRow($firstEvent['id'])['version']);
        self::assertSame(1, $this->eventRow($secondEvent['id'])['version']);
        self::assertNull($this->eventRow($firstEvent['id'])['last_modified_at']);
        self::assertNull($this->eventRow($secondEvent['id'])['last_modified_at']);
    }

    public function testEventEligibilityIsTeamScopedOpenAndReusableAfterConsultationCloses(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Kira');
        $otherTeam = $this->createTeam('Lara');
        $event = $this->createEvent($team, 'Elegible');
        $definitive = $this->createEvent($team, 'Definitivo', ['date' => '2026-10-24', 'status' => 'definitive']);
        $first = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $second = $this->createDateConsultation($team, ['2026-10-21']);
        $server = $this->auth($team);

        $this->setEvent($second['id'], $event['id'], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:event-conflict', $this->body()['type']);
        $this->setEvent($second['id'], $definitive['id'], $server);
        self::assertResponseStatusCodeSame(409);
        $foreignEvent = $this->createEvent($otherTeam, 'Ajeno');
        $this->setEvent($second['id'], $foreignEvent['id'], $server);
        self::assertResponseStatusCodeSame(404);

        $this->resolve($first['id'], ['participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => []], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($event['id'], $this->body()['consultation']['event']['id']);
        $this->setEvent($second['id'], $event['id'], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($event['id'], $this->body()['consultation']['event']['id']);

        $this->client->request('GET', '/api/teams/current/consultations/' . $first['id'], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($event['id'], $this->body()['event']['id']);
    }

    public function testLinkedDateConsultationAcceptsOneOptionAndFinalizesProvisionalEvent(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Berta');
        $event = $this->createEvent($team, 'Excursión');
        $consultation = $this->createDateConsultation($team, ['2026-10-20', '2026-10-21'], $event['id']);
        $server = $this->auth($team);
        $optionId = $consultation['options'][1]['id'];

        $this->resolve($consultation['id'], ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$consultation['options'][0]['id'], $optionId]], $server);
        self::assertResponseStatusCodeSame(422);
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);

        $this->resolve($consultation['id'], ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$optionId]], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($event['id'], $this->body()['consultation']['event']['id']);
        self::assertSame('resolved', $this->body()['consultation']['state']);
        $storedEvent = $this->eventRow($event['id']);
        self::assertSame('definitive', $storedEvent['status']);
        self::assertSame('2026-10-21', $storedEvent['event_date']);
        self::assertSame($team['participantId'], $storedEvent['last_modified_by_participant_id']);
        self::assertSame(2, (int) $storedEvent['version']);
    }

    public function testResolutionCanReplaceOrRemoveItsEventLinkAndUnlinkedConsultationCanAcceptManyDates(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Mara');
        $original = $this->createEvent($team, 'Original');
        $replacement = $this->createEvent($team, 'Nuevo');
        $replaceConsultation = $this->createDateConsultation($team, ['2026-10-20'], $original['id']);
        $server = $this->auth($team);

        $this->resolve($replaceConsultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$replaceConsultation['options'][0]['id']], 'eventId' => $replacement['id'],
        ], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame($replacement['id'], $this->body()['consultation']['event']['id']);
        self::assertSame('provisional', $this->eventRow($original['id'])['status']);
        self::assertSame('definitive', $this->eventRow($replacement['id'])['status']);

        $removed = $this->createEvent($team, 'Se retira');
        $removeConsultation = $this->createDateConsultation($team, ['2026-10-21', '2026-10-22'], $removed['id']);
        $this->resolve($removeConsultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => array_column($removeConsultation['options'], 'id'), 'eventId' => null,
        ], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertArrayNotHasKey('event', $this->body()['consultation']);
        self::assertSame('provisional', $this->eventRow($removed['id'])['status']);
    }

    public function testEventLinksAreRejectedForTextConsultationsAndIneligibleNewEvents(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Nora');
        $server = $this->auth($team);
        $event = $this->createEvent($team, 'Disponible');
        $text = $this->createTextConsultation($team);
        $this->setEvent($text['id'], $event['id'], $server);
        self::assertResponseStatusCodeSame(422);
        $this->resolve($text['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$text['options'][0]['id']], 'eventId' => $event['id'],
        ], $server);
        self::assertResponseStatusCodeSame(422);
        self::assertSame('open', $this->consultationRow($text['id'])['state']);

        $rejected = $this->createEvent($team, 'Rechazado');
        $this->rejectEvent($rejected['id'], ['participantId' => $team['participantId']], $server);
        self::assertResponseStatusCodeSame(200);
        $definitive = $this->createEvent($team, 'Definitivo', ['date' => '2026-10-23', 'status' => 'definitive']);
        $target = $this->createDateConsultation($team, ['2026-10-24']);

        foreach ([$rejected['id'], $definitive['id']] as $eventId) {
            $this->setEvent($target['id'], $eventId, $server);
            self::assertResponseStatusCodeSame(409);
            self::assertSame('urn:synqo:problem:event-conflict', $this->body()['type']);
        }
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Evento excluido',
            'options' => ['2026-10-25'], 'timeZone' => 'UTC', 'eventId' => $rejected['id'],
        ], server: $server);
        self::assertResponseStatusCodeSame(409);
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Evento definitivo',
            'options' => ['2026-10-25'], 'timeZone' => 'UTC', 'eventId' => $definitive['id'],
        ], server: $server);
        self::assertResponseStatusCodeSame(409);
    }

    public function testClosedConsultationCannotChangeItsEventLink(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Ona');
        $event = $this->createEvent($team, 'Cerrada');
        $consultation = $this->createDateConsultation($team, ['2026-10-20']);
        $server = $this->auth($team);
        $this->resolve($consultation['id'], ['participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => []], $server);
        self::assertResponseStatusCodeSame(200);

        $this->setEvent($consultation['id'], $event['id'], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:consultation-closed', $this->body()['type']);
        self::assertNull($this->consultationRow($consultation['id'])['event_id']);
    }

    public function testEventLinkEndpointEnforcesBearerTeamAndActorAccessWithoutWrites(): void
    {
        $this->client->disableReboot();
        $owner = $this->createTeam('Paula');
        $foreign = $this->createTeam('Quima');
        $event = $this->createEvent($owner, 'Privado');
        $consultation = $this->createDateConsultation($owner, ['2026-10-20']);
        $foreignConsultation = $this->createDateConsultation($foreign, ['2026-10-20']);
        $connection = static::getContainer()->get(Connection::class);
        $activity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$owner['id']]);
        $path = '/api/teams/current/consultations/' . $consultation['id'] . '/event';

        $this->client->jsonRequest('PUT', $path, ['eventId' => $event['id']]);
        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('WWW-Authenticate', 'Bearer');
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        $this->client->jsonRequest('PUT', $path, ['eventId' => $event['id']], server: ['HTTP_AUTHORIZATION' => 'Bearer altered']);
        self::assertResponseStatusCodeSame(404);
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        $this->setEvent($consultation['id'], $this->createEvent($foreign, 'Ajeno')['id'], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);
        $this->setEvent($foreignConsultation['id'], $event['id'], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);
        $this->resolve($consultation['id'], ['participantId' => $foreign['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => []], $this->auth($owner));
        self::assertResponseStatusCodeSame(404);

        $connection->update('team', ['last_activity_at' => '2000-01-01 12:00:00+00'], ['id' => $owner['id']]);
        $this->setEvent($consultation['id'], $event['id'], $this->auth($owner));
        self::assertResponseStatusCodeSame(410);
        self::assertStringContainsString('no-store', $this->client->getResponse()->headers->get('Cache-Control'));
        self::assertNull($this->consultationRow($consultation['id'])['event_id']);
        self::assertSame('2000-01-01 12:00:00+00', $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$owner['id']]));
        self::assertNotSame('2000-01-01 12:00:00+00', $activity);
    }

    public function testEventVersionAdvancesForTwoUpdatesAtTheSameInstant(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Rita');
        $event = $this->createEvent($team, 'Antes');
        $server = $this->auth($team);
        foreach ([['title' => 'Después'], ['title' => 'Después', 'notes' => 'Cambio dentro del mismo instante']] as $fields) {
            $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
                'participantId' => $team['participantId'], 'title' => $fields['title'], 'notes' => $fields['notes'] ?? null, 'status' => 'provisional',
            ], server: $server);
            self::assertResponseStatusCodeSame(200);
        }
        self::assertSame(3, (int) $this->eventRow($event['id'])['version']);
    }

    public function testOpenApiDeclaresNullableLinkAndResolutionVersionContract(): void
    {
        $this->client->request('GET', '/api/docs.jsonopenapi');
        self::assertResponseStatusCodeSame(200);
        $spec = $this->body();
        $paths = $spec['paths'];
        $create = $paths['/api/teams/current/consultations']['post']['requestBody']['content']['application/json']['schema']['properties']['eventId'];
        $set = $paths['/api/teams/current/consultations/{consultationId}/event']['put']['requestBody']['content']['application/json']['schema']['properties']['eventId'];
        $resolve = $paths['/api/teams/current/consultations/{consultationId}/resolution']['put']['requestBody']['content']['application/json']['schema']['properties'];
        self::assertTrue($create['nullable']);
        self::assertTrue($set['nullable']);
        self::assertTrue($resolve['eventId']['nullable']);
        self::assertSame('integer', $resolve['expectedEventVersion']['type']);
        self::assertGreaterThanOrEqual(1, $resolve['expectedEventVersion']['minimum'] ?? 0);
        self::assertNotEmpty($resolve['expectedEventVersion']['description'] ?? null);
        self::assertArrayHasKey('event', $paths['/api/teams/current/consultations/{consultationId}']['get']['responses']['200']['content']['application/json']['schema']['properties']);
    }

    public function testDefinitiveEventVersionConflictLeavesConsultationEventAndActivityUntouched(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Celia');
        $event = $this->createEvent($team, 'Cena');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
            'participantId' => $team['participantId'], 'title' => 'Cena', 'date' => '2026-10-22', 'status' => 'definitive',
        ], server: $this->auth($team));
        self::assertResponseStatusCodeSame(200);
        $connection = static::getContainer()->get(Connection::class);
        $beforeActivity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $beforeEvent = $this->eventRow($event['id']);

        $this->resolve($consultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$consultation['options'][0]['id']],
        ], $this->auth($team));
        self::assertResponseStatusCodeSame(409);
        self::assertSame($beforeEvent, $this->eventRow($event['id']));
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);

        $this->resolve($consultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$consultation['options'][0]['id']], 'expectedEventVersion' => 99,
        ], $this->auth($team));

        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:event-conflict', $this->body()['type']);
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);
        self::assertSame($beforeEvent, $this->eventRow($event['id']));
        self::assertSame($beforeActivity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));

        $this->resolve($consultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$consultation['options'][0]['id']], 'expectedEventVersion' => (int) $beforeEvent['version'],
        ], $this->auth($team));
        self::assertResponseStatusCodeSame(200);
        self::assertSame('2026-10-22', $this->eventRow($event['id'])['event_date']);
        self::assertSame((int) $beforeEvent['version'], (int) $this->eventRow($event['id'])['version']);
    }

    public function testStaleDefinitiveVersionConflictsEvenIfEventWasDowngradedAfterTheNotice(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Sara');
        $event = $this->createEvent($team, 'Aviso');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $server = $this->auth($team);
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
            'participantId' => $team['participantId'], 'title' => 'Aviso', 'date' => '2026-10-22', 'status' => 'definitive',
        ], server: $server);
        self::assertResponseStatusCodeSame(200);
        $noticedVersion = (int) $this->eventRow($event['id'])['version'];
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'], [
            'participantId' => $team['participantId'], 'title' => 'Aviso', 'date' => null, 'status' => 'provisional',
        ], server: $server);
        self::assertResponseStatusCodeSame(200);
        $beforeEvent = $this->eventRow($event['id']);
        $connection = static::getContainer()->get(Connection::class);
        $beforeActivity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $this->resolve($consultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$consultation['options'][0]['id']], 'expectedEventVersion' => $noticedVersion,
        ], $server);

        self::assertResponseStatusCodeSame(409);
        self::assertSame($beforeEvent, $this->eventRow($event['id']));
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);
        self::assertSame($beforeActivity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    public function testFailedEventFinalizationRollsBackResolutionAndTeamActivity(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Tina');
        $event = $this->createEvent($team, 'No finalizar');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $connection = static::getContainer()->get(Connection::class);
        $beforeEvent = $this->eventRow($event['id']);
        $beforeConsultation = $this->consultationRow($consultation['id']);
        $beforeActivity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("ALTER TABLE team_event ADD CONSTRAINT test_event_finalize_failure CHECK (status <> 'definitive')");

        try {
            $this->resolve($consultation['id'], [
                'participantId' => $team['participantId'], 'status' => 'resolved',
                'acceptedOptionIds' => [$consultation['options'][0]['id']],
            ], $this->auth($team));
            self::assertResponseStatusCodeSame(500);
            self::assertSame($beforeEvent, $this->eventRow($event['id']));
            self::assertSame($beforeConsultation, $this->consultationRow($consultation['id']));
            self::assertSame(0, (int) $connection->fetchOne('SELECT COUNT(*) FROM consultation_resolution_option WHERE consultation_id = ?', [$consultation['id']]));
            self::assertSame($beforeActivity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        } finally {
            $connection->executeStatement('ALTER TABLE team_event DROP CONSTRAINT IF EXISTS test_event_finalize_failure');
        }
    }

    public function testRejectedPreviouslyLinkedEventRequiresExplicitUnlinkOrRejectBoth(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Dalia');
        $server = $this->auth($team);

        $acceptedEvent = $this->createEvent($team, 'Evento rechazado uno');
        $acceptedConsultation = $this->createDateConsultation($team, ['2026-10-20', '2026-10-21'], $acceptedEvent['id']);
        $this->markEventRejected($acceptedEvent['id']);
        $this->resolve($acceptedConsultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$acceptedConsultation['options'][0]['id']],
        ], $server);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('open', $this->consultationRow($acceptedConsultation['id'])['state']);

        $this->resolve($acceptedConsultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'resolved',
            'acceptedOptionIds' => [$acceptedConsultation['options'][0]['id']], 'eventId' => null,
        ], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertArrayNotHasKey('event', $this->body()['consultation']);

        $rejectedEvent = $this->createEvent($team, 'Evento rechazado dos');
        $rejectedConsultation = $this->createDateConsultation($team, ['2026-10-20'], $rejectedEvent['id']);
        $this->markEventRejected($rejectedEvent['id']);
        $this->resolve($rejectedConsultation['id'], [
            'participantId' => $team['participantId'], 'status' => 'rejected', 'acceptedOptionIds' => [],
        ], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('rejected', $this->body()['consultation']['state']);
        self::assertSame($rejectedEvent['id'], $this->body()['consultation']['event']['id']);
    }

    public function testRejectingLinkedEventRequiresDispositionAndAppliesItAtomically(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Elia');
        $server = $this->auth($team);

        $event = $this->createEvent($team, 'Desvincular');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $this->rejectEvent($event['id'], ['participantId' => $team['participantId']], $server);
        self::assertResponseStatusCodeSame(422);
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);
        self::assertSame('provisional', $this->eventRow($event['id'])['status']);

        $this->rejectEvent($event['id'], ['participantId' => $team['participantId'], 'disposition' => 'unlink'], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('open', $this->consultationRow($consultation['id'])['state']);
        self::assertNull($this->consultationRow($consultation['id'])['open_event_id']);
        self::assertSame('rejected', $this->eventRow($event['id'])['status']);

        $secondEvent = $this->createEvent($team, 'Rechazar ambos');
        $secondConsultation = $this->createDateConsultation($team, ['2026-10-21'], $secondEvent['id']);
        $this->rejectEvent($secondEvent['id'], ['participantId' => $team['participantId'], 'disposition' => 'reject_both'], $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame('rejected', $this->consultationRow($secondConsultation['id'])['state']);
        self::assertSame($secondEvent['id'], $this->consultationRow($secondConsultation['id'])['event_id']);
        self::assertNull($this->consultationRow($secondConsultation['id'])['open_event_id']);
    }

    public function testRejectEventFailureRollsBackConsultationEventAndActivity(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Fina');
        $event = $this->createEvent($team, 'Rollback');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $event['id']);
        $connection = static::getContainer()->get(Connection::class);
        $beforeActivity = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);
        $connection->executeStatement("ALTER TABLE team_event ADD CONSTRAINT test_event_reject_failure CHECK (status <> 'rejected' OR title <> 'Rollback')");

        try {
            $this->rejectEvent($event['id'], ['participantId' => $team['participantId'], 'disposition' => 'reject_both'], $this->auth($team));
            self::assertResponseStatusCodeSame(500);
            self::assertSame('open', $this->consultationRow($consultation['id'])['state']);
            self::assertSame($event['id'], $this->consultationRow($consultation['id'])['open_event_id']);
            self::assertSame('provisional', $this->eventRow($event['id'])['status']);
            self::assertSame($beforeActivity, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
        } finally {
            $connection->executeStatement('ALTER TABLE team_event DROP CONSTRAINT IF EXISTS test_event_reject_failure');
        }
    }

    public function testConcurrentConsultationsCannotClaimTheSameEvent(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Greta');
        $event = $this->createEvent($team, 'Compartido');
        $first = $this->createDateConsultation($team, ['2026-10-20']);
        $second = $this->createDateConsultation($team, ['2026-10-21']);
        $workers = $this->runConcurrent($team, [
            ['mode' => 'set_event', 'consultationId' => $first['id'], 'eventId' => $event['id']],
            ['mode' => 'set_event', 'consultationId' => $second['id'], 'eventId' => $event['id']],
        ]);

        self::assertEqualsCanonicalizing(['CONFLICT', 'SAVED'], $workers);
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation WHERE open_event_id = ?', [$event['id']]));
    }

    public function testConcurrentLinkChangeAndResolutionLeaveAClosedConsultationWithOneConsistentEvent(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Hana');
        $original = $this->createEvent($team, 'Original');
        $replacement = $this->createEvent($team, 'Sustituto');
        $consultation = $this->createDateConsultation($team, ['2026-10-20'], $original['id']);
        $workers = $this->runConcurrent($team, [
            ['mode' => 'set_event', 'consultationId' => $consultation['id'], 'eventId' => $replacement['id']],
            ['mode' => 'resolve', 'consultationId' => $consultation['id'], 'participantId' => $team['participantId'], 'status' => 'resolved', 'optionIds' => [$consultation['options'][0]['id']]],
        ]);

        self::assertContains('SAVED', $workers);
        self::assertSame('resolved', $this->consultationRow($consultation['id'])['state']);
        self::assertNull($this->consultationRow($consultation['id'])['open_event_id']);
        self::assertContains($this->consultationRow($consultation['id'])['event_id'], [$original['id'], $replacement['id']]);
        self::assertContains($workers[0], ['SAVED', 'CLOSED']);
        self::assertContains($workers[1], ['SAVED', 'CLOSED']);
    }

    public function testConcurrentEventRejectionAndResolutionLeaveBothOperationsConsistent(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Inés');
        $event = $this->createEvent($team, 'Carrera rechazo');
        $consultation = $this->createDateConsultation($team, ['2026-10-20']);
        $this->setEvent($consultation['id'], $event['id'], $this->auth($team));
        $workers = $this->runConcurrent($team, [
            ['mode' => 'resolve', 'consultationId' => $consultation['id'], 'participantId' => $team['participantId'], 'status' => 'resolved', 'optionIds' => [$consultation['options'][0]['id']]],
            ['mode' => 'reject_event', 'eventId' => $event['id'], 'participantId' => $team['participantId'], 'disposition' => 'unlink'],
        ]);

        self::assertContains('SAVED', $workers);
        self::assertSame('rejected', $this->eventRow($event['id'])['status']);
        self::assertSame('resolved', $this->consultationRow($consultation['id'])['state']);
        self::assertNull($this->consultationRow($consultation['id'])['open_event_id']);
        self::assertContains($this->consultationRow($consultation['id'])['event_id'], [null, $event['id']]);
        self::assertSame(['SAVED', 'SAVED'], $workers);
    }

    public function testConcurrentResolutionsPersistOnlyOneAcceptedOption(): void
    {
        $this->client->disableReboot();
        $team = $this->createTeam('Julia');
        $consultation = $this->createDateConsultation($team, ['2026-10-20', '2026-10-21']);
        $workers = $this->runConcurrent($team, [
            ['mode' => 'resolve', 'consultationId' => $consultation['id'], 'participantId' => $team['participantId'], 'status' => 'resolved', 'optionIds' => [$consultation['options'][0]['id']]],
            ['mode' => 'resolve', 'consultationId' => $consultation['id'], 'participantId' => $team['participantId'], 'status' => 'resolved', 'optionIds' => [$consultation['options'][1]['id']]],
        ]);

        self::assertContains('SAVED', $workers);
        self::assertSame('resolved', $this->consultationRow($consultation['id'])['state']);
        self::assertSame(1, (int) static::getContainer()->get(Connection::class)->fetchOne('SELECT COUNT(*) FROM consultation_resolution_option WHERE consultation_id = ?', [$consultation['id']]));
        self::assertContains($workers[0], ['SAVED', 'CLOSED']);
        self::assertContains($workers[1], ['SAVED', 'CLOSED']);
    }

    private function createTeam(string $participantName): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo ' . $participantName, 'firstParticipantName' => $participantName, 'timeZone' => 'UTC']);
        self::assertResponseStatusCodeSame(201);
        $created = $this->body();
        return [
            'id' => $created['id'],
            'participantId' => $created['firstParticipant']['id'],
            'token' => substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3),
        ];
    }

    private function createEvent(array $team, string $title, array $extra = []): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], 'title' => $title, ...$extra], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['event'];
    }

    private function createDateConsultation(array $team, array $dates, ?string $eventId = null): array
    {
        $payload = ['type' => 'date', 'participantId' => $team['participantId'], 'title' => 'Elegir fecha', 'options' => $dates, 'timeZone' => 'UTC'];
        if ($eventId !== null) {
            $payload['eventId'] = $eventId;
        }
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', $payload, server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['consultation'];
    }

    private function createTextConsultation(array $team): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'participantId' => $team['participantId'], 'title' => 'Pregunta textual', 'options' => ['Sí', 'No'],
        ], server: $this->auth($team));
        self::assertResponseStatusCodeSame(201);
        return $this->body()['consultation'];
    }

    private function setEvent(string $consultationId, ?string $eventId, array $server): void
    {
        $this->client->jsonRequest('PUT', '/api/teams/current/consultations/' . $consultationId . '/event', ['eventId' => $eventId], server: $server);
    }

    private function resolve(string $consultationId, array $payload, array $server): void
    {
        $this->client->jsonRequest('PUT', '/api/teams/current/consultations/' . $consultationId . '/resolution', $payload, server: $server);
    }

    private function rejectEvent(string $eventId, array $payload, array $server): void
    {
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $eventId . '/rejection', $payload, server: $server);
    }

    private function markEventRejected(string $eventId): void
    {
        static::getContainer()->get(Connection::class)->update('team_event', ['status' => 'rejected'], ['id' => $eventId]);
    }

    private function eventRow(string $eventId): array
    {
        return static::getContainer()->get(Connection::class)->fetchAssociative('SELECT status, event_date, version, last_modified_at, last_modified_by_participant_id FROM team_event WHERE id = ?', [$eventId]);
    }

    private function consultationRow(string $consultationId): array
    {
        return static::getContainer()->get(Connection::class)->fetchAssociative('SELECT state, event_id, open_event_id FROM consultation WHERE id = ?', [$consultationId]);
    }

    private function auth(array $team): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
    }

    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }

    private function runConcurrent(array $team, array $requests): array
    {
        $connection = static::getContainer()->get(Connection::class);
        $workers = [];
        $connection->beginTransaction();
        try {
            $connection->executeQuery('SELECT id FROM team WHERE id = ? FOR UPDATE', [$team['id']])->fetchOne();
            foreach ($requests as $request) {
                $process = proc_open([PHP_BINARY, __DIR__ . '/Support/concurrent_event_consultation.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                self::assertIsResource($process);
                self::assertSame("READY\n", fgets($pipes[1]));
                fwrite($pipes[0], json_encode($request + ['token' => $team['token']], JSON_THROW_ON_ERROR) . "\n");
                fclose($pipes[0]);
                $workers[] = [$process, $pipes];
            }
            $pids = array_map(static fn(array $worker): string => (string) proc_get_status($worker[0])['pid'], $workers);
            $deadline = microtime(true) + 5;
            do {
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
                $outcomes[] = trim(stream_get_contents($pipes[1]));
                $error = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                self::assertSame(0, proc_close($process), $error);
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
}
