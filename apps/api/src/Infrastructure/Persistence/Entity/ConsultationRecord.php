<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'consultation')]
#[ORM\Index(name: 'consultation_team_created_idx', columns: ['team_id', 'created_at'])]
class ConsultationRecord
{
    /** @var Collection<int, ConsultationOptionRecord> */
    #[ORM\OneToMany(mappedBy: 'consultation', targetEntity: ConsultationOptionRecord::class, cascade: ['persist'])]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $options;

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
        #[ORM\Column(length: 8)]
        private string $type,
        #[ORM\Column(length: 250)]
        private string $title,
        #[ORM\Column(length: 10)]
        private string $state,
        #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $createdAt,
    ) {
        $this->options = new ArrayCollection();
    }

    public function addOption(ConsultationOptionRecord $option): void
    {
        $this->options->add($option);
    }

    public function team(): TeamRecord
    {
        return $this->team;
    }

    /** @return array<string, mixed> */
    public function toItem(): array
    {
        $options = array_map(static fn(ConsultationOptionRecord $option): array => $option->toItem(), $this->options->toArray());

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'state' => $this->state,
            'createdAt' => $this->createdAt->format(DATE_ATOM),
            'createdBy' => $this->createdBy->toListItem(),
            'options' => $options,
        ];
    }
}
