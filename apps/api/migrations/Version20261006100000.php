<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261006100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade el evento transitorio de envío del enlace por correo';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE team_mail_attempt (id UUID NOT NULL, team_id UUID NOT NULL, receipt_verifier CHAR(64) NOT NULL, status VARCHAR(16) NOT NULL, payload TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, expires_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, started_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, finished_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX team_mail_attempt_receipt_unique ON team_mail_attempt (receipt_verifier)');
        $this->addSql('CREATE INDEX team_mail_attempt_status_created ON team_mail_attempt (status, created_at)');
        $this->addSql('CREATE INDEX IDX_CAD78ECB296CD8AE ON team_mail_attempt (team_id)');
        $this->addSql("ALTER TABLE team_mail_attempt ADD CONSTRAINT team_mail_attempt_status_valid CHECK (status IN ('pending', 'started', 'succeeded', 'failed'))");
        $this->addSql("ALTER TABLE team_mail_attempt ADD CONSTRAINT team_mail_attempt_payload_only_while_open CHECK (payload IS NULL OR status IN ('pending', 'started'))");
        $this->addSql('ALTER TABLE team_mail_attempt ADD CONSTRAINT FK_TEAM_MAIL_ATTEMPT_TEAM FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE team_mail_attempt');
    }
}
