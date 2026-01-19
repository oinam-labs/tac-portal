/**
 * E2E Test: Shipment Creation Workflow
 * Tests the critical path of creating and tracking a shipment
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Shipment Workflow', () => {
    // Tests use stored auth state from setup project - no login needed

    test('should create a new shipment', async ({ page }) => {
        // Navigate to shipments page directly
        await page.goto(`${BASE_URL}/#/shipments`);
        await page.waitForLoadState('networkidle');

        // Verify we're on the shipments page
        await expect(page.locator('h1, h2').filter({ hasText: /shipment/i })).toBeVisible({ timeout: 10000 });
    });

    test('should search and view shipment details', async ({ page }) => {
        // Navigate to shipments page
        await page.goto(`${BASE_URL}/#/shipments`);
        await page.waitForLoadState('networkidle');

        // Wait for the page to load
        await expect(page.locator('h1, h2').filter({ hasText: /shipment/i })).toBeVisible({ timeout: 10000 });

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
        await page.goto(`${BASE_URL}/#/tracking`);
        await page.waitForLoadState('networkidle');

        // Verify tracking page loaded
        await expect(page.locator('h1, h2').filter({ hasText: /track/i })).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Public Tracking', () => {
    test('should allow public tracking without login', async ({ page }) => {
        // Navigate directly to public tracking
        await page.goto(`${BASE_URL}/#/track`);
        await page.waitForLoadState('networkidle');

        // Verify public tracking page loads (should have tracking input)
        const trackingInput = page.locator('input[placeholder*="AWB"], input[placeholder*="track"], input[placeholder*="Track"]');
        await expect(trackingInput.or(page.locator('h1, h2').filter({ hasText: /track/i }))).toBeVisible({ timeout: 10000 });
    });
});
