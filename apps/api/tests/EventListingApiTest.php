<?php

declare(strict_types=1);

namespace App\Tests;

use App\Application\Listing\ListPolicy;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Clock\MockClock;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class EventListingApiTest extends WebTestCase
{
    private KernelBrowser $client;
    private MockClock $clock;

    protected function setUp(): void
    {
        $this->client = static::createClient(server: [], options: ['environment' => 'test']);
        static::getContainer()->get(Connection::class)->executeStatement('DELETE FROM team');
        $this->client->disableReboot();
        $this->clock = new MockClock('2026-10-18T12:00:00+00:00');
        static::getContainer()->set('clock', $this->clock);
    }

    public function testInitialWindowIncludesEveryRecentArchivedEventAndContinuationPagesOlderHistory(): void
    {
        $team = $this->createTeam('Ana', 'Europe/Madrid');
        for ($index = 0; $index < 13; ++$index) {
            $this->createEvent($team, sprintf('Reciente %02d', $index), '2026-10-17');
        }
        for ($index = 0; $index < 23; ++$index) {
            $this->createEvent($team, sprintf('Antiguo %02d', $index), '2026-10-01');
        }

        $this->getInitialList($team);
        $initial = $this->body();
        self::assertEqualsCanonicalizing(['active', 'archived', 'archivedCursor', 'listContext'], array_keys($initial));
        self::assertCount(13, $initial['archived']);
        self::assertSame('2026-10-18', $initial['listContext']['today']);
        self::assertSame('Europe/Madrid', $initial['listContext']['timeZone']);
        self::assertSame(7, $initial['listContext']['recentDays']);
        self::assertSame(10, $initial['listContext']['loadMoreCount']);
        self::assertNotNull($initial['archivedCursor']);

        $first = $this->getArchivedPage($team, $initial['archivedCursor']);
        self::assertEqualsCanonicalizing(['archived', 'archivedCursor', 'listContext'], array_keys($first));
        self::assertArrayNotHasKey('active', $first);
        self::assertCount(10, $first['archived']);
        self::assertSame(10, count(array_unique(array_column($first['archived'], 'id'))));
        self::assertNotNull($first['archivedCursor']);

        $second = $this->getArchivedPage($team, $first['archivedCursor']);
        self::assertCount(10, $second['archived']);
        self::assertNotNull($second['archivedCursor']);

        $third = $this->getArchivedPage($team, $second['archivedCursor']);
        self::assertCount(3, $third['archived']);
        self::assertNull($third['archivedCursor']);
        $allIds = array_merge(
            array_column($initial['archived'], 'id'),
            array_column($first['archived'], 'id'),
            array_column($second['archived'], 'id'),
            array_column($third['archived'], 'id'),
        );
        self::assertCount(36, $allIds);
        self::assertCount(36, array_unique($allIds));
    }

    public function testRejectedEventsUseTheLastRejectionDayForVigency(): void
    {
        $team = $this->createTeam('Bea', 'Europe/Madrid');
        $event = $this->createEvent($team, 'Rechazado con fecha', '2026-10-10');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', [
            'participantId' => $team['participantId'],
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);

        $this->getInitialList($team);
        $archived = $this->body()['archived'];
        self::assertSame($event['id'], $archived[0]['id']);
        self::assertSame('2026-10-18', $archived[0]['effectiveDate']);
        self::assertSame('2026-10-10', $archived[0]['date']);
        self::assertSame('rejected', $archived[0]['status']);
        self::assertNotNull($archived[0]['lastModifiedAt']);
    }

    public function testCursorAuthorizationForeignTeamAndReadOnlyListing(): void
    {
        $owner = $this->createTeam('Clara', 'UTC');
        $foreign = $this->createTeam('Dani', 'UTC');
        $this->createEvent($owner, 'Antiguo', '2026-10-01');
        $this->getInitialList($owner);
        $cursor = $this->body()['archivedCursor'];
        self::assertNotNull($cursor);

        $connection = static::getContainer()->get(Connection::class);
        $activityBefore = $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$owner['id']]);
        $this->client->request('GET', '/api/teams/current/events?archivedCursor=malformado');
        self::assertResponseStatusCodeSame(401);
        $this->client->request('GET', '/api/teams/current/events?archivedCursor=malformado', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(400);
        $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $cursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $foreign['token']]);
        self::assertResponseStatusCodeSame(400);
        self::assertSame($activityBefore, $connection->fetchOne('SELECT last_activity_at FROM team WHERE id = ?', [$owner['id']]));

        $connection->update('team', ['last_activity_at' => '2000-01-01 00:00:00+00'], ['id' => $owner['id']]);
        $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $cursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $owner['token']]);
        self::assertResponseStatusCodeSame(410);
    }

    public function testEmptyRecentWindowCanLoadOlderHistoryAndDayRolloverRejectsOldCursor(): void
    {
        $team = $this->createTeam('Elena', 'Europe/Madrid');
        $this->createEvent($team, 'Histórico', '2026-10-01');
        $this->getInitialList($team);
        $initial = $this->body();
        self::assertSame([], $initial['archived']);
        self::assertNotNull($initial['archivedCursor']);

        $page = $this->getArchivedPage($team, $initial['archivedCursor']);
        self::assertCount(1, $page['archived']);
        self::assertSame('2026-10-01', $page['archived'][0]['effectiveDate']);
        self::assertNull($page['archivedCursor']);

        $this->getInitialList($team);
        $cursor = $this->body()['archivedCursor'];
        self::assertNotNull($cursor);
        $this->clock->modify('+1 day');
        $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $cursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:list-context-changed', $this->body()['type']);
    }

    public function testRejectedEventWithoutRejectionMomentFailsAsGenericInternalError(): void
    {
        $team = $this->createTeam('Gabriela', 'UTC');
        $event = $this->createEvent($team, 'Dato incoherente', '2026-10-17');
        $this->client->jsonRequest('PUT', '/api/teams/current/events/' . $event['id'] . '/rejection', [
            'participantId' => $team['participantId'],
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);

        static::getContainer()->get(Connection::class)->update('team_event', ['last_modified_at' => null], ['id' => $event['id']]);
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(500);
        self::assertResponseHeaderSame('Content-Type', 'application/problem+json');
        self::assertSame([
            'type' => 'about:blank',
            'title' => 'Error interno',
            'status' => 500,
            'detail' => 'No se pudo completar la operación. Inténtalo de nuevo.',
        ], $this->body());
        self::assertStringNotContainsString('Dato incoherente', $this->client->getResponse()->getContent());
    }

    public function testEventProjectionUsesTeamCivilDayAcrossDstAliasesAndFixedOffsets(): void
    {
        $this->clock->modify('+6 days 12 hours 30 minutes');
        $cases = [
            ['zone' => 'Europe/Madrid', 'today' => '2026-10-25', 'effectiveDate' => '2026-10-25'],
            ['zone' => 'America/Los_Angeles', 'today' => '2026-10-24', 'effectiveDate' => '2026-10-24'],
            ['zone' => 'US/Eastern', 'today' => '2026-10-24', 'effectiveDate' => '2026-10-24'],
            ['zone' => 'GMT+0100', 'today' => '2026-10-25', 'effectiveDate' => '2026-10-25'],
            ['zone' => '+01:00', 'today' => '2026-10-25', 'effectiveDate' => '2026-10-25'],
            ['zone' => '-02:00', 'today' => '2026-10-24', 'effectiveDate' => '2026-10-24'],
        ];
        $madridTeam = null;
        foreach ($cases as $index => $case) {
            $team = $this->createTeam('Zona ' . $index, $case['zone']);
            $this->client->jsonRequest('POST', '/api/teams/current/events', [
                'participantId' => $team['participantId'],
                'title' => 'Sin fecha ' . $index,
            ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(201);
            $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(200);
            $list = $this->body();
            self::assertSame($case['today'], $list['listContext']['today'], $case['zone']);
            self::assertSame($case['effectiveDate'], $list['active'][0]['effectiveDate'], $case['zone']);
            if ($index === 0) {
                $madridTeam = $team;
            }
        }

        self::assertIsArray($madridTeam);
        $this->clock->modify('+1 hour'); // Madrid has crossed the autumn DST transition.
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $madridTeam['token']]);
        self::assertSame('2026-10-25', $this->body()['listContext']['today']);
        self::assertSame('2026-10-25', $this->body()['active'][0]['effectiveDate']);
        $this->clock->modify('+21 hours 30 minutes');
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $madridTeam['token']]);
        self::assertSame('2026-10-26', $this->body()['listContext']['today']);
        self::assertSame('2026-10-25', $this->body()['active'][0]['effectiveDate']);
    }

    public function testEventProjectionIncludesExactWindowBoundary(): void
    {
        $team = $this->createTeam('Hugo', 'UTC');
        $this->createEvent($team, 'Límite incluido', '2026-10-12');
        $this->createEvent($team, 'Anterior al límite', '2026-10-11');
        $this->getInitialList($team);
        $list = $this->body();
        self::assertSame(['Límite incluido'], array_column($list['archived'], 'title'));
        self::assertNotNull($list['archivedCursor']);
        self::assertSame('Anterior al límite', $this->getArchivedPage($team, $list['archivedCursor'])['archived'][0]['title']);
    }

    public function testEventDatabaseProjectionHonorsAlternativeWindowAndBatchPolicy(): void
    {
        static::getContainer()->set(ListPolicy::class, new ListPolicy(3, 2));
        $team = $this->createTeam('Julia', 'UTC');
        foreach (['2026-10-16', '2026-10-15', '2026-10-14'] as $index => $date) {
            $this->createEvent($team, 'Alternativa ' . $index, $date);
        }
        $this->getInitialList($team);
        $alternative = $this->body();
        self::assertSame(3, $alternative['listContext']['recentDays']);
        self::assertSame(2, $alternative['listContext']['loadMoreCount']);
        self::assertSame(['Alternativa 0'], array_column($alternative['archived'], 'title'));
        $page = $this->getArchivedPage($team, $alternative['archivedCursor']);
        self::assertCount(2, $page['archived']);
        self::assertNull($page['archivedCursor']);
    }

    public function testCursorRejectsOtherResourceAndVersionAndDetectsTimeZoneChange(): void
    {
        $team = $this->createTeam('Inés', 'Europe/Madrid');
        $this->createEvent($team, 'Antiguo', '2026-10-01');
        $this->getInitialList($team);
        $cursor = $this->body()['archivedCursor'];
        self::assertIsString($cursor);
        $decoded = json_decode(base64_decode(strtr($cursor, '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
        foreach (['resource' => 'consultations', 'version' => 2] as $field => $value) {
            $forged = $decoded;
            $forged[$field] = $value;
            $invalidCursor = rtrim(strtr(base64_encode(json_encode($forged, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
            $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $invalidCursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
            self::assertResponseStatusCodeSame(400);
        }

        static::getContainer()->get(Connection::class)->update('team', ['time_zone' => 'US/Eastern'], ['id' => $team['id']]);
        static::getContainer()->get(EntityManagerInterface::class)->clear();
        $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $cursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('urn:synqo:problem:list-context-changed', $this->body()['type']);
    }

    private function createTeam(string $participantName, string $timeZone): array
    {
        $this->client->jsonRequest('POST', '/api/teams', [
            'name' => 'Equipo ' . $participantName,
            'firstParticipantName' => $participantName,
            'timeZone' => $timeZone,
        ]);
        self::assertResponseStatusCodeSame(201);
        $created = $this->body();

        return [
            'id' => $created['id'],
            'participantId' => $created['firstParticipant']['id'],
            'token' => substr($created['accessUrl'], strpos($created['accessUrl'], '#t=') + 3),
        ];
    }

    private function createEvent(array $team, string $title, string $date): array
    {
        $this->client->jsonRequest('POST', '/api/teams/current/events', [
            'participantId' => $team['participantId'],
            'title' => $title,
            'date' => $date,
            'status' => 'definitive',
        ], server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(201);

        return $this->body()['event'];
    }

    private function getInitialList(array $team): void
    {
        $this->client->request('GET', '/api/teams/current/events', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);
    }

    private function getArchivedPage(array $team, string $cursor): array
    {
        $this->client->request('GET', '/api/teams/current/events?' . http_build_query(['archivedCursor' => $cursor]), server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $team['token']]);
        self::assertResponseStatusCodeSame(200);

        return $this->body();
    }

    private function body(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}
