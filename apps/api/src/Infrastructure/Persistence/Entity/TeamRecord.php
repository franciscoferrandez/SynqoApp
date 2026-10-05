<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'team')]
class TeamRecord
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: Types::GUID)]
        private string $id,
        #[ORM\Column(length: 50)]
        private string $name,
        #[ORM\Column(name: 'access_verifier', length: 64, options: ['fixed' => true])]
        private string $accessVerifier,
        #[ORM\Column(name: 'time_zone', length: 64)]
        private string $timeZone,
        #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $createdAt,
        #[ORM\Column(name: 'last_activity_at', type: Types::DATETIMETZ_IMMUTABLE)]
        private DateTimeImmutable $lastActivityAt,
    ) {}

    public function setLastActivityAt(DateTimeImmutable $lastActivityAt): void
    {
        $this->lastActivityAt = $lastActivityAt;
    }

    /** @return array{id: string, name: string, access_verifier: string, time_zone: string, created_at: string, last_activity_at: string} */
    public function toRow(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'access_verifier' => $this->accessVerifier,
            'time_zone' => $this->timeZone,
            'created_at' => $this->createdAt->format('Y-m-d H:i:sP'),
            'last_activity_at' => $this->lastActivityAt->format('Y-m-d H:i:sP'),
        ];
    }
}
