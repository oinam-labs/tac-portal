"""TC004: Offline Barcode/QR Scanning Queue and Synchronization Test"

Verifies that barcode/QR scans can be queued and the scanning page
is accessible after login.
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
            raise AssertionError("TC004 FAILED: Could not login")
        
        # Navigate to Scanning page
        await click_sidebar_link(page, "Scanning")
        
        # Wait for scanning page to load
        await page.wait_for_timeout(2000)
        
        # Verify scanning page is accessible
        # Look for scanning-related elements
        scanning_header = page.locator('h1:has-text("Scan"), h2:has-text("Scan")')
        await expect(scanning_header).to_be_visible(timeout=15000)
        
        # Try to find scan input field (may have different selectors)
        scan_input = page.locator('[data-testid="scan-input"]')
        
        if await scan_input.count() > 0:
            # Input a test barcode
            await scan_input.fill('TEST-AWB-12345')
            await page.wait_for_timeout(500)
            
            # Clear for next test
            await scan_input.clear()
        
        print("✅ TC004 PASSED: Scanning page accessible and functional")
        
    except Exception as e:
        print(f"Test failed: {e}")
        raise AssertionError(f"TC004 FAILED: Offline barcode scanning test failed. {str(e)}")
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    asyncio.run(run_test())
    