<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Listing\ListPolicy;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Uid\Uuid;

final class ConsultationListingApiTest extends WebTestCase
{
    private KernelBrowser $client;
    private MockClock $clock;
    private Connection $db;

    protected function setUp(): void
    {
        $this->client = static::createClient(options: ['environment' => 'test']);
        $this->client->disableReboot();
        $this->clock = new MockClock('2026-10-25T00:30:00Z');
        static::getContainer()->set('clock', $this->clock);
        $this->db = static::getContainer()->get(Connection::class);
        $this->db->executeStatement('DELETE FROM team');
    }

    public function testMatrixUsesTeamCivilDatesAndLatestAcceptedRatherThanOfferedWithoutWriting(): void
    {
        $team = $this->team('America/Los_Angeles'); // Still October 24, while UTC is October 25.
        $textOpen = $this->fixture($team, 'text', 'open', [], [], '2026-10-20T23:00:00Z');
        $textResolved = $this->fixture($team, 'text', 'resolved', [], [0], '2026-10-20T23:00:00Z', '2026-10-25T00:00:00Z');
        $textRejected = $this->fixture($team, 'text', 'rejected', [], [], '2026-10-20T23:00:00Z', '2026-10-24T00:00:00Z');
        $dateOpen = $this->fixture($team, 'date', 'open', ['2026-10-23', '2026-10-24'], [], '2026-10-22T12:00:00Z');
        $dateExpired = $this->fixture($team, 'date', 'open', ['2026-10-20', '2026-10-23']);
        $resolvedFuture = $this->fixture($team, 'date', 'resolved', ['2026-10-24', '2026-10-27', '2026-10-30'], [0, 1]);
        $resolvedPast = $this->fixture($team, 'date', 'resolved', ['2026-10-22', '2026-10-30'], [0]);
        $rejectedDate = $this->fixture($team, 'date', 'rejected', ['2026-10-30'], [], resolved: '2026-10-24T00:00:00Z');
        $other = $this->team();
        $this->fixture($other, 'text', 'open');
        $before = $this->db->fetchAllAssociative('SELECT * FROM consultation ORDER BY id');
        $activity = $this->db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]);

        $body = $this->listing($team);
        self::assertSame('2026-10-24', $body['listContext']['today']);
        self::assertSame([$textOpen['id'], $dateOpen['id'], $textResolved['id'], $resolvedFuture['id']], array_column($body['active'], 'id'));
        self::assertSame(['2026-10-20', '2026-10-22', '2026-10-24', '2026-10-27'], array_column($body['active'], 'effectiveDate'));
        $expectedArchived = [$textRejected['id'], $dateExpired['id'], $rejectedDate['id']];
        sort($expectedArchived);
        $expectedArchived[] = $resolvedPast['id'];
        self::assertSame($expectedArchived, array_column($body['archived'], 'id'));
        self::assertSame(['2026-10-23', '2026-10-23', '2026-10-23', '2026-10-22'], array_column($body['archived'], 'effectiveDate'));
        self::assertSame(['open', 'resolved'], array_values(array_unique(array_column($body['active'], 'state'))));
        self::assertSame($before, $this->db->fetchAllAssociative('SELECT * FROM consultation ORDER BY id'));
        self::assertSame($activity, $this->db->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$team['id']]));
    }

    public function testCreationUsesDeviceZoneForDateValidationAndTeamDayForListing(): void
    {
        $team = $this->team('Europe/Madrid');
        $this->client->jsonRequest('POST', '/api/teams/current/consultations', [
            'type' => 'date',
            'participantId' => $team['participantId'],
            'title' => 'Elegir fecha',
            'options' => ['2026-10-24'],
            'timeZone' => 'America/Los_Angeles',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);

        self::assertResponseStatusCodeSame(201);
        $created = $this->body()['consultation'];
        self::assertSame(['2026-10-24'], array_column($created['options'], 'date'));

        $body = $this->listing($team);
        self::assertSame('2026-10-25', $body['listContext']['today']);
        self::assertSame([], $body['active']);
        self::assertSame($created['id'], $body['archived'][0]['id']);
        self::assertSame('2026-10-24', $body['archived'][0]['effectiveDate']);
    }

    public function testInitialWindowIncludesMoreThanTenAndCursorPagesTiesTenTenRemainder(): void
    {
        $team = $this->team();
        $recent = [];
        for ($i = 0; $i < 12; ++$i) {
            $recent[] = $this->fixture($team, 'text', 'rejected', resolved: $i === 0 ? '2026-10-19T00:00:00Z' : '2026-10-25T00:00:00Z');
        }
        $olderIds = [];
        for ($i = 0; $i < 23; ++$i) {
            $olderIds[] = $this->fixture($team, 'date', 'open', ['2026-10-18'])['id'];
        }
        sort($olderIds);
        $body = $this->listing($team);
        self::assertCount(12, $body['archived']);
        self::assertSame($recent[0]['id'], $body['archived'][11]['id']);
        $seen = [];
        foreach ([10, 10, 3] as $count) {
            self::assertIsString($body['archivedCursor']);
            $body = $this->listing($team, $body['archivedCursor']);
            self::assertArrayNotHasKey('active', $body);
            self::assertCount($count, $body['archived']);
            $seen = [...$seen, ...array_column($body['archived'], 'id')];
        }
        self::assertSame($olderIds, $seen);
        self::assertNull($body['archivedCursor']);
    }

    public function testEmptyRecentWindowKeepsCursorAndAlternativePolicyControlsBothWindowAndBatch(): void
    {
        static::getContainer()->set(ListPolicy::class, new ListPolicy(3, 2));
        $team = $this->team();
        for ($i = 0; $i < 3; ++$i) {
            $this->fixture($team, 'date', 'open', ['2026-10-22']);
        }
        $body = $this->listing($team);
        self::assertSame([], $body['archived']);
        self::assertSame(3, $body['listContext']['recentDays']);
        self::assertSame(2, $body['listContext']['loadMoreCount']);
        $body = $this->listing($team, $body['archivedCursor']);
        self::assertCount(2, $body['archived']);
        $body = $this->listing($team, $body['archivedCursor']);
        self::assertCount(1, $body['archived']);
        self::assertNull($body['archivedCursor']);
    }

    public function testCursorIsAuthorizedScopedValidatedAndInvalidatedAtTeamMidnightOrZoneChange(): void
    {
        $team = $this->team('Europe/Madrid');
        $this->fixture($team, 'date', 'open', ['2026-10-01']);
        $cursor = $this->listing($team)['archivedCursor'];
        self::assertIsString($cursor);
        foreach (['', 'nonsense', 'a/b', ['bad']] as $invalid) {
            $this->requestList($team, $invalid);
            self::assertResponseStatusCodeSame(400);
            self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        }
        $this->client->request('GET', '/api/teams/current/consultations?archivedCursor=invalid');
        self::assertResponseStatusCodeSame(401);
        $this->client->request('GET', '/api/teams/current/consultations?archivedCursor=invalid', server: ['HTTP_AUTHORIZATION' => 'Bearer invalid']);
        self::assertResponseStatusCodeSame(404);
        $other = $this->team();
        $this->requestList($other, $cursor);
        self::assertResponseStatusCodeSame(400);
        $decoded = json_decode(base64_decode(strtr($cursor, '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
        foreach (['resource' => 'events', 'version' => 2] as $key => $value) {
            $forged = $decoded;
            $forged[$key] = $value;
            $this->requestList($team, rtrim(strtr(base64_encode(json_encode($forged, JSON_THROW_ON_ERROR)), '+/', '-_'), '='));
            self::assertResponseStatusCodeSame(400);
        }
        $this->clock->modify('+23 hours'); // Madrid reaches tomorrow after its 25-hour DST day.
        $this->requestList($team, $cursor);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:list-context-changed', $this->body()['type']);
        $cursor = $this->listing($team)['archivedCursor'];
        $this->db->update('team', ['time_zone' => 'US/Eastern'], ['id' => $team['id']]);
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $this->requestList($team, $cursor);
        self::assertResponseStatusCodeSame(409);
        $cursor = $this->listing($team)['archivedCursor'];
        $this->requestList($team, $cursor);
        self::assertResponseStatusCodeSame(200);
        $this->db->update('team', ['last_activity_at' => '2020-01-01T00:00:00Z'], ['id' => $team['id']]);
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $this->requestList($team, 'invalid');
        self::assertResponseStatusCodeSame(410);
    }

    public function testArchivedOpenConsultationKeepsVoteEditAndResolveAndCanBecomeActive(): void
    {
        $team = $this->team();
        $consultation = $this->fixture($team, 'date', 'open', ['2026-10-23', '2026-10-24']);
        $base = '/api/teams/current/consultations/' . $consultation['id'];
        $server = ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
        self::assertSame($consultation['id'], $this->listing($team)['archived'][0]['id']);
        $this->client->jsonRequest('PUT', $base . '/votes/' . $team['participantId'] . '/options/' . $consultation['options'][0], ['selected' => true], server: $server);
        self::assertResponseStatusCodeSame(200);
        $this->client->jsonRequest('PATCH', $base, ['participantId' => $team['participantId'], 'title' => 'Renombrada', 'optionChanges' => ['add' => [['id' => Uuid::v7()->toRfc4122(), 'date' => '2026-10-25']]]], server: $server);
        self::assertResponseStatusCodeSame(200);
        self::assertSame(1, $this->body()['consultation']['options'][0]['count']);
        self::assertSame($consultation['id'], $this->listing($team)['active'][0]['id']);
        $this->client->jsonRequest('PUT', $base . '/resolution', ['participantId' => $team['participantId'], 'status' => 'resolved', 'acceptedOptionIds' => [$consultation['options'][0]]], server: $server);
        self::assertResponseStatusCodeSame(200);
        $body = $this->listing($team);
        self::assertSame([], $body['active']);
        self::assertSame('2026-10-23', $body['archived'][0]['effectiveDate']);
        self::assertSame('resolved', $body['archived'][0]['state']);
    }

    public function testOpenOccupationDoesNotDependOnArchivedWindowAndIsTeamScoped(): void
    {
        $team = $this->team();
        $server = ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']];
        $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], 'title' => 'Evento ocupado'], server: $server);
        self::assertResponseStatusCodeSame(201);
        $event = $this->body()['event'];
        $consultation = $this->fixture($team, 'date', 'open', ['2026-10-01']);
        $this->db->update('consultation', ['event_id' => $event['id'], 'open_event_id' => $event['id']], ['id' => $consultation['id']]);
        $this->client->jsonRequest('POST', '/api/teams/current/events', ['participantId' => $team['participantId'], 'title' => 'Evento libre'], server: $server);
        self::assertResponseStatusCodeSame(201);
        $free = $this->body()['event'];
        self::assertSame([], $this->listing($team)['archived']);
        $this->client->request('GET', '/api/teams/current/events', server: $server);
        self::assertResponseStatusCodeSame(200);
        $occupants = array_column($this->body()['unfinalized'], 'openConsultationId', 'id');
        self::assertSame($consultation['id'], $occupants[$event['id']]);
        self::assertNull($occupants[$free['id']]);
        $other = $this->team();
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $other['token']]);
        self::assertSame([], $this->body()['unfinalized']);
    }

    public function testPhpFixedOffsetsAliasesAndAbbreviationsKeepTheirCivilDayInSql(): void
    {
        foreach (['+01:00', 'GMT+0100', '-02:00', 'US/Eastern', 'CET'] as $zone) {
            $team = $this->team($zone);
            $this->fixture($team, 'text', 'open', created: '2026-10-24T23:30:00Z');
            $body = $this->listing($team);
            $phpZone = new \DateTimeZone($zone);
            self::assertSame($this->clock->now()->setTimezone($phpZone)->format('Y-m-d'), $body['listContext']['today']);
            self::assertSame(new \DateTimeImmutable('2026-10-24T23:30:00Z')->setTimezone($phpZone)->format('Y-m-d'), $body['active'][0]['effectiveDate'], $zone);
        }
    }

    /** @return array{id: string, participantId: string, token: string} */
    private function team(string $zone = 'UTC'): array
    {
        $this->client->jsonRequest('POST', '/api/teams', ['name' => 'Equipo', 'firstParticipantName' => 'Ana', 'timeZone' => $zone]);
        self::assertResponseStatusCodeSame(201);
        $team = $this->body();
        return ['id' => $team['id'], 'participantId' => $team['firstParticipant']['id'], 'token' => substr($team['accessUrl'], strpos($team['accessUrl'], '#t=') + 3)];
    }

    /** @param array{id: string, participantId: string, token: string} $team
     * @param list<string> $dates
     * @param list<int> $accepted
     * @return array{id: string, options: list<string>}
     */
    private function fixture(array $team, string $type, string $state, array $dates = [], array $accepted = [], string $created = '2026-10-20T12:00:00Z', string $resolved = '2026-10-25T00:00:00Z'): array
    {
        $id = Uuid::v7()->toRfc4122();
        $this->db->insert('consultation', ['id' => $id, 'team_id' => $team['id'], 'created_by_participant_id' => $team['participantId'], 'type' => $type, 'title' => 'Consulta ' . $id, 'state' => $state, 'created_at' => $created, 'resolved_at' => $state === 'open' ? null : $resolved, 'resolved_by_participant_id' => $state === 'open' ? null : $team['participantId']]);
        $optionIds = [];
        foreach ($type === 'text' ? ['Sí', 'No'] : $dates as $position => $value) {
            $optionId = Uuid::v7()->toRfc4122();
            $optionIds[] = $optionId;
            $this->db->insert('consultation_option', ['id' => $optionId, 'consultation_id' => $id, 'position' => $position, 'option_date' => $type === 'date' ? $value : null, 'option_text' => $type === 'text' ? $value : null]);
            if (in_array($position, $accepted, true)) {
                $this->db->insert('consultation_resolution_option', ['consultation_id' => $id, 'option_id' => $optionId]);
            }
        }
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        return ['id' => $id, 'options' => $optionIds];
    }

    /** @param array{id: string, participantId: string, token: string} $team
     * @return array<string, mixed>
     */
    private function listing(array $team, ?string $cursor = null): array
    {
        $this->requestList($team, $cursor);
        self::assertResponseStatusCodeSame(200);
        return $this->body();
    }

    /** @param array{id: string, participantId: string, token: string} $team */
    private function requestList(array $team, mixed $cursor): void
    {
        $this->client->request('GET', '/api/teams/current/consultations', parameters: $cursor === null ? [] : ['archivedCursor' => $cursor], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
    }

    /** @return array<string, mixed> */
    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}
