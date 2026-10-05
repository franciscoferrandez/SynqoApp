<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Disponibilidad diaria vigente del equipo';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE availability (id UUID NOT NULL, team_id UUID NOT NULL, participant_id UUID NOT NULL, date DATE NOT NULL, state VARCHAR(11) NOT NULL, PRIMARY KEY(id))");
        $this->addSql('CREATE UNIQUE INDEX availability_unique_day ON availability (team_id, participant_id, date)');
        $this->addSql('CREATE INDEX IDX_3FB7A2BF296CD8AE ON availability (team_id)');
        $this->addSql('CREATE INDEX IDX_3FB7A2BF9D1C3019 ON availability (participant_id)');
        $this->addSql('ALTER TABLE availability ADD CONSTRAINT FK_AVAILABILITY_TEAM FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE availability ADD CONSTRAINT FK_AVAILABILITY_PARTICIPANT FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE availability');
    }
}
