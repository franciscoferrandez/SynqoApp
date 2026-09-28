import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

import { DatabaseHealthService } from './database-health.service.js';
import { HealthController } from './health.controller.js';
import { createMikroOrmConfig } from './mikro-orm.config.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';
import { RequestProtectionService } from './request-protection.service.js';
import { ProblemDetailsFilter } from './problem-details.filter.js';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      useFactory: createMikroOrmConfig,
    }),
    TerminusModule,
    ThrottlerModule.forRoot([
      {
        limit: 120,
        ttl: 60_000,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization', 'req.headers.cookie', 'req.url'],
      },
    }),
  ],
  controllers: [HealthController, TeamsController],
  providers: [
    DatabaseHealthService,
    TeamsService,
    RequestProtectionService,
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
