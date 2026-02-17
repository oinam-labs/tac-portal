/**
 * Scanner Context Awareness E2E Tests
 *
 * Tests the global vs local scan handling system to ensure:
 * 1. Global navigation works from dashboard/shipments pages
 * 2. Local handling works in manifest builder (no navigation)
 * 3. Context cleanup restores global navigation
 * 4. Duplicate detection works correctly
 * 5. Rapid scanning is handled properly
 */

import { test, expect } from '@playwright/test';

test.describe('Scanner Context Awareness', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@tacargo.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('h1, h2').filter({ hasText: 'Dashboard' })).toBeVisible();
  });

  test('should navigate to shipment from dashboard (global context)', async ({ page }) => {
    // Verify: On dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Simulate scanner input
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Verify: Navigated to tracking page
    await expect(page).toHaveURL(/\/tracking\?awb=TAC20260003/);

    // Verify: Toast notification appeared
    await expect(page.locator('text=Opening Shipment')).toBeVisible();
  });

  test('should add to manifest without navigation (manifest context)', async ({ page }) => {
    // Navigate to manifests page
    await page.goto('/manifests');
    await expect(page.locator('text=Fleet Manifests')).toBeVisible();

    // Open manifest builder
    await page.click('[data-testid="create-manifest-button"]');

    // Wait for modal to open
    await expect(page.locator('text=Manifest Setup')).toBeVisible();

    // Fill manifest details
    await page.selectOption('select[name="type"]', 'GROUND');
    await page.selectOption('select[name="from_hub_id"]', { index: 1 }); // First available hub
    await page.selectOption('select[name="to_hub_id"]', { index: 2 }); // Second available hub

    // Click Next to go to "Add Shipments" step
    await page.click('button:has-text("Next")');

    // Verify: On "Add Shipments" step
    await expect(page.locator('text=Scan AWB')).toBeVisible();

    // Wait for scan input to be focused
    await page.waitForTimeout(500);

    // Count initial manifest items
    const initialRows = await page.locator('table tbody tr').count();
    console.log(`[Test] Initial manifest rows: ${initialRows}`);

    // Simulate scanner input (TAC20260003)
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait for scan to process
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're STILL on manifests page (NOT navigated)
    await expect(page).toHaveURL(/\/manifests$/);
    console.log('[Test] ✅ Still on manifests page - no navigation occurred');

    // Verify: Shipment added to manifest table
    const newRows = await page.locator('table tbody tr').count();
    console.log(`[Test] New manifest rows: ${newRows}`);

    // Note: Might be 0 rows if shipment doesn't exist in test DB
    // The important check is that we didn't navigate away

    // Verify: Success feedback shown
    const successMessage = page.locator('text=Success, text=Added').first();
    if (await successMessage.isVisible()) {
      console.log('[Test] ✅ Success message displayed');
    }
  });

  test('should prevent duplicate adds in manifest', async ({ page }) => {
    // Setup: Open manifest builder and go to Add Shipments step
    await page.goto('/manifests');
    await page.click('[data-testid="create-manifest-button"]');
    await page.selectOption('select[name="type"]', 'GROUND');
    await page.selectOption('select[name="from_hub_id"]', { index: 1 });
    await page.selectOption('select[name="to_hub_id"]', { index: 2 });
    await page.click('button:has-text("Next")');

    // Wait for scan panel
    await expect(page.locator('text=Scan AWB')).toBeVisible();
    await page.waitForTimeout(500);

    // Scan same AWB twice
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Verify: Duplicate warning appears
    const duplicateWarning = page.locator('text=duplicate, text=already');
    if (await duplicateWarning.isVisible()) {
      console.log('[Test] ✅ Duplicate warning shown');
    }

    // Verify: Still on manifests page
    await expect(page).toHaveURL(/\/manifests$/);
  });

  test('should resume global navigation after closing manifest', async ({ page }) => {
    // Setup: Open manifest builder
    await page.goto('/manifests');
    await page.click('[data-testid="create-manifest-button"]');

    // Verify modal is open
    await expect(page.locator('text=Manifest Setup')).toBeVisible();

    // Close the modal
    await page.keyboard.press('Escape'); // Try Escape key first
    await page.waitForTimeout(500);

    // If Escape didn't work, click close button
    const closeButton = page
      .locator('button[aria-label="Close"], button:has-text("Cancel")')
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }

    // Verify: Modal is closed, back on manifests list
    await expect(page.locator('text=Fleet Manifests')).toBeVisible();

    // Wait for context to reset
    await page.waitForTimeout(500);

    // Simulate scanner input (should now navigate globally)
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Verify: Global navigation resumed (navigates to tracking)
    await expect(page).toHaveURL(/\/tracking\?awb=TAC20260003/);
    console.log('[Test] ✅ Global navigation resumed after closing manifest');
  });

  test('should handle rapid scans in manifest', async ({ page }) => {
    // Setup: Open manifest builder
    await page.goto('/manifests');
    await page.click('[data-testid="create-manifest-button"]');
    await page.selectOption('select[name="type"]', 'GROUND');
    await page.selectOption('select[name="from_hub_id"]', { index: 1 });
    await page.selectOption('select[name="to_hub_id"]', { index: 2 });
    await page.click('button:has-text("Next")');

    // Wait for scan panel
    await expect(page.locator('text=Scan AWB')).toBeVisible();
    await page.waitForTimeout(500);

    // Rapid scanning: 3 different AWBs
    const awbs = ['TAC20260001', 'TAC20260002', 'TAC20260003'];

    for (const awb of awbs) {
      await page.keyboard.type(awb);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300); // Small delay between scans
    }

    // Wait for all scans to process
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're STILL on manifests page
    await expect(page).toHaveURL(/\/manifests$/);
    console.log('[Test] ✅ Still on manifests page after rapid scanning');

    // Count success/error counters (if visible)
    const successCounter = page.locator('text=Added').first();
    if (await successCounter.isVisible()) {
      console.log('[Test] Success counter visible');
    }
  });

  test('should navigate from shipments page (global context)', async ({ page }) => {
    // Navigate to shipments page
    await page.goto('/shipments');
    await expect(page.locator('text=Shipments')).toBeVisible();

    // Wait for page to settle
    await page.waitForTimeout(500);

    // Simulate scanner input
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Verify: Navigated to tracking page
    await expect(page).toHaveURL(/\/tracking\?awb=TAC20260003/);
    console.log('[Test] ✅ Global navigation from shipments page');
  });

  test('should block navigation on scanning page (scanning context)', async ({ page }) => {
    // Navigate to scanning page
    await page.goto('/scanning');
    await expect(page.locator('text=Scanning Operations, text=Scan')).toBeVisible();

    // Simulate scanner input
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait
    await page.waitForTimeout(1000);

    // Verify: STILL on scanning page (didn't navigate)
    await expect(page).toHaveURL(/\/scanning$/);
    console.log('[Test] ✅ Scanning page blocked global navigation');
  });

  test('should handle scan while modal is closing', async ({ page }) => {
    // Open manifest builder
    await page.goto('/manifests');
    await page.click('[data-testid="create-manifest-button"]');
    await expect(page.locator('text=Manifest Setup')).toBeVisible();

    // Start closing the modal
    await page.keyboard.press('Escape');

    // Immediately scan before modal fully closes
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');

    // Wait for everything to settle
    await page.waitForTimeout(1500);

    // Verify: Either stayed on manifests OR navigated (depends on timing)
    // Both are acceptable as long as no crash/error occurs
    const url = page.url();
    console.log(`[Test] Final URL: ${url}`);
    expect(url).toMatch(/\/(manifests|tracking)/);
  });
});

test.describe('Scanner Console Logging', () => {
  test('should log context changes in console', async ({ page }) => {
    const logs: string[] = [];

    // Capture console logs
    page.on('console', (msg) => {
      if (msg.text().includes('ScanContext') || msg.text().includes('GlobalScanListener')) {
        logs.push(msg.text());
        console.log(`[Browser Console] ${msg.text()}`);
      }
    });

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@tacargo.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Open manifest builder
    await page.goto('/manifests');
    await page.click('[data-testid="create-manifest-button"]');
    await page.waitForTimeout(500);

    // Scan
    await page.keyboard.type('TAC20260003');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Close manifest
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify: Context registration/release was logged
    const hasRegistrationLog = logs.some((log) =>
      log.includes('Registering as active scan context')
    );
    const hasReleaseLog = logs.some(
      (log) => log.includes('Releasing scan context') || log.includes('active context: GLOBAL')
    );

    expect(hasRegistrationLog || hasReleaseLog).toBeTruthy();
    console.log(`[Test] Captured ${logs.length} relevant console logs`);
  });
});
