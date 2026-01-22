/**
 * Authentication Setup for E2E Tests
 * Handles login state persistence across tests
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  // Go to login page
  await page.goto(`${BASE_URL}/#/login`);

  // Fill login form
  await page.fill('input[type="email"]', 'tapancargo@gmail.com');
  await page.fill('input[type="password"]', 'Test@1498');

  // Submit
  await page.click('button:has-text("Sign In")');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Verify we're logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
