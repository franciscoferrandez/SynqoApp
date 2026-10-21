<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261021120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Record the participant and time of the last consultation edit';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation ADD last_modified_by_participant_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD last_modified_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_LAST_MODIFIED_BY FOREIGN KEY (last_modified_by_participant_id) REFERENCES participant (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX consultation_last_modified_by_idx ON consultation (last_modified_by_participant_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX consultation_last_modified_by_idx');
        $this->addSql('ALTER TABLE consultation DROP CONSTRAINT FK_CONSULTATION_LAST_MODIFIED_BY');
        $this->addSql('ALTER TABLE consultation DROP COLUMN last_modified_by_participant_id');
        $this->addSql('ALTER TABLE consultation DROP COLUMN last_modified_at');
    }
}
