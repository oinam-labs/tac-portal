/**
 * E2E Test: Shipment Creation Workflow
 * Tests the critical path of creating and tracking a shipment
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER = {
    email: 'admin@taccargo.com',
    password: 'admin123',
};

test.describe('Shipment Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto(`${BASE_URL}/#/login`);
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test('should create a new shipment', async ({ page }) => {
        // Navigate to shipments page
        await page.click('text=Shipments');
        await page.waitForURL('**/shipments');

        // Click create button
        await page.click('button:has-text("Create")');

        // Fill shipment form
        await page.fill('input[name="customerName"]', 'Test Customer');
        await page.fill('input[name="customerPhone"]', '9876543210');
        await page.fill('input[name="customerEmail"]', 'test@example.com');

        // Select origin and destination
        await page.selectOption('select[name="originHub"]', 'IMPHAL');
        await page.selectOption('select[name="destinationHub"]', 'NEW_DELHI');

        // Enter shipment details
        await page.fill('input[name="weight"]', '10');
        await page.fill('input[name="pieces"]', '2');
        await page.fill('textarea[name="contents"]', 'Test Package');

        // Submit form
        await page.click('button:has-text("Create Shipment")');

        // Verify success
        await expect(page.locator('text=Shipment created')).toBeVisible({ timeout: 5000 });
    });

    test('should search and view shipment details', async ({ page }) => {
        // Navigate to shipments page
        await page.goto(`${BASE_URL}/#/shipments`);

        // Search for shipment
        await page.fill('input[placeholder*="Search"]', 'TAC');
        await page.waitForTimeout(500); // Debounce

        // Click on first shipment row
        await page.click('table tbody tr:first-child');

        // Verify details panel opens
        await expect(page.locator('text=Shipment Details')).toBeVisible();
        await expect(page.locator('text=AWB')).toBeVisible();
    });

    test('should track shipment status', async ({ page }) => {
        // Navigate to tracking page
        await page.goto(`${BASE_URL}/#/tracking`);

        // Enter AWB number
        await page.fill('input[placeholder*="AWB"]', 'TAC00000001');
        await page.click('button:has-text("Track")');

        // Verify tracking timeline appears
        await expect(page.locator('[class*="timeline"], [class*="tracking"]')).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Public Tracking', () => {
    test('should allow public tracking without login', async ({ page }) => {
        // Navigate directly to public tracking
        await page.goto(`${BASE_URL}/#/track`);

        // Verify tracking page loads
        await expect(page.locator('text=Track Your Shipment')).toBeVisible();

        // Enter AWB and track
        await page.fill('input[placeholder*="AWB"]', 'TAC00000001');
        await page.click('button:has-text("Track")');

        // Should show results or "not found" message
        await expect(page.locator('body')).toContainText(/(Timeline|Not Found|Tracking)/i);
    });
});
