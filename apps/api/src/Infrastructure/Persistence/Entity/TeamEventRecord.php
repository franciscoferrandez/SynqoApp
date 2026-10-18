<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'team_event')]
#[ORM\Index(name: 'team_event_team_status_date_idx', columns: ['team_id', 'status', 'event_date'])]
class TeamEventRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\ManyToOne(targetEntity: TeamRecord::class)]
        #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private TeamRecord $team,
        #[ORM\ManyToOne(targetEntity: ParticipantRecord::class)]
        #[ORM\JoinColumn(name: 'created_by_participant_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ParticipantRecord $createdBy,
        #[ORM\ManyToOne(targetEntity: ParticipantRecord::class)]
        #[ORM\JoinColumn(name: 'last_modified_by_participant_id', referencedColumnName: 'id', nullable: true, onDelete: 'CASCADE')]
        private ?ParticipantRecord $lastModifiedBy,
        #[ORM\Column(length: 250)]
        private string $title,
        #[ORM\Column(type: Types::TEXT, nullable: true)]
        private ?string $notes,
        #[ORM\Column(name: 'event_date', type: Types::DATE_IMMUTABLE, nullable: true)]
        private ?DateTimeImmutable $date,
        #[ORM\Column(length: 12)]
        private string $status,
        #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $createdAt,
        #[ORM\Column(name: 'last_modified_at', type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
        private ?DateTimeImmutable $lastModifiedAt = null,
        #[ORM\Column(type: Types::INTEGER, options: ['default' => 1])]
        private int $version = 1,
    ) {}

    public function update(string $title, ?string $notes, ?DateTimeImmutable $date, string $status, ParticipantRecord $actor, DateTimeImmutable $at): bool
    {
        if ($this->status === 'rejected') {
            return false;
        }
        if ($this->title === $title && $this->notes === $notes && $this->date?->format('Y-m-d') === $date?->format('Y-m-d') && $this->status === $status) {
            return false;
        }

        $this->title = $title;
        $this->notes = $notes;
        $this->date = $date;
        $this->status = $status;
        $this->markModified($actor, $at);

        return true;
    }

    public function reject(ParticipantRecord $actor, DateTimeImmutable $at): bool
    {
        if ($this->status === 'rejected') {
            return false;
        }
        $this->status = 'rejected';
        $this->markModified($actor, $at);

        return true;
    }

    public function recover(ParticipantRecord $actor, DateTimeImmutable $at): bool
    {
        if ($this->status !== 'rejected') {
            return false;
        }
        $this->status = 'provisional';
        $this->markModified($actor, $at);

        return true;
    }

    /** @return array<string, mixed> */
    public function toSummary(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'date' => $this->date?->format('Y-m-d'),
            'status' => $this->status,
            'lastModifiedAt' => $this->lastModifiedAt?->format(DATE_ATOM),
            'version' => $this->version,
        ];
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function team(): TeamRecord
    {
        return $this->team;
    }

    /** @return array<string, mixed> */
    public function toDetail(): array
    {
        return [
            ...$this->toSummary(),
            'notes' => $this->notes,
            'createdBy' => $this->createdBy->toListItem(),
            'createdAt' => $this->createdAt->format(DATE_ATOM),
            'lastModifiedBy' => $this->lastModifiedBy?->toListItem(),
        ];
    }

    private function markModified(ParticipantRecord $actor, DateTimeImmutable $at): void
    {
        $this->lastModifiedBy = $actor;
        $this->lastModifiedAt = $at;
        ++$this->version;
    }
}
