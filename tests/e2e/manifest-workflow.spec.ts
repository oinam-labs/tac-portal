/**
 * E2E Test: Manifest Workflow
 * Tests manifest creation, scanning, and closure
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER = {
    email: 'admin@taccargo.com',
    password: 'admin123',
};

test.describe('Manifest Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/#/login`);
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test('should create a new manifest', async ({ page }) => {
        // Navigate to manifests
        await page.click('text=Manifests');
        await page.waitForURL('**/manifests');

        // Click create button
        await page.click('button:has-text("Create Manifest")');

        // Fill manifest form
        await page.selectOption('select[name="fromHub"]', 'IMPHAL');
        await page.selectOption('select[name="toHub"]', 'NEW_DELHI');
        await page.selectOption('select[name="mode"]', 'AIR');
        await page.fill('input[name="vehicleNumber"]', 'DL01AB1234');

        // Submit
        await page.click('button:has-text("Create")');

        // Verify success
        await expect(page.locator('text=Manifest created')).toBeVisible({ timeout: 5000 });
    });

    test('should view manifest details', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/manifests`);

        // Click on first manifest
        await page.click('table tbody tr:first-child');

        // Verify details panel
        await expect(page.locator('text=Manifest Details')).toBeVisible();
    });

    test('should close manifest', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/manifests`);

        // Click on an OPEN manifest
        await page.click('table tbody tr:has-text("OPEN")');

        // Click close button
        await page.click('button:has-text("Close Manifest")');

        // Confirm dialog if present
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
            await confirmButton.click();
        }

        // Verify status changed
        await expect(page.locator('text=CLOSED')).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Scanning Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/#/login`);
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test('should load scanning page', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/scanning`);

        // Verify scanning UI loads
        await expect(page.locator('text=Scan Mode')).toBeVisible();
        await expect(page.locator('text=RECEIVE')).toBeVisible();
    });

    test('should switch scan modes', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/scanning`);

        // Click different scan modes
        await page.click('button:has-text("DELIVER")');
        await expect(page.locator('button:has-text("DELIVER")[class*="primary"]')).toBeVisible();

        await page.click('button:has-text("LOAD")');
        await expect(page.locator('button:has-text("LOAD")[class*="primary"]')).toBeVisible();
    });

    test('should handle manual AWB entry', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/scanning`);

        // Enter AWB manually
        await page.fill('input[placeholder*="AWB"]', 'TAC00000001');
        await page.keyboard.press('Enter');

        // Should show result (success or error)
        await expect(page.locator('[class*="scan-result"], [class*="toast"]')).toBeVisible({ timeout: 3000 });
    });
});
