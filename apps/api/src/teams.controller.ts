import { Body, Controller, Get, Headers, Param, Post, Res, Req } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { RequestProtectionService } from './request-protection.service.js';
import { TeamsService } from './teams.service.js';

type ContextRequest = { headers: Record<string, string | string[] | undefined> };
type CookieResponse = {
  cookie: (name: string, value: string, options: Record<string, string | boolean>) => void;
};
const cookie = (request: ContextRequest) =>
  (typeof request.headers.cookie === 'string' ? request.headers.cookie : undefined)
    ?.split('; ')
    .find((item: string) => item.startsWith('synqo_context_session='))
    ?.split('=')[1];
@Controller('api/v1/teams')
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly protection: RequestProtectionService,
  ) {}
  @Post('quick') async create(
    @Body() body: { teamName: string; timeZone: string; participantDisplayName: string },
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    this.protection.assertSafeMutation(headers);
    const result = await this.protection.replay(
      'quick-team',
      headers['idempotency-key'] as string | undefined,
      body,
      () => this.teams.createQuick(body),
    );
    response.cookie('synqo_context_session', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    response.cookie('synqo_csrf', randomBytes(16).toString('base64url'), {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return {
      team: result.team,
      participant: result.participant,
      redirectTo: `/teams/${result.team.teamRef}`,
    };
  }
  @Get(':teamRef') get(@Param('teamRef') teamRef: string) {
    return this.teams.getPublic(teamRef);
  }
  @Post(':teamRef/participants') async join(
    @Param('teamRef') teamRef: string,
    @Body() body: { displayName: string },
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    this.protection.assertSafeMutation(headers);
    const result = await this.protection.replay(
      `participant:${teamRef}`,
      headers['idempotency-key'] as string | undefined,
      body,
      () => this.teams.join(teamRef, body.displayName),
    );
    response.cookie('synqo_context_session', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return result.participant;
  }
  @Get(':teamRef/participants/me') me(
    @Param('teamRef') teamRef: string,
    @Req() req: ContextRequest,
  ) {
    return this.teams.current(teamRef, cookie(req)).then((r) => r.participant);
  }
  @Get(':teamRef/home') home(@Param('teamRef') teamRef: string, @Req() req: ContextRequest) {
    return this.teams.current(teamRef, cookie(req)).then((r) => ({
      team: r.team,
      currentActor: { kind: 'PARTICIPANT', participant: r.participant, isAdmin: false },
      pending: [],
    }));
  }
}
