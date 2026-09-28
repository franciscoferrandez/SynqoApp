import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { EntityManager } from '@mikro-orm/postgresql';

import {
  AccessCredentialEntity,
  ParticipantEntity,
  ParticipantSessionEntity,
  QuickTeamEntity,
} from './entities/quick-team.entities.js';

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
export class TeamsService {
  constructor(private readonly em: EntityManager) {}

  async createQuick(input: { teamName: string; timeZone: string; participantDisplayName: string }) {
    if (
      !input.teamName.trim() ||
      !input.participantDisplayName.trim() ||
      !IANA_TIME_ZONE(input.timeZone)
    )
      throw new BadRequestException({ code: 'VALIDATION_ERROR' });
    const teamId = randomUUID();
    const participantId = randomUUID();
    const teamRef = ref();
    const participantRef = ref();
    const token = ref();
    return this.em.transactional(async (em) => {
      const createdAt = new Date();
      const team = em.create(QuickTeamEntity, {
        id: teamId,
        publicRef: teamRef,
        name: input.teamName.trim(),
        mode: 'QUICK',
        timeZone: input.timeZone,
        quickState: 'ACTIVE',
        lastRelevantActivityAt: createdAt,
        createdAt,
      });
      const participant = em.create(ParticipantEntity, {
        id: participantId,
        team,
        publicRef: participantRef,
        displayName: input.participantDisplayName.trim(),
        isActive: true,
        createdAt,
      });
      em.persist([
        team,
        participant,
        em.create(AccessCredentialEntity, {
          id: randomUUID(),
          team,
          publicRef: teamRef,
          type: 'PUBLIC_LINK',
          scope: 'TEAM_PUBLIC',
          createdAt,
        }),
        em.create(ParticipantSessionEntity, {
          id: randomUUID(),
          team,
          participant,
          tokenHash: hash(token),
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
          createdAt,
        }),
      ]);
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
    });
  }

  async getPublic(teamRef: string): Promise<Team> {
    const team = await this.em.findOne(QuickTeamEntity, { publicRef: teamRef });
    if (!team) throw new NotFoundException({ code: 'TEAM_NOT_FOUND' });
    return {
      teamRef: team.publicRef,
      name: team.name,
      mode: 'QUICK',
      quickState: 'ACTIVE',
      timeZone: team.timeZone,
    };
  }
  async join(teamRef: string, displayName: string) {
    if (!displayName.trim()) throw new BadRequestException({ code: 'VALIDATION_ERROR' });
    return this.em.transactional(async (em) => {
      const team = await em.findOne(QuickTeamEntity, { publicRef: teamRef });
      if (!team) throw new NotFoundException({ code: 'TEAM_NOT_FOUND' });
      const participantRef = ref();
      const token = ref();
      const createdAt = new Date();
      const participant = em.create(ParticipantEntity, {
        id: randomUUID(),
        team,
        publicRef: participantRef,
        displayName: displayName.trim(),
        isActive: true,
        createdAt,
      });
      em.persist([
        participant,
        em.create(ParticipantSessionEntity, {
          id: randomUUID(),
          team,
          participant,
          tokenHash: hash(token),
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
          createdAt,
        }),
      ]);
      return {
        team: {
          teamRef: team.publicRef,
          name: team.name,
          mode: 'QUICK' as const,
          quickState: 'ACTIVE' as const,
          timeZone: team.timeZone,
        },
        participant: {
          participantRef,
          displayName: participant.displayName,
          isActive: true,
          linkedAccount: false as const,
        },
        token,
      };
    });
  }
  async current(teamRef: string, token?: string) {
    if (!token) throw new ForbiddenException({ code: 'CONTEXT_REQUIRED' });
    const session = await this.em.findOne(
      ParticipantSessionEntity,
      {
        tokenHash: hash(token),
        team: { publicRef: teamRef },
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { populate: ['participant', 'team'] },
    );
    if (!session) throw new ForbiddenException({ code: 'CONTEXT_INVALID' });
    return {
      team: {
        teamRef: session.team.publicRef,
        name: session.team.name,
        mode: 'QUICK' as const,
        quickState: 'ACTIVE' as const,
        timeZone: session.team.timeZone,
      },
      participant: {
        participantRef: session.participant.publicRef,
        displayName: session.participant.displayName,
        isActive: session.participant.isActive,
        linkedAccount: false as const,
      },
    };
  }
}
