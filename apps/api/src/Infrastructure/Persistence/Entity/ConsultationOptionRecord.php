<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'consultation_option')]
#[ORM\UniqueConstraint(name: 'consultation_option_position_unique', columns: ['consultation_id', 'position'])]
#[ORM\UniqueConstraint(name: 'consultation_option_date_unique', columns: ['consultation_id', 'option_date'], options: ['where' => '(option_date IS NOT NULL)'])]
class ConsultationOptionRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\ManyToOne(targetEntity: ConsultationRecord::class, inversedBy: 'options')]
        #[ORM\JoinColumn(name: 'consultation_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private ConsultationRecord $consultation,
        #[ORM\Column(name: 'option_text', length: 50, nullable: true)]
        private ?string $text,
        #[ORM\Column(name: 'option_date', type: Types::DATE_IMMUTABLE, nullable: true)]
        private ?DateTimeImmutable $date,
        #[ORM\Column(type: Types::SMALLINT)]
        private int $position,
    ) {}

    public static function create(ConsultationRecord $consultation, string $text, int $position): self
    {
        return new self(Uuid::v7()->toRfc4122(), $consultation, $text, null, $position);
    }

    public static function createDate(ConsultationRecord $consultation, DateTimeImmutable $date, int $position): self
    {
        return new self(Uuid::v7()->toRfc4122(), $consultation, null, $date, $position);
    }

    public function consultation(): ConsultationRecord
    {
        return $this->consultation;
    }

    /** @return array{id: string, text?: string, date?: string, position: int} */
    public function toItem(): array
    {
        if ($this->date !== null) {
            return ['id' => $this->id, 'date' => $this->date->format('Y-m-d'), 'position' => $this->position];
        }

        if ($this->text === null) {
            throw new \LogicException('A consultation option must contain either text or a date.');
        }

        return ['id' => $this->id, 'text' => $this->text, 'position' => $this->position];
    }
}
