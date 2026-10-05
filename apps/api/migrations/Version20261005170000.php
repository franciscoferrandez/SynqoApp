<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Permite opciones de consulta tipadas como texto o fecha';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation_option ALTER option_text DROP NOT NULL');
        $this->addSql('ALTER TABLE consultation_option ADD option_date DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation_option ADD CONSTRAINT consultation_option_exactly_one_value CHECK ((option_text IS NOT NULL AND option_date IS NULL) OR (option_text IS NULL AND option_date IS NOT NULL))');
        $this->addSql('CREATE UNIQUE INDEX consultation_option_date_unique ON consultation_option (consultation_id, option_date) WHERE (option_date IS NOT NULL)');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf((int) $this->connection->fetchOne('SELECT COUNT(*) FROM consultation_option WHERE option_date IS NOT NULL') > 0, 'Cannot roll back typed options while date options exist.');
        $this->addSql('DROP INDEX consultation_option_date_unique');
        $this->addSql('ALTER TABLE consultation_option DROP CONSTRAINT consultation_option_exactly_one_value');
        $this->addSql('ALTER TABLE consultation_option DROP option_date');
        $this->addSql('ALTER TABLE consultation_option ALTER option_text SET NOT NULL');
    }
}
