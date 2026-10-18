<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Application\Event\EventRepository;
use App\Application\Exception\EventConflict;
use App\Application\Exception\TeamNotFound;
use App\Infrastructure\Persistence\Entity\ParticipantRecord;
use App\Infrastructure\Persistence\Entity\TeamEventRecord;
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

    public function detailForTeam(string $teamId, string $eventId): ?array
    {
        if (!Uuid::isValid($eventId)) {
            return null;
        }
        $manager = $this->manager();
        $team = $manager->getReference(TeamRecord::class, $teamId);
        $event = $manager->getRepository(TeamEventRecord::class)->findOneBy(['id' => $eventId, 'team' => $team]);

        return $event instanceof TeamEventRecord ? $event->toDetail() : null;
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

    public function reject(string $teamId, string $eventId, string $participantId, string $at, string $activityAt): bool
    {
        [$event, $participant] = $this->eventAndActor($teamId, $eventId, $participantId);
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
