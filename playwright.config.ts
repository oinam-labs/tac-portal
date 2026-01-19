/**
 * Playwright E2E Test Configuration
 * Run: npx playwright test
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html'], ['list']],

    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        // Setup project for authentication
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // Main test projects
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFile,
            },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                storageState: authFile,
            },
            dependencies: ['setup'],
        },
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                storageState: authFile,
            },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
