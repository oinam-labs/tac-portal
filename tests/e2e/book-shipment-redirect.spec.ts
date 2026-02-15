import { test, expect } from '@playwright/test';

test.describe('Book Shipment Redirect Debug', () => {
    // Force clean session
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should open booking dialog and NOT redirect to login', async ({ page }) => {
        // 1. Login
        console.log('Navigating to login...');
        await page.goto('/login');

        // Check if we are already logged in (unlikely with clean session but good safety)
        if (await page.getByTestId('login-email-input').isVisible()) {
            console.log('Logging in as admin@taccargo.com...');
            await page.getByTestId('login-email-input').fill('admin@taccargo.com');
            await page.getByTestId('login-password-input').fill('admin123');
            await page.getByTestId('login-submit-button').click();
        }

        // 2. Wait for Dashboard
        console.log('Waiting for dashboard...');
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await expect(page.locator('text=Dashboard')).toBeVisible();

        // 3. Locate "Book Shipment" button
        // Based on QuickActions.tsx, it might not have a test-id, let's try text
        // const bookButton = page.locator('text="Book Shipment"');
        // Or specific selector if accessible
        // In QuickActions.tsx: data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
        // const quickActionButton = page.getByTestId('quick-action-request-new-booking'); // "Request new booking" is the description, label is "Book Shipment" ??
        // Let's check QuickActions.tsx content again for label.
        // It says: label: 'Book Shipment'
        // So ID should be: quick-action-book-shipment

        const button = page.getByTestId('quick-action-book-shipment').first();

        console.log('Checking for Book Shipment button...');
        await expect(button).toBeVisible();

        // Capture console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // 4. Click it
        console.log('Clicking "Book Shipment"...');
        const currentUrl = page.url();
        await button.click();

        // 5. Wait a bit to see if redirect happens
        await page.waitForTimeout(3000);

        // 6. Check URL
        const newUrl = page.url();
        console.log(`URL after click: ${newUrl}`);

        if (newUrl.includes('/login')) {
            throw new Error(`REDIRECT DETECTED! User was redirected to login page from ${currentUrl}`);
        }

        // 7. Check if dialog is open
        const dialog = page.getByRole('dialog');
        const isDialogVisible = await dialog.isVisible();
        console.log(`Dialog visible: ${isDialogVisible}`);

        if (!isDialogVisible) {
            console.log('Dialog NOT visible. Taking screenshot...');
            await page.screenshot({ path: 'debug-redirect.png' });
        }

        await expect(dialog).toBeVisible();
        await expect(page.locator('text=New Booking Request')).toBeVisible();
    });
});
