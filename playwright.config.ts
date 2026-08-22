import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://localhost:3000', navigationTimeout: 45_000 },
  webServer: { command: 'npm run start', port: 3000, reuseExistingServer: true, timeout: 60_000 },
});
