<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'consultation_vote')]
#[ORM\UniqueConstraint(name: 'consultation_vote_participant_unique', columns: ['consultation_id', 'participant_id'])]
class ConsultationVoteRecord
{
    /** @var Collection<int, ConsultationOptionRecord> */
    #[ORM\ManyToMany(targetEntity: ConsultationOptionRecord::class)]
    #[ORM\JoinTable(name: 'consultation_vote_selection')]
    #[ORM\JoinColumn(name: 'vote_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    #[ORM\InverseJoinColumn(name: 'option_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private Collection $options;

    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: 'guid')]
        private string $id,
        #[ORM\ManyToOne(targetEntity: ConsultationRecord::class)]
        #[ORM\JoinColumn(name: 'consultation_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ConsultationRecord $consultation,
        #[ORM\ManyToOne(targetEntity: ParticipantRecord::class)]
        #[ORM\JoinColumn(name: 'participant_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ParticipantRecord $participant,
    ) {
        $this->options = new ArrayCollection();
    }

    public function participant(): ParticipantRecord
    {
        return $this->participant;
    }

    public function consultation(): ConsultationRecord
    {
        return $this->consultation;
    }

    public function id(): string
    {
        return $this->id;
    }

    public function hasOption(ConsultationOptionRecord $option): bool
    {
        return $this->options->contains($option);
    }

    public function setOption(ConsultationOptionRecord $option, bool $selected): void
    {
        if ($selected && !$this->options->contains($option)) {
            $this->options->add($option);
        } elseif (!$selected) {
            $this->options->removeElement($option);
        }
    }

    public function isEmpty(): bool
    {
        return $this->options->isEmpty();
    }

    /** @return Collection<int, ConsultationOptionRecord> */
    public function options(): Collection
    {
        return $this->options;
    }
}
