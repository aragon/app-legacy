import {defineConfig, devices} from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },

    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },

    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {...devices['Pixel 5']},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },
    {
      name: 'Mobile Safari',
      use: {...devices['iPhone 12']},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {...devices['Desktop Edge'], channel: 'msedge'},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },
    {
      name: 'Google Chrome',
      use: {...devices['Desktop Chrome'], channel: 'chrome'},
      timeout: 120000, // Set a timeout of 120 seconds for each test in this project
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
