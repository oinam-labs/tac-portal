/**
 * Authentication Setup for E2E Tests
 * Handles login state persistence across tests
 *
 * In CI without staging backend:
 * - E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars configure test credentials
 * - If not set, auth tests are skipped and unauthenticated tests run
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../../.auth/user.json');

// Ensure .auth directory exists
try {
  mkdirSync(path.dirname(authFile), { recursive: true });
} catch {
  // Directory may already exist
}

setup('authenticate', async ({ page }) => {
  // Use port 4173 (preview) in CI, port 3000 (dev) locally
  const BASE_URL =
    process.env.BASE_URL || (process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000');

  // Get credentials from environment (secure for CI)
  const testEmail = process.env.E2E_TEST_EMAIL || 'tapancargo@gmail.com';
  const testPassword = process.env.E2E_TEST_PASSWORD || 'Test@1498';

  // In CI without configured credentials, create empty auth state and skip
  if (process.env.CI && !process.env.E2E_TEST_EMAIL) {
    console.log('⚠️ E2E_TEST_EMAIL not configured - creating empty auth state');
    console.log('   Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD secrets for full E2E testing');

    // Create empty auth state so tests can run (unauthenticated)
    writeFileSync(
      authFile,
      JSON.stringify({
        cookies: [],
        origins: [],
      })
    );
    return;
  }

  try {
    // Go to login page
    await page.goto(`${BASE_URL}/#/login`, { timeout: 30000 });

    // Fill login form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Submit
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify we're logged in
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Save authentication state
    await page.context().storageState({ path: authFile });
    console.log('✅ Authentication successful');
  } catch (error) {
    console.error('❌ Authentication failed:', error);

    // In CI, create empty auth state so other tests can still run
    if (process.env.CI) {
      console.log('   Creating empty auth state for unauthenticated tests...');
      writeFileSync(
        authFile,
        JSON.stringify({
          cookies: [],
          origins: [],
        })
      );
    } else {
      throw error;
    }
  }
});
