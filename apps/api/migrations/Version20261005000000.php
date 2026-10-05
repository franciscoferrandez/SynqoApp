<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create persisted teams and participants';
    }
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE team (id UUID NOT NULL, name VARCHAR(50) NOT NULL, access_verifier CHAR(64) NOT NULL, time_zone VARCHAR(64) NOT NULL, created_at TIMESTAMPTZ NOT NULL, last_activity_at TIMESTAMPTZ NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE participant (id UUID NOT NULL, team_id UUID NOT NULL, name VARCHAR(50) NOT NULL, name_normalized VARCHAR(100) NOT NULL, created_at TIMESTAMPTZ NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX participant_unique_team_name ON participant (team_id, name_normalized)');
        $this->addSql('ALTER TABLE participant ADD CONSTRAINT FK_PARTICIPANT_TEAM FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE participant');
        $this->addSql('DROP TABLE team');
    }
}
