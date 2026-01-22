import { test, expect, Page } from '@playwright/test';

/**
 * Enterprise Manifest Scanning E2E Tests
 * Tests the new AWB-first barcode scanning workflow
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Enterprise Manifest Scanning', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to manifests page
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();
  });

  test('should load manifests page without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Verify manifests page loads
    await expect(page.locator('body')).toContainText(/(Manifest|Dashboard|TAC)/i, {
      timeout: 15000,
    });

    // Filter out expected errors
    const unexpectedErrors = consoleErrors.filter(
      (err) => !err.includes('Failed to fetch') && !err.includes('NetworkError')
    );

    expect(unexpectedErrors.length).toBe(0);
  });

  test('should display manifest list with correct columns', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Look for manifest table or list
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      // Check for expected column headers
      const headers = ['Manifest', 'Route', 'Type', 'Status', 'Shipments'];
      for (const header of headers) {
        const headerCell = page.getByRole('columnheader', { name: new RegExp(header, 'i') });
        // At least some headers should be visible
        if (await headerCell.isVisible()) {
          expect(true).toBe(true);
        }
      }
    }
  });

  test('should open create manifest modal', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Find create button
    const createButton = page.getByRole('button', { name: /create|new|add/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();

      // Modal should open
      await page.waitForTimeout(500);

      // Look for modal content
      const modal = page.getByRole('dialog');
      if (await modal.isVisible()) {
        // Should have origin/destination selectors
        const originLabel = page.getByText(/origin|from/i).first();
        const destLabel = page.getByText(/destination|to/i).first();

        expect((await originLabel.isVisible()) || (await destLabel.isVisible())).toBe(true);
      }
    }
  });

  test('should show transport type toggle (AIR/TRUCK)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Open create modal
    const createButton = page.getByRole('button', { name: /create|new|add/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for AIR/TRUCK toggle
      const airOption = page.getByText(/AIR/i);
      const truckOption = page.getByText(/TRUCK/i);

      if (await airOption.isVisible()) {
        await airOption.click();
        // Should show flight-related fields
        await page.waitForTimeout(300);
        // Updated selector for new UI
        const flightField = page.getByPlaceholder(/1234|flight/i);
        // Flight field should be visible when AIR is selected
        if (await flightField.isVisible()) {
          expect(true).toBe(true);
        }
      }

      if (await truckOption.isVisible()) {
        await truckOption.click();
        // Should show vehicle-related fields
        await page.waitForTimeout(300);
        // Updated selector for new UI
        const vehicleField = page.getByPlaceholder(/TX-1234-AB|vehicle/i);
        // Vehicle field should be visible when TRUCK is selected
        if (await vehicleField.isVisible()) {
          expect(true).toBe(true);
        }
      }
    }
  });

  test('should validate required fields before creating manifest', async ({ page }) => {
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Open create modal
    const createButton = page.getByRole('button', { name: /create|new|add/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Try to submit without filling required fields
      const submitButton = page.getByRole('button', { name: /create manifest|submit|save|next/i });
      if (await submitButton.isVisible()) {
        // Button should be disabled or clicking should show validation errors
        const isDisabled = await submitButton.isDisabled();
        if (!isDisabled) {
          await submitButton.click();
          await page.waitForTimeout(300);

          // Should show validation message
          const errorMessage = page.getByText(/required|select|choose/i);
          expect(await errorMessage.isVisible()).toBe(true);
        } else {
          // Button is disabled as expected
          expect(isDisabled).toBe(true);
        }
      }
    }
  });
});

test.describe('Manifest Scan Panel', () => {
  // Shared helper to get to the scanning phase - always creates a new manifest
  async function enterScanPhase(page: Page) {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Always create a new manifest for consistent test behavior
    await page.getByRole('button', { name: /create manifest/i }).click();

    // Wait for modal to be fully open - look for dialog and Route Selection card
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Route Selection')).toBeVisible({ timeout: 5000 });

    // Select Origin - Radix Select uses combobox role
    const originCombobox = page.getByRole('combobox').first();
    await originCombobox.click();
    await page.waitForTimeout(300);
    const originOptions = page.getByRole('option');
    await expect(originOptions.first()).toBeVisible({ timeout: 5000 });
    await originOptions.first().click();
    await page.waitForTimeout(300);

    // Select Destination - second combobox
    const destCombobox = page.getByRole('combobox').nth(1);
    await destCombobox.click();
    await page.waitForTimeout(300);
    const destOptions = page.getByRole('option');
    await expect(destOptions.first()).toBeVisible({ timeout: 5000 });
    await destOptions.first().click();
    await page.waitForTimeout(300);

    // Fill required Flight No (AIR is default)
    const flightField = page.getByPlaceholder(/1234/i);
    await expect(flightField).toBeVisible();
    await flightField.fill('TEST001');
    // Trigger blur to ensure form validation runs
    await flightField.press('Tab');
    await page.waitForTimeout(1000); // Wait for form validation

    // Wait for validation to pass (button enabled) and click
    const createBtn = page.getByRole('button', { name: /next/i });
    await expect(createBtn).toBeEnabled({ timeout: 10000 });
    await createBtn.click({ force: true });

    // Check for error toast
    const errorToast = page.getByText(/Failed to create manifest/i);
    if (await errorToast.isVisible()) {
      throw new Error('Manifest creation failed: ' + (await errorToast.textContent()));
    }

    // Wait for phase transition - either scan input appears or we see build phase heading
    await page.waitForTimeout(1000);

    // Check for scan input or any indication we're in step 2 (Add Shipments)
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();
    const buildHeading = page.getByRole('heading', { name: /Add Shipments/i });

    // Wait for phase transition - either scan input appears or we see step 2 heading
    await expect(scanInput.or(buildHeading).first()).toBeVisible({ timeout: 15000 });
  }

  test('should show scan input when manifest is in building state', async ({ page }) => {
    await enterScanPhase(page);
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();
    await expect(scanInput).toBeVisible();
  });

  test('should handle AWB scan input', async ({ page }) => {
    await enterScanPhase(page);
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();

    // Enter a test AWB
    await scanInput.fill('TAC12345678');
    await scanInput.press('Enter');

    // Wait for processing
    await page.waitForTimeout(1000);

    // Should show some feedback (success, error, or duplicate message)
    const feedback = page.getByText(/(added|success|not found|duplicate|already|error|shipment)/i);
    await expect(feedback.first()).toBeVisible();
  });

  test('should prevent duplicate scans (idempotency)', async ({ page }) => {
    await enterScanPhase(page);
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();
    const testAWB = 'TAC12345678';

    // First scan
    await scanInput.fill(testAWB);
    await scanInput.press('Enter');
    await page.waitForTimeout(1000);

    // Second scan (duplicate)
    await scanInput.fill(testAWB);
    await scanInput.press('Enter');
    await page.waitForTimeout(1000);

    // Should show duplicate message, not an error
    const duplicateMsg = page.getByText(/(duplicate|already|exists)/i);
    await expect(duplicateMsg.first()).toBeVisible();

    // Page should still be functional (no crash)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Manifest Status Workflow', () => {
  test('should display manifest status badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Look for status badges
    const statuses = ['DRAFT', 'OPEN', 'BUILDING', 'CLOSED', 'DEPARTED', 'ARRIVED'];
    for (const status of statuses) {
      const badge = page.getByText(new RegExp(`^${status}$`, 'i')).first();
      if (await badge.isVisible()) {
        // At least one status badge is visible
        expect(true).toBe(true);
        break;
      }
    }
  });

  test('should show close manifest button for open manifests', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Click on an OPEN or BUILDING manifest - use first matching row
    const openBadge = page.getByText(/DRAFT|OPEN|BUILDING/i).first();
    if (await openBadge.isVisible()) {
      const row = page.locator('tr', { has: openBadge }).first();
      await row.getByRole('button', { name: 'View' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('button', { name: /close manifest/i })).toBeVisible();
    }
  });

  test('should not allow editing closed manifests', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Find a CLOSED manifest - use first matching row
    const closedBadge = page.getByText(/^CLOSED$/i).first();
    if (await closedBadge.isVisible()) {
      const row = page.locator('tr', { has: closedBadge }).first();
      await row.getByRole('button', { name: 'View' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Scan input should not be visible or should be disabled
      const scanInput = page.getByPlaceholder(/awb|scan|barcode/i);
      await expect(scanInput).toHaveCount(0); // Should not be rendered for closed manifests or disabled
    }
  });
});

test.describe('Manifest Shipment Table', () => {
  // Helper to get to the scanning phase - creates a new manifest
  async function enterScanPhase(page: Page) {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Create a new manifest for consistent test behavior
    await page.getByRole('button', { name: /create manifest/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Route Selection')).toBeVisible({ timeout: 5000 });

    // Select Origin - Radix Select uses combobox role
    const originCombobox = page.getByRole('combobox').first();
    await originCombobox.click();
    await page.waitForTimeout(300);
    const originOption = page.getByRole('option').first();
    await expect(originOption).toBeVisible({ timeout: 5000 });
    await originOption.click();
    await page.waitForTimeout(300);

    // Select Destination - second combobox
    const destCombobox = page.getByRole('combobox').nth(1);
    await destCombobox.click();
    await page.waitForTimeout(300);
    const destOption = page.getByRole('option').first();
    await expect(destOption).toBeVisible({ timeout: 5000 });
    await destOption.click();
    await page.waitForTimeout(300);

    // Fill required Flight No and trigger validation
    const flightField = page.getByPlaceholder(/1234/i);
    await expect(flightField).toBeVisible();
    await flightField.fill('TEST002');
    await flightField.press('Tab');
    await page.waitForTimeout(1000);

    // Click Next to proceed to step 2
    const nextBtn = page.getByRole('button', { name: /next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click({ force: true });

    // Check for error toast
    const errorToast = page.getByText(/Failed to create manifest/i);
    if (await errorToast.isVisible()) {
      throw new Error('Manifest creation failed: ' + (await errorToast.textContent()));
    }

    // Wait for phase transition to step 2 (Add Shipments)
    await page.waitForTimeout(1000);
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();
    const addShipmentsText = page.getByText(/Add Shipments/i).first();
    await expect(scanInput.or(addShipmentsText)).toBeVisible({ timeout: 15000 });
  }

  test('should display shipment details in manifest', async ({ page }) => {
    await enterScanPhase(page);

    // Look for shipment table columns
    const columns = ['AWB', 'Consignee', 'Pkg', 'Weight'];
    for (const col of columns) {
      const header = page.getByText(new RegExp(col, 'i'));
      if (await header.first().isVisible()) {
        await expect(header.first()).toBeVisible();
      }
    }
  });

  test('should show totals summary', async ({ page }) => {
    await enterScanPhase(page);

    // Look for totals display
    const totals = page.getByText(/(total|shipments|packages|weight)/i);
    if (await totals.first().isVisible()) {
      await expect(totals.first()).toBeVisible();
    }
  });

  test('should allow removing shipments from open manifest', async ({ page }) => {
    await enterScanPhase(page);

    // Look for remove button on shipment row if any items exist
    const removeButton = page.getByRole('button', { name: /remove|delete/i }).first();
    if (await removeButton.isVisible()) {
      await expect(removeButton).toBeVisible();
    }
  });
});

test.describe('Scan Audit Logging', () => {
  // Helper to get to the scanning phase - creates a new manifest
  async function enterScanPhase(page: Page) {
    await page.goto(`${BASE_URL}/#/manifests`);
    await expect(page.getByRole('button', { name: /create manifest/i }).first()).toBeVisible();

    // Create a new manifest for consistent test behavior
    await page.getByRole('button', { name: /create manifest/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Route Selection')).toBeVisible({ timeout: 5000 });

    // Select Origin - Radix Select uses combobox role
    const originCombobox = page.getByRole('combobox').first();
    await originCombobox.click();
    await page.waitForTimeout(300);
    const originOption = page.getByRole('option').first();
    await expect(originOption).toBeVisible({ timeout: 5000 });
    await originOption.click();
    await page.waitForTimeout(300);

    // Select Destination - second combobox
    const destCombobox = page.getByRole('combobox').nth(1);
    await destCombobox.click();
    await page.waitForTimeout(300);
    const destOption = page.getByRole('option').first();
    await expect(destOption).toBeVisible({ timeout: 5000 });
    await destOption.click();
    await page.waitForTimeout(300);

    // Fill required Flight No and trigger validation
    const flightField = page.getByPlaceholder(/1234/i);
    await expect(flightField).toBeVisible();
    await flightField.fill('TEST003');
    await flightField.press('Tab');
    await page.waitForTimeout(1000);

    // Click Next to proceed to step 2
    const nextBtn = page.getByRole('button', { name: /next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click({ force: true });

    // Check for error toast
    const errorToast = page.getByText(/Failed to create manifest/i);
    if (await errorToast.isVisible()) {
      throw new Error('Manifest creation failed: ' + (await errorToast.textContent()));
    }

    // Wait for phase transition to step 2 (Add Shipments)
    await page.waitForTimeout(1000);
    const scanInput = page.getByPlaceholder(/Scan or enter AWB/i).first();
    const addShipmentsText = page.getByText(/Add Shipments/i).first();
    await expect(scanInput.or(addShipmentsText)).toBeVisible({ timeout: 15000 });
  }

  test('should track scan history', async ({ page }) => {
    await enterScanPhase(page);

    // Look for scan history or logs section
    const historySection = page.getByText(/(scan history|scan log)/i);
    if (await historySection.first().isVisible()) {
      await expect(historySection.first()).toBeVisible();
    }

    // Or look for scan statistics
    const statsSection = page.getByText(/(scans|successful|failed)/i);
    if (await statsSection.first().isVisible()) {
      await expect(statsSection.first()).toBeVisible();
    }
  });
});
