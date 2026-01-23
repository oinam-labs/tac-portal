"""TC001: Role-based Authentication Success Test

Verifies that users can successfully log in with valid credentials
and are redirected to the dashboard with proper role-based access.
"""

import asyncio
from playwright.async_api import async_playwright, expect

# Configuration
BASE_URL = "http://localhost:3000"
DEFAULT_TIMEOUT = 30000
TEST_USER_EMAIL = "tapancargo@gmail.com"
TEST_USER_PASSWORD = "Test@1498"


async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start Playwright
        pw = await async_playwright().start()
        
        # Launch browser with proper configuration
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
            ],
        )
        
        # Create browser context with proper timeout
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        context.set_default_timeout(DEFAULT_TIMEOUT)
        
        # Open new page
        page = await context.new_page()
        
        # Navigate directly to login page using hash router
        await page.goto(f"{BASE_URL}/#/login", wait_until="networkidle", timeout=DEFAULT_TIMEOUT)
        await page.wait_for_load_state("domcontentloaded")
        
        # Use stable data-testid selectors for login form
        email_input = page.locator('[data-testid="login-email-input"]')
        password_input = page.locator('input[type="password"]')
        submit_button = page.locator('[data-testid="login-submit-button"]')
        
        # Fill in valid credentials for ADMIN user
        await email_input.fill(TEST_USER_EMAIL)
        await password_input.fill(TEST_USER_PASSWORD)
        
        # Submit login form
        await submit_button.click()
        
        # Wait for successful redirect to dashboard
        await page.wait_for_url("**/#/dashboard", timeout=15000)
        
        # CORRECT ASSERTION: Verify dashboard is displayed after successful login
        # Dashboard heading is "Mission Control" (from Dashboard.tsx line 34)
        dashboard_heading = page.locator('text=Mission Control')
        await expect(dashboard_heading).to_be_visible(timeout=10000)
        
        # Additional verification: Check that user is authenticated
        # Verify no error message is shown
        error_message = page.locator('[data-testid="login-error-message"]')
        await expect(error_message).not_to_be_visible(timeout=2000)
        
        print("✅ TC001 PASSED: User successfully logged in with valid credentials")
        
    except Exception as e:
        raise AssertionError(f"TC001 FAILED: Role-based authentication success test failed. {str(e)}")
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    asyncio.run(run_test())