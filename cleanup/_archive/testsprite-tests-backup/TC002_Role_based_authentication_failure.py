"""TC002: Role-based Authentication Failure Test"

Verifies that users with invalid credentials are shown appropriate
error messages and are NOT redirected to the dashboard.
"""

import asyncio
from playwright.async_api import async_playwright, expect

# Configuration
BASE_URL = "http://localhost:3000"
DEFAULT_TIMEOUT = 30000
INVALID_EMAIL = "invaliduser@example.com"
INVALID_PASSWORD = "wrongpassword123"


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
        
        
        # Enable console logging for debugging
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
        
        # Navigate directly to login page using hash router
        await page.goto(f"{BASE_URL}/#/login", wait_until="networkidle", timeout=DEFAULT_TIMEOUT)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)  # Wait for page load

        await page.wait_for_timeout(1000)  # Wait for real-time subscriptions
        # Wait for React to hydrate
        try:
            await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=15000)
        except:
            pass  # Continue if already mounted
        
        await page.wait_for_load_state("domcontentloaded")
        
        # Use stable data-testid selectors for login form
        email_input = page.locator('[data-testid="login-email-input"]')
        password_input = page.locator('[data-testid="login-password-input"]')
        submit_button = page.locator('[data-testid="login-submit-button"]')
        
        # Fill in invalid credentials
        await email_input.fill(INVALID_EMAIL)
        await password_input.fill(INVALID_PASSWORD)
        
        # Submit login form
        await submit_button.click()
        
        # Wait for error message to appear
        error_message = page.locator('[data-testid="login-error-message"]')
        await expect(error_message).to_be_visible(timeout=15000)
        
        # CORRECT ASSERTION: Check for actual error message from LoginPage.tsx
        # The actual error is "Invalid email or password. Please try again."
        # OR could be "Contact your administrator for account access." if user exists but no staff record
        error_text = await error_message.inner_text()
        
        # Verify error message contains expected text
        valid_error_messages = [
            "Invalid email or password",
            "Contact your administrator for account access",
            "Invalid login credentials"
        ]
        
        error_found = any(msg in error_text for msg in valid_error_messages)
        if not error_found:
            raise AssertionError(f"Expected authentication error message, got: {error_text}")
        
        # Verify user was NOT redirected to dashboard
        current_url = page.url
        if "dashboard" in current_url:
            raise AssertionError("User was incorrectly redirected to dashboard with invalid credentials")
        
        print(f"✅ TC002 PASSED: Authentication correctly rejected with message: {error_text}")
        
    except Exception as e:
        print(f"Test failed: {e}")
        raise AssertionError(f"TC002 FAILED: Role-based authentication failure test failed. {str(e)}")
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    asyncio.run(run_test())