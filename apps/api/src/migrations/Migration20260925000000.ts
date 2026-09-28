import { Migration } from '@mikro-orm/migrations';

export class Migration20260925000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table teams (id uuid primary key, public_ref text not null unique, name text not null, mode text not null check (mode = 'QUICK'), time_zone text not null, quick_state text not null check (quick_state = 'ACTIVE'), last_relevant_activity_at timestamptz not null, created_at timestamptz not null default now());`,
    );
    this.addSql(
      `create table participants (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, public_ref text not null, display_name text not null, is_active boolean not null default true, created_at timestamptz not null default now(), unique(team_id, public_ref));`,
    );
    this.addSql(
      `create table participant_sessions (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, participant_id uuid not null references participants(id) on delete cascade, token_hash text not null unique, expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now());`,
    );
    this.addSql(
      `create table access_credentials (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, public_ref text not null unique, type text not null check (type = 'PUBLIC_LINK'), scope text not null check (scope = 'TEAM_PUBLIC'), revoked_at timestamptz, created_at timestamptz not null default now());`,
    );
  }
}
