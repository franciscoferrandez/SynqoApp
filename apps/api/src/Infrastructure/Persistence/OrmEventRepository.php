<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Event\EventRepository;
use App\Application\Exception\EventConflict;
use App\Application\Exception\InvalidEventInput;
use App\Application\Exception\TeamNotFound;
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

    public function listForTeam(string $teamId): array
    {
        $manager = $this->manager();
        $team = $manager->getReference(TeamRecord::class, $teamId);
        $records = $manager->getRepository(TeamEventRecord::class)->findBy(['team' => $team]);

        return array_map(static fn(TeamEventRecord $record): array => [...$record->toSummary(), '_createdAt' => $record->createdAt()->format(DATE_ATOM)], $records);
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
