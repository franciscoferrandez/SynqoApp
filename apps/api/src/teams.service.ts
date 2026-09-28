import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleDestroy,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';

import { getEnvironment } from './config.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const IANA_TIME_ZONE = (value: string) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
const ref = () => randomBytes(12).toString('base64url');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export type Team = {
  teamRef: string;
  name: string;
  mode: 'QUICK';
  quickState: 'ACTIVE';
  timeZone: string;
};
export type Participant = {
  participantRef: string;
  displayName: string;
  isActive: boolean;
  linkedAccount: false;
};

@Injectable()
export class TeamsService implements OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: getEnvironment().DATABASE_URL });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async createQuick(input: { teamName: string; timeZone: string; participantDisplayName: string }) {
    if (
      !input.teamName.trim() ||
      !input.participantDisplayName.trim() ||
      !IANA_TIME_ZONE(input.timeZone)
    )
      throw new BadRequestException({ code: 'VALIDATION_ERROR' });
    const client = await this.pool.connect();
    const teamId = randomUUID();
    const participantId = randomUUID();
    const teamRef = ref();
    const participantRef = ref();
    const token = ref();
    try {
      await client.query('begin');
      await client.query(
        "insert into teams (id, public_ref, name, mode, time_zone, quick_state, last_relevant_activity_at) values ($1,$2,$3,'QUICK',$4,'ACTIVE',now())",
        [teamId, teamRef, input.teamName.trim(), input.timeZone],
      );
      await client.query(
        'insert into participants (id, team_id, public_ref, display_name) values ($1,$2,$3,$4)',
        [participantId, teamId, participantRef, input.participantDisplayName.trim()],
      );
      await client.query(
        "insert into access_credentials (id, team_id, public_ref, type, scope) values ($1,$2,$3,'PUBLIC_LINK','TEAM_PUBLIC')",
        [randomUUID(), teamId, teamRef],
      );
      await client.query(
        'insert into participant_sessions (id, team_id, participant_id, token_hash, expires_at) values ($1,$2,$3,$4,$5)',
        [randomUUID(), teamId, participantId, hash(token), new Date(Date.now() + SESSION_TTL_MS)],
      );
      await client.query('commit');
      return {
        team: {
          teamRef,
          name: input.teamName.trim(),
          mode: 'QUICK' as const,
          quickState: 'ACTIVE' as const,
          timeZone: input.timeZone,
        },
        participant: {
          participantRef,
          displayName: input.participantDisplayName.trim(),
          isActive: true,
          linkedAccount: false as const,
        },
        token,
      };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPublic(teamRef: string): Promise<Team> {
    const result = await this.pool.query(
      'select public_ref, name, time_zone from teams where public_ref=$1',
      [teamRef],
    );
    if (!result.rowCount) throw new NotFoundException({ code: 'TEAM_NOT_FOUND' });
    const r = result.rows[0];
    return {
      teamRef: r.public_ref,
      name: r.name,
      mode: 'QUICK',
      quickState: 'ACTIVE',
      timeZone: r.time_zone,
    };
  }
  async join(teamRef: string, displayName: string) {
    const team = await this.getPublic(teamRef);
    if (!displayName.trim()) throw new BadRequestException({ code: 'VALIDATION_ERROR' });
    const teamRow = await this.pool.query('select id from teams where public_ref=$1', [teamRef]);
    const participantId = randomUUID();
    const participantRef = ref();
    const token = ref();
    await this.pool.query(
      'insert into participants (id, team_id, public_ref, display_name) values ($1,$2,$3,$4)',
      [participantId, teamRow.rows[0].id, participantRef, displayName.trim()],
    );
    await this.pool.query(
      'insert into participant_sessions (id, team_id, participant_id, token_hash, expires_at) values ($1,$2,$3,$4,$5)',
      [
        randomUUID(),
        teamRow.rows[0].id,
        participantId,
        hash(token),
        new Date(Date.now() + SESSION_TTL_MS),
      ],
    );
    return {
      team,
      participant: {
        participantRef,
        displayName: displayName.trim(),
        isActive: true,
        linkedAccount: false as const,
      },
      token,
    };
  }
  async current(teamRef: string, token?: string) {
    if (!token) throw new ForbiddenException({ code: 'CONTEXT_REQUIRED' });
    const result = await this.pool.query(
      `select p.public_ref,p.display_name,p.is_active,t.public_ref as team_ref,t.name,t.time_zone from participant_sessions s join participants p on p.id=s.participant_id join teams t on t.id=s.team_id where s.token_hash=$1 and t.public_ref=$2 and s.revoked_at is null and s.expires_at>now()`,
      [hash(token), teamRef],
    );
    if (!result.rowCount) throw new ForbiddenException({ code: 'CONTEXT_INVALID' });
    const r = result.rows[0];
    return {
      team: {
        teamRef: r.team_ref,
        name: r.name,
        mode: 'QUICK' as const,
        quickState: 'ACTIVE' as const,
        timeZone: r.time_zone,
      },
      participant: {
        participantRef: r.public_ref,
        displayName: r.display_name,
        isActive: r.is_active,
        linkedAccount: false as const,
      },
    };
  }
}
