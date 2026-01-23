"""
Base Test Configuration for TAC Cargo Portal TestSprite Tests

This module provides common setup, utilities, and page object patterns
for all TestSprite tests.
"""

import asyncio
from playwright.async_api import async_playwright, expect, Page, BrowserContext

# Configuration
BASE_URL = "http://localhost:3000"
DEFAULT_TIMEOUT = 30000  # 30 seconds for API-dependent tests

# Test credentials
TEST_USER_EMAIL = "tapancargo@gmail.com"
TEST_USER_PASSWORD = "Test@1498"

# Invalid credentials for failure tests
INVALID_EMAIL = "invaliduser@example.com"
INVALID_PASSWORD = "wrongpassword123"


async def create_browser_context(pw):
    """Create a browser context with proper configuration."""
    browser = await pw.chromium.launch(
        headless=True,
        args=[
            "--window-size=1280,720",
            "--disable-dev-shm-usage",
            "--ipc=host",
        ],
    )
    
    context = await browser.new_context(
        viewport={"width": 1280, "height": 720}
    )
    context.set_default_timeout(DEFAULT_TIMEOUT)
    
    return browser, context


async def navigate_to_login(page: Page):
    """Navigate to the login page using hash router."""
    await page.goto(f"{BASE_URL}/#/login", wait_until="networkidle", timeout=DEFAULT_TIMEOUT)
    await page.wait_for_load_state("domcontentloaded")


async def navigate_to_page(page: Page, route: str):
    """Navigate to a specific page using hash router."""
    await page.goto(f"{BASE_URL}/#{route}", wait_until="networkidle", timeout=DEFAULT_TIMEOUT)
    await page.wait_for_load_state("domcontentloaded")


async def login_user(page: Page, email: str = TEST_USER_EMAIL, password: str = TEST_USER_PASSWORD):
    """
    Perform login using stable data-testid selectors.
    Returns True if login was successful, False otherwise.
    """
    await navigate_to_login(page)
    
    # Use data-testid selectors for stability
    email_input = page.locator('[data-testid="login-email-input"]')
    password_input = page.locator('[data-testid="login-password-input"]')
    submit_button = page.locator('[data-testid="login-submit-button"]')
    
    # Fill login form
    await email_input.fill(email)
    await password_input.fill(password)
    await submit_button.click()
    
    # Wait for navigation or error
    try:
        await page.wait_for_url("**/#/dashboard", timeout=15000)
        return True
    except:
        return False


async def login_and_navigate(page: Page, route: str):
    """Login and navigate to a specific page."""
    success = await login_user(page)
    if success:
        await navigate_to_page(page, route)
    return success


async def wait_for_element(page: Page, selector: str, timeout: int = 10000):
    """Wait for an element to be visible with custom timeout."""
    element = page.locator(selector)
    await element.wait_for(state="visible", timeout=timeout)
    return element


async def get_error_message(page: Page):
    """Get the login error message if present."""
    error_element = page.locator('[data-testid="login-error-message"]')
    try:
        await error_element.wait_for(state="visible", timeout=10000)
        return await error_element.inner_text()
    except:
        return None


async def click_sidebar_link(page: Page, link_text: str):
    """Click a sidebar navigation link by its text."""
    link = page.locator(f'nav a:has-text("{link_text}")')
    await link.click()
    await page.wait_for_load_state("networkidle")


class TestRunner:
    """Base class for running TestSprite tests with proper cleanup."""
    
    def __init__(self):
        self.pw = None
        self.browser = None
        self.context = None
        self.page = None
    
    async def setup(self):
        """Initialize Playwright and browser."""
        self.pw = await async_playwright().start()
        self.browser, self.context = await create_browser_context(self.pw)
        self.page = await self.context.new_page()
    
    async def teardown(self):
        """Clean up browser resources."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.pw:
            await self.pw.stop()
    
    async def run(self, test_func):
        """Run a test with proper setup and teardown."""
        try:
            await self.setup()
            await test_func(self.page)
        finally:
            await self.teardown()


async def run_test_with_runner(test_func):
    """Utility function to run a test with the TestRunner."""
    runner = TestRunner()
    await runner.run(test_func)
