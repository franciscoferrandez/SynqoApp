import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

import { getEnvironment } from './config.js';

@Injectable()
export class DatabaseHealthService {
  async check(): Promise<void> {
    const client = new Client({ connectionString: getEnvironment().DATABASE_URL });

    try {
      await client.connect();
      await client.query('SELECT 1');
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
