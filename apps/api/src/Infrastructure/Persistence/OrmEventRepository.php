<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Event\EventRepository;
use App\Application\Exception\EventConflict;
use App\Application\Exception\InvalidEventInput;
use App\Application\Exception\TeamNotFound;
use App\Application\Listing\ListContext;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamEventRecord;
use App\Infrastructure\Persistence\Entity\ConsultationRecord;
use App\Infrastructure\Persistence\Entity\TeamRecord;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\Uuid;

final readonly class OrmEventRepository implements EventRepository
{
    public function __construct(private ManagerRegistry $managers) {}

    public function listForTeam(string $teamId, ListContext $context, ?array $frontier): array
    {
        $connection = $this->manager()->getConnection();
        if ($connection->fetchOne("SELECT id FROM team_event WHERE team_id = :team AND status = 'rejected' AND last_modified_at IS NULL LIMIT 1", ['team' => $teamId]) !== false) {
            throw new \LogicException('Rejected events require a rejection moment.');
        }
        $parameters = ['team' => $teamId, 'zone' => $context->timeZone, 'today' => $context->today, 'window' => $context->windowStart()];
        $zoneSql = ':zone';
        if (($zoneOffset = $context->fixedOffsetSeconds()) !== null) {
            $parameters['zoneOffset'] = $zoneOffset;
            $zoneSql = 'make_interval(secs => :zoneOffset)';
        }
        $projection = <<<'SQL'
            WITH listing AS (
                SELECT e.id, c.id AS open_consultation_id,
                    CASE WHEN e.status = 'rejected' THEN (e.last_modified_at AT TIME ZONE :zone)::date
                         WHEN e.event_date IS NOT NULL THEN e.event_date
                         ELSE (e.created_at AT TIME ZONE :zone)::date END AS effective_date,
                    CASE WHEN e.status = 'rejected' THEN 'archived'
                         WHEN e.status = 'definitive' AND e.event_date < CAST(:today AS date) THEN 'archived'
                         ELSE 'active' END AS bucket
                FROM team_event e
                LEFT JOIN consultation c ON c.open_event_id = e.id AND c.team_id = e.team_id
                WHERE e.team_id = :team
            )
            SQL;
        $projection = str_replace('AT TIME ZONE :zone', 'AT TIME ZONE ' . $zoneSql, $projection);
        if ($frontier === null) {
            $active = $connection->fetchAllAssociative($projection . " SELECT id, effective_date, open_consultation_id FROM listing WHERE bucket = 'active' ORDER BY effective_date ASC, id ASC", $parameters);
            $archived = $connection->fetchAllAssociative($projection . " SELECT id, effective_date, open_consultation_id FROM listing WHERE bucket = 'archived' AND effective_date BETWEEN CAST(:window AS date) AND CAST(:today AS date) ORDER BY effective_date DESC, id ASC", $parameters);
            $older = $connection->fetchOne($projection . " SELECT id FROM listing WHERE bucket = 'archived' AND effective_date < CAST(:window AS date) LIMIT 1", $parameters);
            return [
                'active' => $this->listItems($teamId, $active),
                'archived' => $this->listItems($teamId, $archived),
                'nextFrontier' => $older === false ? null : ['date' => $context->windowStart(), 'id' => null],
            ];
        }
        $parameters['frontier_date'] = $frontier['date'];
        $condition = 'effective_date < CAST(:frontier_date AS date)';
        if ($frontier['id'] !== null) {
            $parameters['frontier_id'] = $frontier['id'];
            $condition .= ' OR (effective_date = CAST(:frontier_date AS date) AND id > CAST(:frontier_id AS uuid))';
        }
        $parameters['limit'] = $context->loadMoreCount + 1;
        $rows = $connection->fetchAllAssociative($projection . " SELECT id, effective_date, open_consultation_id FROM listing WHERE bucket = 'archived' AND (" . $condition . ') ORDER BY effective_date DESC, id ASC LIMIT :limit', $parameters, ['limit' => \Doctrine\DBAL\ParameterType::INTEGER]);
        $hasMore = count($rows) > $context->loadMoreCount;
        if ($hasMore) {
            array_pop($rows);
        }
        $last = $rows === [] ? null : array_last($rows);
        return [
            'archived' => $this->listItems($teamId, $rows),
            'nextFrontier' => $hasMore && $last !== null ? ['date' => (string) $last['effective_date'], 'id' => (string) $last['id']] : null,
        ];
    }

    /** @param list<array<string, mixed>> $rows
     * @return list<array<string, mixed>>
     */
    private function listItems(string $teamId, array $rows): array
    {
        if ($rows === []) {
            return [];
        }
        $records = $this->manager()->createQueryBuilder()
            ->select('event')
            ->from(TeamEventRecord::class, 'event')
            ->where('IDENTITY(event.team) = :team')
            ->andWhere('event.id IN (:ids)')
            ->setParameter('team', $teamId)
            ->setParameter('ids', array_column($rows, 'id'))
            ->getQuery()->getResult();
        $items = [];
        foreach ($records as $record) {
            if ($record instanceof TeamEventRecord) {
                $item = $record->toSummary();
                $items[$item['id']] = $item;
            }
        }
        return array_map(static fn(array $row): array => [...$items[$row['id']], 'effectiveDate' => (string) $row['effective_date'], 'openConsultationId' => $row['open_consultation_id']], $rows);
    }

    public function calendarForTeam(string $teamId, string $from, string $to): array
    {
        $manager = $this->manager();
        $records = $manager->getRepository(TeamEventRecord::class)->createQueryBuilder('event')
            ->andWhere('IDENTITY(event.team) = :team')
            ->andWhere('event.status <> :rejected')
            ->andWhere('event.date BETWEEN :from AND :to')
            ->setParameter('team', $teamId)
            ->setParameter('rejected', 'rejected')
            ->setParameter('from', new DateTimeImmutable($from, new DateTimeZone('UTC')))
            ->setParameter('to', new DateTimeImmutable($to, new DateTimeZone('UTC')))
            ->getQuery()
            ->getResult();

        usort($records, static function (TeamEventRecord $left, TeamEventRecord $right): int {
            $leftSummary = $left->toSummary();
            $rightSummary = $right->toSummary();
            return strcmp((string) $leftSummary['date'], (string) $rightSummary['date'])
                ?: ((int) ($leftSummary['status'] !== 'provisional') <=> (int) ($rightSummary['status'] !== 'provisional'))
                ?: strcmp((string) ($rightSummary['lastModifiedAt'] ?? $right->createdAt()->format(DATE_ATOM)), (string) ($leftSummary['lastModifiedAt'] ?? $left->createdAt()->format(DATE_ATOM)))
                ?: strcmp($leftSummary['id'], $rightSummary['id']);
        });

        return array_map(static fn(TeamEventRecord $record): array => $record->toCalendarItem(), $records);
    }

    public function detailForTeam(string $teamId, string $eventId): ?array
    {
        if (!Uuid::isValid($eventId)) {
            return null;
        }
        $manager = $this->manager();
        $team = $manager->getReference(TeamRecord::class, $teamId);
        $event = $manager->getRepository(TeamEventRecord::class)->findOneBy(['id' => $eventId, 'team' => $team]);

        if (!$event instanceof TeamEventRecord) {
            return null;
        }
        $detail = $event->toDetail();
        $consultations = $manager->getRepository(ConsultationRecord::class)->findBy(['event' => $event], ['createdAt' => 'DESC']);
        if ($consultations !== []) {
            $detail['consultations'] = array_map(static fn(ConsultationRecord $consultation): array => [
                'id' => $consultation->toItem()['id'],
                'title' => $consultation->toItem()['title'],
                'state' => $consultation->toItem()['state'],
            ], $consultations);
        }

        return $detail;
    }

    public function create(string $teamId, string $participantId, string $eventId, string $title, ?string $notes, ?string $date, string $status, string $at, string $activityAt): array
    {
        $manager = $this->manager();
        [$team, $participant] = $this->actors($teamId, $participantId);
        $team->setLastActivityAt(new DateTimeImmutable($activityAt));
        $event = new TeamEventRecord($eventId, $team, $participant, null, $title, $notes, $this->date($date), $status, new DateTimeImmutable($at));
        $manager->persist($event);

        return $event->toDetail();
    }

    public function update(string $teamId, string $eventId, string $participantId, string $title, ?string $notes, ?string $date, string $status, string $at, string $activityAt): bool
    {
        $manager = $this->manager();
        [$event, $participant] = $this->eventAndActor($teamId, $eventId, $participantId);
        if ($event->toSummary()['status'] === 'rejected') {
            throw new EventConflict();
        }
        $changed = $event->update($title, $notes, $this->date($date), $status, $participant, new DateTimeImmutable($at));
        if ($changed) {
            $eventTeam = $manager->getReference(TeamRecord::class, $teamId);
            $eventTeam->setLastActivityAt(new DateTimeImmutable($activityAt));
        }

        return $changed;
    }

    public function reject(string $teamId, string $eventId, string $participantId, ?string $disposition, string $at, string $activityAt): bool
    {
        $manager = $this->manager();
        [$event, $participant] = $this->eventAndActor($teamId, $eventId, $participantId);
        $openConsultations = $manager->getRepository(ConsultationRecord::class)->findBy(['event' => $event, 'state' => 'open']);
        if ($openConsultations !== [] && $disposition === null) {
            throw new InvalidEventInput(['disposition']);
        }
        foreach ($openConsultations as $consultation) {
            if ($disposition === 'reject_both') {
                $consultation->resolve('rejected', $participant, new DateTimeImmutable($at), []);
            } else {
                $consultation->setEvent(null);
            }
        }
        if (!$event->reject($participant, new DateTimeImmutable($at))) {
            throw new EventConflict();
        }
        $this->manager()->getReference(TeamRecord::class, $teamId)->setLastActivityAt(new DateTimeImmutable($activityAt));

        return true;
    }

    public function recover(string $teamId, string $eventId, string $participantId, string $at, string $activityAt): bool
    {
        [$event, $participant] = $this->eventAndActor($teamId, $eventId, $participantId);
        if (!$event->recover($participant, new DateTimeImmutable($at))) {
            throw new EventConflict();
        }
        $this->manager()->getReference(TeamRecord::class, $teamId)->setLastActivityAt(new DateTimeImmutable($activityAt));

        return true;
    }

    /** @return array{TeamRecord, ParticipantRecord} */
    private function actors(string $teamId, string $participantId): array
    {
        $manager = $this->manager();
        $team = $manager->find(TeamRecord::class, $teamId);
        $participant = $manager->find(ParticipantRecord::class, $participantId);
        if (!$team instanceof TeamRecord || !$participant instanceof ParticipantRecord || $participant->team() !== $team) {
            throw new TeamNotFound();
        }

        return [$team, $participant];
    }

    /** @return array{TeamEventRecord, ParticipantRecord} */
    private function eventAndActor(string $teamId, string $eventId, string $participantId): array
    {
        if (!Uuid::isValid($eventId)) {
            throw new TeamNotFound();
        }
        $manager = $this->manager();
        $team = $manager->getReference(TeamRecord::class, $teamId);
        $event = $manager->getRepository(TeamEventRecord::class)->findOneBy(['id' => $eventId, 'team' => $team]);
        $participant = $manager->find(ParticipantRecord::class, $participantId);
        if (!$event instanceof TeamEventRecord || !$participant instanceof ParticipantRecord || $participant->team() !== $team) {
            throw new TeamNotFound();
        }

        return [$event, $participant];
    }

    private function date(?string $date): ?DateTimeImmutable
    {
        if ($date === null) {
            return null;
        }
        return DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('UTC')) ?: throw new \LogicException('Validated event dates must parse.');
    }

    private function manager(): EntityManagerInterface
    {
        $manager = $this->managers->getManager();
        if (!$manager instanceof EntityManagerInterface) {
            throw new \LogicException('Doctrine ORM entity manager is required.');
        }

        return $manager;
    }
}
