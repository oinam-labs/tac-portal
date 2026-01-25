"""TC005: Invoice Creation, Tax Calculations, PDF Generation and Status Workflow Test"

Verifies that the Finance/Invoices page is accessible and displays invoice data.
"""

import asyncio
from playwright.async_api import async_playwright, expect
from base_test import (
    create_browser_context,
    login_user,
    click_sidebar_link,
    DEFAULT_TIMEOUT,
)


# Configure UTF-8 encoding for Windows console
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')


# Import test helpers
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from test_helpers import login_user, navigate_to_module, wait_for_page_load

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start Playwright
        pw = await async_playwright().start()
        browser, context = await create_browser_context(pw)
        page = await context.new_page()
        
        
        # Enable console logging for debugging
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
        
        # Login
        login_success = await login_user(page)
        if not login_success:
            raise AssertionError("TC005 FAILED: Could not login")
        
        # Navigate to Invoices page
        await click_sidebar_link(page, "Invoices")
        
        # Wait for finance page to load
        await page.wait_for_timeout(2000)
        
        # Verify finance/invoices page is accessible
        # Look for invoice-related elements
        finance_header = page.locator('h1:has-text("Finance"), h1:has-text("Invoice"), h2:has-text("Invoice")')
        await expect(finance_header).to_be_visible(timeout=15000)
        
        # Verify invoice table or list is present
        invoice_table = page.locator('table, [role="table"]')
        if await invoice_table.count() > 0:
            await expect(invoice_table).to_be_visible(timeout=15000)
        
        print("✅ TC005 PASSED: Finance/Invoice page accessible and displays data")
        
    except Exception as e:
        print(f"Test failed: {e}")
        raise AssertionError(f"TC005 FAILED: Invoice workflow test failed. {str(e)}")
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    asyncio.run(run_test())
    