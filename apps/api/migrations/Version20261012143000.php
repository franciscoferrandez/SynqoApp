<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261012143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Track current demo access-token generation on stable team roots';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE team ADD demo_access_generation INT NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE team DROP demo_access_generation');
    }
}
