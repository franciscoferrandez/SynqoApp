<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'availability')]
#[ORM\UniqueConstraint(name: 'availability_unique_day', columns: ['team_id', 'participant_id', 'date'])]
class AvailabilityRecord
{
    #[ORM\Id]
    #[ORM\Column(type: Types::GUID)]
    private string $id;

    public function __construct(
        #[ORM\ManyToOne(targetEntity: TeamRecord::class)]
        #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private TeamRecord $team,
        #[ORM\ManyToOne(targetEntity: ParticipantRecord::class)]
        #[ORM\JoinColumn(name: 'participant_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ParticipantRecord $participant,
        #[ORM\Column(type: Types::DATE_IMMUTABLE)]
        private DateTimeImmutable $date,
        #[ORM\Column(length: 11)]
        private string $state,
    ) {
        $this->id = Uuid::v7()->toRfc4122();
    }

    public function state(): string
    {
        return $this->state;
    }

    public function setState(string $state): void
    {
        $this->state = $state;
    }

    /** @return array{date: string, participantId: string, participantName: string, state: string} */
    public function toMark(): array
    {
        $person = $this->participant->toListItem();
        return ['date' => $this->date->format('Y-m-d'), 'participantId' => $person['id'], 'participantName' => $person['name'], 'state' => $this->state];
    }
}
