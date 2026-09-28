import { Migration } from '@mikro-orm/migrations';

export class Migration20260928000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      "create table availability_entries (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, participant_id uuid not null references participants(id) on delete cascade, local_date date not null, status text not null check (status in ('AVAILABLE','MAYBE','UNAVAILABLE')), source_request_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(team_id, participant_id, local_date));",
    );
    this.addSql(
      'create index idx_availability_team_date on availability_entries (team_id, local_date);',
    );
    this.addSql(
      'create index idx_availability_participant_range on availability_entries (team_id, participant_id, local_date);',
    );
    this.addSql(
      'create index idx_availability_match_counts on availability_entries (team_id, local_date, status);',
    );
  }
}
