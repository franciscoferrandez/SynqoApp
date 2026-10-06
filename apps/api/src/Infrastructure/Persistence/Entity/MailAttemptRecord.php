<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'team_mail_attempt')]
#[ORM\UniqueConstraint(name: 'team_mail_attempt_receipt_unique', columns: ['receipt_verifier'])]
#[ORM\Index(name: 'team_mail_attempt_status_created', columns: ['status', 'created_at'])]
class MailAttemptRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\ManyToOne(targetEntity: TeamRecord::class)]
        #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private TeamRecord $team,
        #[ORM\Column(name: 'receipt_verifier', length: 64, options: ['fixed' => true])]
        private string $receiptVerifier,
        #[ORM\Column(length: 16)]
        private string $status,
        #[ORM\Column(type: Types::TEXT, nullable: true)]
        private ?string $payload,
        #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $createdAt,
        #[ORM\Column(name: 'expires_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $expiresAt,
        #[ORM\Column(name: 'started_at', type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
        private ?DateTimeImmutable $startedAt = null,
        #[ORM\Column(name: 'finished_at', type: Types::DATETIMETZ_IMMUTABLE, nullable: true)]
        private ?DateTimeImmutable $finishedAt = null,
    ) {}

    /** @return array{id: string, receipt_verifier: string, status: string, has_payload: bool, created_at: string, expires_at: string, started_at: string|null, finished_at: string|null} */
    public function toRow(): array
    {
        return [
            'id' => $this->id,
            'receipt_verifier' => $this->receiptVerifier,
            'status' => $this->status,
            'has_payload' => $this->payload !== null,
            'created_at' => $this->createdAt->format('Y-m-d H:i:sP'),
            'expires_at' => $this->expiresAt->format('Y-m-d H:i:sP'),
            'started_at' => $this->startedAt?->format('Y-m-d H:i:sP'),
            'finished_at' => $this->finishedAt?->format('Y-m-d H:i:sP'),
        ];
    }

    public function team(): TeamRecord
    {
        return $this->team;
    }
}
