import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:5500',
    trace: 'on-first-retry',
  },
  timeout: 30_000,
});