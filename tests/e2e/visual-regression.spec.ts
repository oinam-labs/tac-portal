/**
 * Visual Regression Tests
 * 
 * Uses Playwright screenshot comparison to detect unintended visual changes.
 * Snapshots are stored in tests/e2e/__snapshots__ directory.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.resolve(process.cwd(), '.auth/user.json');
const screenshotOptions = {
    animations: 'disabled' as const,
    maxDiffPixelRatio: 0.07,
    timeout: 20000,
};

test.describe('Visual Regression Tests', () => {
    test.describe('Login Page', () => {
        test('login page matches snapshot', async ({ page }) => {
            await page.goto('/#/login');
            await page.waitForLoadState('networkidle');

            // Wait for animations to complete
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('login-page.png', {
                fullPage: true,
                ...screenshotOptions,
                mask: [
                    // Mask dynamic content that may change
                    page.locator('[data-testid="login-email-input"]'),
                    page.locator('[data-testid="login-password-input"]'),
                ],
            });
        });

        test('login error state matches snapshot', async ({ page }) => {
            await page.goto('/#/login');
            await page.waitForLoadState('networkidle');

            // Clear default values and enter invalid credentials
            await page.locator('[data-testid="login-email-input"]').fill('invalid@test.com');
            await page.locator('input[type="password"]').fill('wrongpassword');
            await page.locator('[data-testid="login-submit-button"]').click();

            // Wait for error message
            await page.waitForSelector('[data-testid="login-error-message"]', { timeout: 15000 });
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('login-error-state.png', {
                fullPage: true,
                ...screenshotOptions,
            });
        });
    });

    test.describe('Dashboard', () => {
        test.use({ storageState: authFile });

        test('dashboard page matches snapshot', async ({ page }) => {
            await page.goto('/#/dashboard');
            await page.waitForLoadState('networkidle');

            // Wait for KPI data to load
            await page.waitForSelector('[data-testid="kpi-grid"]', { timeout: 15000 });
            await page.waitForTimeout(1000);

            await expect(page).toHaveScreenshot('dashboard-page.png', {
                fullPage: true,
                ...screenshotOptions,
                mask: [
                    // Mask dynamic KPI values
                    page.locator('[data-testid="kpi-grid"]'),
                ],
            });
        });

        test('dashboard header matches snapshot', async ({ page }) => {
            await page.goto('/#/dashboard');
            await page.waitForLoadState('networkidle');

            const header = page.locator('[data-testid="dashboard-heading"]').first();
            await expect(header).toBeVisible();

            await expect(header).toHaveScreenshot('dashboard-header.png', {
                ...screenshotOptions,
            });
        });

        test('quick actions matches snapshot', async ({ page }) => {
            await page.goto('/#/dashboard');
            await page.waitForLoadState('networkidle');

            const quickActions = page.locator('[data-testid="quick-actions"]');
            await expect(quickActions).toBeVisible();

            await expect(quickActions).toHaveScreenshot('quick-actions.png', {
                ...screenshotOptions,
            });
        });
    });

    test.describe('Manifests Page', () => {
        test.use({ storageState: authFile });

        test('manifests page matches snapshot', async ({ page }) => {
            await page.goto('/#/manifests');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await expect(page).toHaveScreenshot('manifests-page.png', {
                fullPage: true,
                ...screenshotOptions,
                mask: [
                    // Mask table data that changes
                    page.locator('table'),
                ],
            });
        });
    });

    test.describe('Shipments Page', () => {
        test.use({ storageState: authFile });

        test('shipments page matches snapshot', async ({ page }) => {
            await page.goto('/#/shipments');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await expect(page).toHaveScreenshot('shipments-page.png', {
                fullPage: true,
                ...screenshotOptions,
                mask: [
                    // Mask table data that changes
                    page.locator('table'),
                ],
            });
        });
    });

    test.describe('Responsive Design', () => {
        test('login page mobile view', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/#/login');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('login-mobile.png', {
                fullPage: true,
                ...screenshotOptions,
            });
        });

        test('login page tablet view', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/#/login');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('login-tablet.png', {
                fullPage: true,
                ...screenshotOptions,
            });
        });
    });

    test.describe('Dark Mode', () => {
        test('login page dark mode', async ({ page }) => {
            await page.emulateMedia({ colorScheme: 'dark' });
            await page.goto('/#/login');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('login-dark-mode.png', {
                fullPage: true,
                ...screenshotOptions,
            });
        });
    });
});
