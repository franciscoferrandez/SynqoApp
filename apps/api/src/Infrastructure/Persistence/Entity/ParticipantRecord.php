<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'participant')]
#[ORM\UniqueConstraint(name: 'participant_unique_team_name', columns: ['team_id', 'name_normalized'])]
class ParticipantRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\ManyToOne(targetEntity: TeamRecord::class)]
        #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private TeamRecord $team,
        #[ORM\Column(length: 50)]
        private string $name,
        #[ORM\Column(name: 'name_normalized', length: 100)]
        private string $nameNormalized,
        #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $createdAt,
    ) {}

    /** @return array{id: string, name: string} */
    public function toListItem(): array
    {
        return ['id' => $this->id, 'name' => $this->name];
    }

    public function team(): TeamRecord
    {
        return $this->team;
    }

    public function normalizedName(): string
    {
        return $this->nameNormalized;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
