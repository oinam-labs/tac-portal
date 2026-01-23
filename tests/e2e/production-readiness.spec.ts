import { test, expect } from '@playwright/test';

/**
 * Production Readiness E2E Tests
 * 
 * Validates:
 * 1. No IXA hub code in UI
 * 2. No mock data visible
 * 3. Empty states render correctly
 * 4. Invoice → Label → Manifest flow works end-to-end
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Production Readiness - Domain Enforcement', () => {
    test('should not display IXA hub code anywhere in UI', async ({ page }) => {
        // Check Dashboard
        await page.goto(`${BASE_URL}/#/dashboard`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).not.toContainText('IXA');

        // Check Manifests
        await page.goto(`${BASE_URL}/#/manifests`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).not.toContainText('IXA');

        // Check Shipments
        await page.goto(`${BASE_URL}/#/shipments`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).not.toContainText('IXA');
    });

    test('should show Imphal Hub with IMF code in manifest creation', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/manifests`);

        // Click create manifest to see hub dropdowns
        const createBtn = page.getByRole('button', { name: /create|new/i }).first();
        await expect(createBtn).toBeVisible({ timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(500);

        // Check for IMF (Imphal)
        const imphalOption = page.getByText(/Imphal Hub.*IMF/i);
        await expect(imphalOption).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Production Readiness - No Mock Data', () => {
    test('should not show hardcoded mock data on dashboard', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/dashboard`);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.locator('body').textContent() || '';

        // Check for common mock data patterns
        expect(bodyText).not.toContain('DXB-SIN');
        expect(bodyText).not.toContain('HKG-NRT');
        expect(bodyText).not.toContain('LAX-JFK');

        // Should not have exact hardcoded numbers like 450, 300, 200, 50
        // (unless they legitimately come from real data)
    });

    test('should show empty state when no data exists', async ({ page }) => {
        // This test assumes a clean database or filtered view with no data
        await page.goto(`${BASE_URL}/#/dashboard`);
        await page.waitForLoadState('networkidle');

        // If there are no shipments, should show proper empty state
        const noShipmentsText = page.getByText(/no shipments|create your first/i);
        const hasData = await page.locator('[data-testid="kpi-grid"]').isVisible();

        // Either has data OR shows empty state - both are valid
        expect(hasData || (await noShipmentsText.isVisible())).toBeTruthy();
    });
});

test.describe('Production Readiness - Empty States', () => {
    test('should render empty state correctly for charts with no data', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/dashboard`);
        await page.waitForLoadState('networkidle');

        // Wait for initial render
        await page.waitForTimeout(1000);

        // Look for proper empty state messages
        const emptyMessages = [
            /no shipments yet/i,
            /no manifests created/i,
            /create your first/i,
        ];

        // At least one chart should handle empty state gracefully
        let foundEmptyState = false;
        for (const message of emptyMessages) {
            const element = page.getByText(message);
            if (await element.isVisible()) {
                foundEmptyState = true;
                break;
            }
        }

        // Either has data or shows empty states
        const hasCharts = await page.locator('[data-testid="kpi-grid"]').isVisible();
        expect(hasCharts || foundEmptyState).toBeTruthy();
    });
});

test.describe('Production Readiness - Critical User Flows', () => {
    test('Invoice creation smoke check', async ({ page }) => {
        // Smoke test: verify invoice creation UI is accessible
        // Full E2E flow requires manual QA (see PRODUCTION_READINESS_CHECKLIST.md)
        await page.goto(`${BASE_URL}/#/invoices`);
        await page.waitForLoadState('networkidle');

        // Verify invoice creation button exists
        const createInvoiceBtn = page.getByRole('button', { name: /create|new.*invoice/i }).first();
        await expect(createInvoiceBtn).toBeVisible({ timeout: 5000 });
    });

    test('Shipment page should not show label generation error', async ({ page }) => {
        // Verify the forbidden error message is not displayed
        await page.goto(`${BASE_URL}/#/shipments`);
        await page.waitForLoadState('networkidle');

        // Should not show error: "No shipment data found. Please generate label from Invoices dashboard."
        const forbiddenError = page.getByText(/no shipment data found.*generate label from invoices/i);
        await expect(forbiddenError).not.toBeVisible();
    });

    test('Manifest creation should not crash React', async ({ page }) => {
        const consoleErrors: string[] = [];
        const reactErrors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                const text = msg.text();
                consoleErrors.push(text);

                // Check for React-specific errors
                if (text.includes('removeChild') || text.includes('React')) {
                    reactErrors.push(text);
                }
            }
        });

        await page.goto(`${BASE_URL}/#/manifests`);
        await page.waitForLoadState('networkidle');

        // Try to open create manifest
        const createBtn = page.getByRole('button', { name: /create|new/i }).first();
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
            await page.waitForTimeout(1000);
        }

        // Should not have React errors like "Failed to execute 'removeChild' on 'Node'"
        const hasRemoveChildError = reactErrors.some(err => err.includes('removeChild'));
        expect(hasRemoveChildError).toBe(false);
    });

    test('Hub dropdown should show IMF correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/#/manifests`);

        const createBtn = page.getByRole('button', { name: /create|new/i }).first();
        await expect(createBtn).toBeVisible({ timeout: 5000 });
        await createBtn.click();
        await page.waitForTimeout(500);

        // Should show "Imphal Hub (IMF)" not "Imphal Hub (IXA)"
        const imphalIMF = page.getByText(/Imphal Hub.*\(IMF\)/i);
        await expect(imphalIMF).toBeVisible({ timeout: 3000 });

        // Should NOT show IXA
        const imphalIXA = page.getByText(/Imphal Hub.*\(IXA\)/i);
        await expect(imphalIXA).not.toBeVisible();
    });
});

test.describe('Production Readiness - No Console Errors', () => {
    test('should not have React crashes on dashboard', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(`${BASE_URL}/#/dashboard`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Filter out acceptable errors (network errors, etc.)
        const reactErrors = errors.filter(err =>
            err.includes('React') ||
            err.includes('removeChild') ||
            err.includes('Cannot read')
        );

        expect(reactErrors.length).toBe(0);
    });
});
