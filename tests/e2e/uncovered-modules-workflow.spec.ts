import { test, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.resolve(process.cwd(), '.auth/user.json');

type RouteCheck = {
  name: string;
  path: string;
  heading: RegExp;
};

const ROUTES: RouteCheck[] = [
  { name: 'Analytics', path: '/analytics', heading: /operations analytics/i },
  { name: 'Inventory', path: '/inventory', heading: /inventory management/i },
  { name: 'Customers', path: '/customers', heading: /customer management/i },
  { name: 'Management', path: '/management', heading: /staff\s*&\s*hubs/i },
  { name: 'Messages', path: '/admin/messages', heading: /^messages$/i },
  { name: 'Shift Report', path: '/shift-report', heading: /shift handover report/i },
  { name: 'Settings', path: '/settings', heading: /system configuration/i },
];

test.describe('Uncovered Module Workflow Smoke', () => {
  test.use({ storageState: authFile });

  for (const route of ROUTES) {
    test(`${route.name} should load and be accessible`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/login/i);
      await expect(page.locator('body')).not.toContainText(/403 forbidden|insufficient/i);
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    });
  }

  test('Customers basic workflow: open create dialog and cancel', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('add-customer-button').click();
    await expect(page.getByTestId('create-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('create-dialog')).not.toBeVisible();
  });

  test('Management basic workflow: open invite dialog and cancel', async ({ page }) => {
    await page.goto('/management');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /invite user/i }).click();
    await expect(page.getByTestId('create-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('create-dialog')).not.toBeVisible();
  });

  test('Messages basic workflow: refresh inbox', async ({ page }) => {
    await page.goto('/admin/messages');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /refresh/i }).click();
    await expect(page.getByRole('heading', { name: /^messages$/i })).toBeVisible();
  });

  test('Shift report basic workflow: change duration filter', async ({ page }) => {
    await page.goto('/shift-report');
    await page.waitForLoadState('networkidle');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /last 12 hours/i }).click();
    await expect(page.getByText(/12 hours/i)).toBeVisible();
  });

  test('Settings basic workflow: switch tabs and search audit logs', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: /security/i }).click();
    await expect(page.getByText(/notifications/i).first()).toBeVisible();

    await page.getByRole('tab', { name: /audit logs/i }).click();
    await page.getByPlaceholder(/search logs/i).fill('LOGIN');
    await expect(page.getByRole('heading', { name: /system audit logs/i })).toBeVisible();
  });
});
