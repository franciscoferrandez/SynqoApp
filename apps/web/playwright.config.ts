import { defineConfig, devices } from '@playwright/test';

const webPort = process.env['WEB_TEST_PORT'] ?? '4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `exec node dev.mjs --host 0.0.0.0 --port ${webPort} --hmr=false --live-reload=false`,
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
