/**
 * Authentication Setup for E2E Tests
 * Handles login state persistence across tests
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    // Go to login page
    await page.goto(`${BASE_URL}/#/login`);

    // Fill login form
    await page.fill('input[type="email"]', 'admin@taccargo.com');
    await page.fill('input[type="password"]', 'admin123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Save authentication state
    await page.context().storageState({ path: authFile });
});
