import { defineConfig } from '@mikro-orm/postgresql';

import { getEnvironment } from './config.js';
import {
  AccessCredentialEntity,
  ParticipantEntity,
  ParticipantSessionEntity,
  QuickTeamEntity,
} from './entities/quick-team.entities.js';

export const createMikroOrmConfig = () =>
  defineConfig({
    clientUrl: getEnvironment().DATABASE_URL,
    entities: [
      QuickTeamEntity,
      ParticipantEntity,
      AccessCredentialEntity,
      ParticipantSessionEntity,
    ],
    migrations: {
      path: 'dist/migrations',
      pathTs: 'src/migrations',
    },
  });

export default createMikroOrmConfig();
