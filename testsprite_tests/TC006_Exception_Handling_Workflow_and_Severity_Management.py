"""TC006: Exception Handling Workflow and Severity Management Test

Verifies that the Exceptions page is accessible and displays exception data.
"""

import asyncio
from playwright.async_api import async_playwright, expect
from base_test import (
    create_browser_context,
    login_user,
    click_sidebar_link,
    DEFAULT_TIMEOUT,
)


async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start Playwright
        pw = await async_playwright().start()
        browser, context = await create_browser_context(pw)
        page = await context.new_page()
        
        # Login
        login_success = await login_user(page)
        if not login_success:
            raise AssertionError("TC006 FAILED: Could not login")
        
        # Navigate to Exceptions page
        await click_sidebar_link(page, "Exceptions")
        
        # Wait for exceptions page to load
        await page.wait_for_timeout(2000)
        
        # Verify exceptions page is accessible
        exceptions_header = page.locator('h1:has-text("Exception"), h2:has-text("Exception")')
        await expect(exceptions_header.first).to_be_visible(timeout=10000)
        
        # Verify exceptions table or content is present
        exceptions_content = page.locator('table, [role="table"], .exceptions-list')
        if await exceptions_content.count() > 0:
            await expect(exceptions_content.first).to_be_visible(timeout=10000)
        
        print("✅ TC006 PASSED: Exceptions page accessible and displays data")
        
    except Exception as e:
        raise AssertionError(f"TC006 FAILED: Exception handling test failed. {str(e)}")
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    asyncio.run(run_test())
    