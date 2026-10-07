<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Entity;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'team_creation_origin_event')]
#[ORM\Index(name: 'team_creation_origin_lookup_idx', columns: ['signal_type', 'signal_digest', 'created_at'])]
class CreationOriginEventRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::BIGINT)]
    // Doctrine assigns and reads the generated identifier through reflection.
    // @phpstan-ignore property.unusedType, property.onlyWritten
    private ?string $id = null;

    #[ORM\Column(name: 'signal_type', length: 8)]
    // Signal values are persisted through DBAL; Doctrine maps the table schema.
    // @phpstan-ignore property.unused
    private string $signalType;

    #[ORM\Column(name: 'signal_digest', length: 64, options: ['fixed' => true])]
    // Signal values are persisted through DBAL; Doctrine maps the table schema.
    // @phpstan-ignore property.unused
    private string $signalDigest;

    #[ORM\Column(name: 'created_at', type: Types::DATETIMETZ_IMMUTABLE)]
    // Signal values are persisted through DBAL; Doctrine maps the table schema.
    // @phpstan-ignore property.unused
    private DateTimeImmutable $createdAt;
}
