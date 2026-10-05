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

    /** @var Collection<int, ConsultationOptionRecord> */
    #[ORM\ManyToMany(targetEntity: ConsultationOptionRecord::class)]
    #[ORM\JoinTable(name: 'consultation_resolution_option')]
    #[ORM\JoinColumn(name: 'consultation_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    #[ORM\InverseJoinColumn(name: 'option_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private Collection $acceptedOptions;

    #[ORM\ManyToOne(targetEntity: ParticipantRecord::class)]
    #[ORM\JoinColumn(name: 'resolved_by_participant_id', referencedColumnName: 'id', nullable: true, onDelete: 'CASCADE')]
    private ?ParticipantRecord $resolvedBy = null;

    #[ORM\Column(name: 'resolved_at', type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $resolvedAt = null;

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
        $this->acceptedOptions = new ArrayCollection();
    }

    public function addOption(ConsultationOptionRecord $option): void
    {
        $this->options->add($option);
    }

    public function team(): TeamRecord
    {
        return $this->team;
    }

    public function state(): string
    {
        return $this->state;
    }

    /** @param list<string> $optionIds */
    public function resolutionMatches(string $state, ParticipantRecord $participant, array $optionIds): bool
    {
        $current = array_map(static fn(ConsultationOptionRecord $option): string => $option->toItem()['id'], $this->acceptedOptions->toArray());
        sort($current);
        sort($optionIds);

        return $this->state === $state && $this->resolvedBy === $participant && $current === $optionIds;
    }

    /** @param list<ConsultationOptionRecord> $acceptedOptions */
    public function resolve(string $state, ParticipantRecord $participant, DateTimeImmutable $at, array $acceptedOptions): void
    {
        $this->state = $state;
        $this->resolvedBy = $participant;
        $this->resolvedAt = $at;
        foreach ($acceptedOptions as $option) {
            $this->acceptedOptions->add($option);
        }
    }

    /** @return Collection<int, ConsultationOptionRecord> */
    public function options(): Collection
    {
        return $this->options;
    }

    /** @return array<string, mixed> */
    public function toItem(): array
    {
        $options = array_map(static fn(ConsultationOptionRecord $option): array => $option->toItem(), $this->options->toArray());

        $item = [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'state' => $this->state,
            'createdAt' => $this->createdAt->format(DATE_ATOM),
            'createdBy' => $this->createdBy->toListItem(),
            'options' => $options,
        ];
        if ($this->resolvedBy !== null) {
            $item['resolution'] = [
                'participant' => $this->resolvedBy->toListItem(),
                'resolvedAt' => $this->resolvedAt?->format(DATE_ATOM),
                'acceptedOptionIds' => array_map(static fn(ConsultationOptionRecord $option): string => $option->toItem()['id'], $this->acceptedOptions->toArray()),
            ];
        }

        return $item;
    }
}
