<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261018120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add team events with lifecycle, authorship and concurrency version';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE team_event (id UUID NOT NULL, team_id UUID NOT NULL, created_by_participant_id UUID NOT NULL, last_modified_by_participant_id UUID DEFAULT NULL, title VARCHAR(250) NOT NULL, notes TEXT DEFAULT NULL, event_date DATE DEFAULT NULL, status VARCHAR(12) NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, last_modified_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, version INT NOT NULL DEFAULT 1, PRIMARY KEY(id), CONSTRAINT team_event_status_check CHECK (status IN ('provisional', 'definitive', 'rejected')), CONSTRAINT team_event_no_date_provisional_check CHECK (status = 'rejected' OR event_date IS NOT NULL OR status = 'provisional'))");
        $this->addSql('CREATE INDEX team_event_team_status_date_idx ON team_event (team_id, status, event_date)');
        $this->addSql('ALTER TABLE team_event ADD CONSTRAINT FK_TEAM_EVENT_TEAM FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_event ADD CONSTRAINT FK_TEAM_EVENT_CREATED_BY FOREIGN KEY (created_by_participant_id) REFERENCES participant (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_event ADD CONSTRAINT FK_TEAM_EVENT_MODIFIED_BY FOREIGN KEY (last_modified_by_participant_id) REFERENCES participant (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE team_event');
    }
}
