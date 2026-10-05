<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade voto vigente y resolución a consultas';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation ADD resolved_by_participant_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD resolved_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD CONSTRAINT FK_CONSULTATION_RESOLVER FOREIGN KEY (resolved_by_participant_id) REFERENCES participant (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_964685A62E143A29 ON consultation (resolved_by_participant_id)');
        $this->addSql('CREATE TABLE consultation_vote (id UUID NOT NULL, consultation_id UUID NOT NULL, participant_id UUID NOT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE consultation_vote ADD CONSTRAINT FK_CONSULTATION_VOTE_CONSULTATION FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultation_vote ADD CONSTRAINT FK_CONSULTATION_VOTE_PARTICIPANT FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX consultation_vote_participant_unique ON consultation_vote (consultation_id, participant_id)');
        $this->addSql('CREATE INDEX IDX_71D905AE9D1C3019 ON consultation_vote (participant_id)');
        $this->addSql('CREATE TABLE consultation_vote_selection (vote_id UUID NOT NULL, option_id UUID NOT NULL, PRIMARY KEY(vote_id, option_id))');
        $this->addSql('ALTER TABLE consultation_vote_selection ADD CONSTRAINT FK_VOTE_SELECTION_VOTE FOREIGN KEY (vote_id) REFERENCES consultation_vote (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultation_vote_selection ADD CONSTRAINT FK_VOTE_SELECTION_OPTION FOREIGN KEY (option_id) REFERENCES consultation_option (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_7572644FA7C41D6F ON consultation_vote_selection (option_id)');
        $this->addSql('CREATE TABLE consultation_resolution_option (consultation_id UUID NOT NULL, option_id UUID NOT NULL, PRIMARY KEY(consultation_id, option_id))');
        $this->addSql('ALTER TABLE consultation_resolution_option ADD CONSTRAINT FK_RESOLUTION_CONSULTATION FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE consultation_resolution_option ADD CONSTRAINT FK_RESOLUTION_OPTION FOREIGN KEY (option_id) REFERENCES consultation_option (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_EEFA7C01A7C41D6F ON consultation_resolution_option (option_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE consultation_resolution_option');
        $this->addSql('DROP TABLE consultation_vote_selection');
        $this->addSql('DROP TABLE consultation_vote');
        $this->addSql('ALTER TABLE consultation DROP CONSTRAINT FK_CONSULTATION_RESOLVER');
        $this->addSql('DROP INDEX IDX_964685A62E143A29');
        $this->addSql('ALTER TABLE consultation DROP resolved_by_participant_id');
        $this->addSql('ALTER TABLE consultation DROP resolved_at');
    }
}
