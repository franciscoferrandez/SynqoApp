import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'teams' })
export class QuickTeamEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'id' })
  id!: string;

  @Property({ type: 'string', fieldName: 'public_ref', unique: true })
  publicRef!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string' })
  mode!: 'QUICK';

  @Property({ type: 'string', fieldName: 'time_zone' })
  timeZone!: string;

  @Property({ type: 'string', fieldName: 'quick_state' })
  quickState!: 'ACTIVE';

  @Property({ type: 'Date', fieldName: 'last_relevant_activity_at' })
  lastRelevantActivityAt!: Date;

  @Property({ type: 'Date', fieldName: 'created_at' })
  createdAt!: Date;
}

@Entity({ tableName: 'participants' })
export class ParticipantEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'id' })
  id!: string;

  @ManyToOne(() => QuickTeamEntity, { fieldName: 'team_id', deleteRule: 'cascade' })
  team!: QuickTeamEntity;

  @Property({ type: 'string', fieldName: 'public_ref' })
  publicRef!: string;

  @Property({ type: 'string', fieldName: 'display_name' })
  displayName!: string;

  @Property({ type: 'boolean', fieldName: 'is_active' })
  isActive!: boolean;

  @Property({ type: 'Date', fieldName: 'created_at' })
  createdAt!: Date;
}

@Entity({ tableName: 'access_credentials' })
export class AccessCredentialEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'id' })
  id!: string;

  @ManyToOne(() => QuickTeamEntity, { fieldName: 'team_id', deleteRule: 'cascade' })
  team!: QuickTeamEntity;

  @Property({ type: 'string', fieldName: 'public_ref', unique: true })
  publicRef!: string;

  @Property({ type: 'string' })
  type!: 'PUBLIC_LINK';

  @Property({ type: 'string' })
  scope!: 'TEAM_PUBLIC';

  @Property({ type: 'Date', fieldName: 'revoked_at', nullable: true })
  revokedAt?: Date;

  @Property({ type: 'Date', fieldName: 'created_at' })
  createdAt!: Date;
}

@Entity({ tableName: 'participant_sessions' })
export class ParticipantSessionEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'id' })
  id!: string;

  @ManyToOne(() => QuickTeamEntity, { fieldName: 'team_id', deleteRule: 'cascade' })
  team!: QuickTeamEntity;

  @ManyToOne(() => ParticipantEntity, { fieldName: 'participant_id', deleteRule: 'cascade' })
  participant!: ParticipantEntity;

  @Property({ type: 'string', fieldName: 'token_hash', unique: true })
  tokenHash!: string;

  @Property({ type: 'Date', fieldName: 'expires_at' })
  expiresAt!: Date;

  @Property({ type: 'Date', fieldName: 'revoked_at', nullable: true })
  revokedAt?: Date;

  @Property({ type: 'Date', fieldName: 'created_at' })
  createdAt!: Date;
}

@Entity({ tableName: 'availability_entries' })
export class AvailabilityEntryEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'id' })
  id!: string;

  @ManyToOne(() => QuickTeamEntity, { fieldName: 'team_id', deleteRule: 'cascade' })
  team!: QuickTeamEntity;

  @ManyToOne(() => ParticipantEntity, { fieldName: 'participant_id', deleteRule: 'cascade' })
  participant!: ParticipantEntity;

  @Property({ type: 'date', fieldName: 'local_date' })
  localDate!: string;

  @Property({ type: 'string' })
  status!: 'AVAILABLE' | 'MAYBE' | 'UNAVAILABLE';

  @Property({ type: 'uuid', fieldName: 'source_request_id', nullable: true })
  sourceRequestId?: string;

  @Property({ type: 'Date', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'Date', fieldName: 'updated_at' })
  updatedAt!: Date;
}
