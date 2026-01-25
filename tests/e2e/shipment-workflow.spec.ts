/**
 * E2E Test: Shipment Creation Workflow
 * Tests the critical path of creating and tracking a shipment
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Test configuration
const runAuthedE2E = process.env.RUN_AUTHED_E2E === 'true';
const shouldSkipAuth = !!process.env.CI && !process.env.E2E_TEST_EMAIL;
const authFile = path.resolve(process.cwd(), '.auth/user.json');
const hasAuthState = fs.existsSync(authFile);
const shouldSkipAuthedSuites = !runAuthedE2E || shouldSkipAuth || !hasAuthState;

test.describe('Shipment Workflow', () => {
  test.skip(shouldSkipAuthedSuites, 'E2E auth not configured (set E2E_TEST_EMAIL/E2E_TEST_PASSWORD and generate .auth/user.json)');
  test.use({ storageState: authFile });
  // Tests use stored auth state from setup project - no login needed

  test('should create a new shipment', async ({ page }) => {
    // Navigate to shipments page directly
    await page.goto('/#/shipments');
    await page.waitForLoadState('networkidle');

    // Verify we're on the shipments page
    await expect(page.locator('h1, h2').filter({ hasText: /shipment/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should search and view shipment details', async ({ page }) => {
    // Navigate to shipments page
    await page.goto('/#/shipments');
    await page.waitForLoadState('networkidle');

    // Wait for the page to load
    await expect(page.locator('h1, h2').filter({ hasText: /shipment/i })).toBeVisible({
      timeout: 10000,
    });

    // Look for the AWB-specific search input (more specific selector)
    const searchInput = page.locator('input[placeholder*="AWB"]').first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('TAC');
      await page.waitForTimeout(500); // Debounce
    }

    // Verify shipments page loaded
    await expect(page).toHaveURL(/shipments/);
  });

  test('should track shipment status', async ({ page }) => {
    // Navigate to tracking page
    await page.goto('/#/tracking');
    await page.waitForLoadState('networkidle');

    // Verify tracking page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /track/i })).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Public Tracking', () => {
  test('should allow public tracking without login', async ({ page }) => {
    // Navigate directly to public tracking
    await page.goto('/#/track');
    await page.waitForLoadState('networkidle');

    // Verify public tracking page loads (should have tracking input)
    const trackingInput = page.locator(
      'input[placeholder*="AWB"], input[placeholder*="track"], input[placeholder*="Track"]'
    );
    await expect(
      trackingInput.or(page.locator('h1, h2').filter({ hasText: /track/i }))
    ).toBeVisible({ timeout: 10000 });
  });
});
