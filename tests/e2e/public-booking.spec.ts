import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
    test('should allow public user to open booking dialog and submit form', async ({ page }) => {
        // 1. Visit Landing Page
        await page.goto('/');

        // 2. Click "Book Shipment" (Hero or Navbar)
        // Check for button visibility first
        const bookButton = page.getByRole('button', { name: 'Book Shipment' }).first();
        await expect(bookButton).toBeVisible();
        await bookButton.click();

        // 3. Verify Dialog Opens
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(page.getByText('Book New Shipment')).toBeVisible();

        // 4. Check for WhatsApp Field (Mandatory)
        const whatsappInput = page.getByPlaceholder('e.g. +91 9876543210');
        await expect(whatsappInput).toBeVisible();

        // 5. Fill Form
        await whatsappInput.fill('+919999988888');

        await page.getByPlaceholder('Sender Name').fill('John Doe');
        await page.getByPlaceholder('Sender Phone').fill('9876543210');
        await page.getByPlaceholder('Address Line 1').first().fill('123 Sender St');
        await page.locator('input[name="consignor.city"]').fill('Imphal');
        await page.locator('input[name="consignor.state"]').fill('Manipur');
        await page.locator('input[name="consignor.zip"]').fill('795001');

        await page.getByPlaceholder('Receiver Name').fill('Jane Doe');
        await page.getByPlaceholder('Receiver Phone').fill('9123456780');
        await page.getByPlaceholder('Address Line 1').nth(1).fill('456 Receiver Ave');
        await page.locator('input[name="consignee.city"]').fill('Delhi');
        await page.locator('input[name="consignee.state"]').fill('Delhi');
        await page.locator('input[name="consignee.zip"]').fill('110001');

        // Volume Matrix (Fill first row)
        await page.locator('input[name="volumeMatrix.0.length"]').fill('10');
        await page.locator('input[name="volumeMatrix.0.width"]').fill('10');
        await page.locator('input[name="volumeMatrix.0.height"]').fill('10');
        await page.locator('input[name="volumeMatrix.0.weight"]').fill('1');
        await page.locator('input[name="volumeMatrix.0.count"]').fill('1');

        // 6. Submit
        // Mock API or just check for success toast/behavior
        // Since we are running against real dev server, it might try to hit Supabase.
        // We'll verify the Toast or Dialog closing.
        await page.getByRole('button', { name: 'Book Shipment' }).click();

        // 7. Verify Success or Capture Error
        try {
            await expect(page.getByText('Booking request sent successfully!')).toBeVisible({ timeout: 10000 });
        } catch (e) {
            const errorToast = await page.getByText('Failed to create booking').isVisible();
            if (errorToast) {
                console.error('Test failed: Found "Failed to create booking" toast. Likely DB/RLS issue.');
            }
            throw e;
        }

        // 8. Verify Dialog Closes
        await expect(dialog).not.toBeVisible();
    });
});
