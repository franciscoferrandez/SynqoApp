import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { DatabaseHealthService } from './database-health.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      return await this.healthCheckService.check([
        async () => {
          await this.databaseHealthService.check();
          return { database: { status: 'up' } };
        },
      ]);
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database unavailable',
      });
    }
  }
}
