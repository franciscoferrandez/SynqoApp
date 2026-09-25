import { describe, expect, it } from 'vitest';

import { getEnvironment } from './config.js';

describe('getEnvironment', () => {
  it('uses safe local defaults', () => {
    expect(getEnvironment({})).toMatchObject({
      DATABASE_URL: 'postgresql://synqo:synqo@localhost:5432/synqo',
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: 'http://localhost:5173',
    });
  });

  it('rejects an invalid port without revealing a database URL', () => {
    expect(() => getEnvironment({ PORT: '0' })).toThrow();
  });
});
