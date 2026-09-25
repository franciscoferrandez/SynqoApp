import { defineConfig } from '@mikro-orm/postgresql';

import { getEnvironment } from './config.js';

const environment = getEnvironment();

export default defineConfig({
  clientUrl: environment.DATABASE_URL,
  discovery: {
    warnWhenNoEntities: false,
  },
  entities: [],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
});
