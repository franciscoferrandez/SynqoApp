<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Consultas abiertas con opciones de texto';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE consultation (id UUID NOT NULL, team_id UUID NOT NULL, created_by_participant_id UUID NOT NULL, type VARCHAR(8) NOT NULL, title VARCHAR(250) NOT NULL, state VARCHAR(10) NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, PRIMARY KEY(id))");
        $this->addSql('CREATE INDEX consultation_team_created_idx ON consultation (team_id, created_at)');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_TEAM FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_CREATOR FOREIGN KEY (created_by_participant_id) REFERENCES participant (id) ON DELETE CASCADE');
        $this->addSql('CREATE TABLE consultation_option (id UUID NOT NULL, consultation_id UUID NOT NULL, option_text VARCHAR(50) NOT NULL, position SMALLINT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX consultation_option_position_unique ON consultation_option (consultation_id, position)');
        $this->addSql('ALTER TABLE consultation_option ADD CONSTRAINT FK_CONSULTATION_OPTION_QUERY FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE consultation_option');
        $this->addSql('DROP TABLE consultation');
    }
}
