<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261018130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add optional event links to consultations';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation ADD event_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_EVENT FOREIGN KEY (event_id) REFERENCES team_event (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE consultation ADD open_event_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_OPEN_EVENT FOREIGN KEY (open_event_id) REFERENCES team_event (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_964685A671F7E88B ON consultation (event_id)');
        $this->addSql('CREATE UNIQUE INDEX consultation_open_event_unique ON consultation (open_event_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX consultation_open_event_unique');
        $this->addSql('DROP INDEX IDX_964685A671F7E88B');
        $this->addSql('ALTER TABLE consultation DROP CONSTRAINT FK_CONSULTATION_OPEN_EVENT');
        $this->addSql('ALTER TABLE consultation DROP COLUMN open_event_id');
        $this->addSql('ALTER TABLE consultation DROP CONSTRAINT FK_CONSULTATION_EVENT');
        $this->addSql('ALTER TABLE consultation DROP COLUMN event_id');
    }
}
