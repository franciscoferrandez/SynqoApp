<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'consultation_option')]
#[ORM\UniqueConstraint(name: 'consultation_option_position_unique', columns: ['consultation_id', 'position'])]
class ConsultationOptionRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\ManyToOne(targetEntity: ConsultationRecord::class, inversedBy: 'options')]
        #[ORM\JoinColumn(name: 'consultation_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ConsultationRecord $consultation,
        #[ORM\Column(name: 'option_text', length: 50)]
        private string $text,
        #[ORM\Column(type: Types::SMALLINT)]
        private int $position,
    ) {}

    public static function create(ConsultationRecord $consultation, string $text, int $position): self
    {
        return new self(Uuid::v7()->toRfc4122(), $consultation, $text, $position);
    }

    public function consultation(): ConsultationRecord
    {
        return $this->consultation;
    }

    /** @return array{id: string, text: string, position: int} */
    public function toItem(): array
    {
        return ['id' => $this->id, 'text' => $this->text, 'position' => $this->position];
    }
}
