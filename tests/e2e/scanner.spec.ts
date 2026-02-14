import { test, expect } from '@playwright/test';

test.describe('Scanner Debugging', () => {
    test('should detect rapid keyboard input as scanner input', async ({ page }) => {
        // Capture console logs and errors
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
        page.on('requestfailed', request => console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`));
        page.on('response', response => {
            if (response.status() === 404) {
                console.log(`RESPONSE 404: ${response.url()}`);
            }
        });

        // Navigate to dashboard
        // Navigate to dashboard/landing
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        console.log(`CURRENT URL: ${page.url()}`);

        // We are likely on Landing page
        await expect(page.locator('body')).toContainText('TAC Cargo');

        // Ensure focus
        await page.click('body');

        // Check if ScanningProvider is mounted (via console log or exposing state)
        // We'll rely on functional behavior: scanning should trigger a toast or dialog logic
        // But since we are debugging "nothing works", let's look for the dialog opening

        // Simulate scanner input: "TAC12345678" followed by Enter, with very short delays
        const barcode = 'TAC12345678';

        // rapid typing
        for (const char of barcode) {
            await page.keyboard.press(char, { delay: 10 }); // 10ms delay < 60ms threshold
        }
        await page.keyboard.press('Enter', { delay: 10 });

        // Expectation: The global scanner should catch this.
        // If it works, it might try to find the shipment and show a toast (error or success)
        // Or if we are in dashboard, it might open the Scan Dialog?
        // Wait, the code says:
        // if (isScanningRef.current) -> resolves promise
        // else -> notifyListeners -> toast.success(`Scanned: ${data}`) (if no listeners)

        // On Dashboard, Header subscribes?
        // Header.tsx: 
        // const { subscribe } = useScanner();
        // useEffect(() => subscribe(...), [])
        // valid handlers?
        // Actually Header calls `useScanner().scan()` when button clicked. 
        // Does Header LISTEN to global scans?
        // Let's check Header.tsx again.

        // If Header DOES NOT listen, then "No listeners registered" warning should appear in console
        // And "Scanned: TAC..." toast should appear.

        // Let's assume toast appears.
        await expect(page.locator('text=Scanned: TAC12345678')).toBeVisible({ timeout: 5000 });
    });

    test('should NOT type into focused input if scanning', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        // await expect(page.locator('header')).toBeVisible(); // Landing page has no header component usually

        // Focus the search bar (assuming there is one in header)
        const searchInput = page.locator('input[placeholder*="Search"]'); // Adjust selector
        if (await searchInput.isVisible()) {
            await searchInput.click();
            await expect(searchInput).toBeFocused();

            // Scan
            const barcode = 'TAC87654321';
            for (const char of barcode) {
                await page.keyboard.press(char, { delay: 10 });
            }
            await page.keyboard.press('Enter', { delay: 10 });

            // Expectation: Input value should NOT contain the barcode
            await expect(searchInput).toHaveValue('');

            // And toast should appear
            await expect(page.locator('text=Scanned: TAC87654321')).toBeVisible();
        }
    });

    test('manual entry in scan dialog should work', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Open scan dialog
        await page.getByRole('button', { name: /scan/i }).click();
        // or find the scan icon

        const dialog = page.locator('div[role="dialog"]');
        await expect(dialog).toBeVisible();

        // Type slowly (manual)
        const manualCode = 'MAN123';
        await page.keyboard.type(manualCode, { delay: 100 }); // Slow typing
        await page.keyboard.press('Enter');

        // Should handle as manual submit
        // Verify result...
    });
});
