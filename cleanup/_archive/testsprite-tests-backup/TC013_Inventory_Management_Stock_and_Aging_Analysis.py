import asyncio
from playwright import async_api
from playwright.async_api import expect

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
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        
        # Enable console logging for debugging
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)  # Wait for page load

        await page.wait_for_timeout(1000)  # Wait for real-time subscriptions
        # Wait for React to hydrate
        try:
            await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=15000)
        except:
            pass  # Continue if already mounted
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the Login button to go to the login page.
                # Click on the Login button to navigate to the login page.
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Try to focus on password field first, then input password, then input email and click Sign In.
                # Focus on password input field to enable typing
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Input password after focusing password field
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Click Sign In button to login
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Retry login or check for error messages on the login page.
                # Click Sign In button again to retry login
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on the Inventory menu item to access inventory management.
                # Click on Inventory menu to open inventory management section
        await page.wait_for_selector('[data-testid="new-shipment-button"] or link to add new inventory items with bin locations.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Look for an 'Add Item' or similar button to add new inventory items with bin locations.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

                # Click on user menu to check for inventory add options or settings related to inventory
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                await expect(page.locator('text=Inventory Management')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time stock view across hub network.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=All Hubs')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Imphal')).to_be_visible(timeout=30000)
        await expect(page.locator('text=New Delhi')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Total In Stock')).to_be_visible(timeout=30000)
        await expect(page.locator('text=6 Pkgs')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Aging Critical (24h+)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=3 Pkgs')).to_be_visible(timeout=30000)
        await expect(page.locator('text=AWB')).to_be_visible(timeout=30000)
        await expect(page.locator('text=PACKAGES')).to_be_visible(timeout=30000)
        await expect(page.locator('text=WEIGHT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=LOCATION HUB')).to_be_visible(timeout=30000)
        await expect(page.locator('text=STATUS')).to_be_visible(timeout=30000)
        await expect(page.locator('text=AGING')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260009')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1')).to_be_visible(timeout=30000)
        await expect(page.locator('text=50 kg')).to_be_visible(timeout=30000)
        await expect(page.locator('text=New Delhi Hub')).to_be_visible(timeout=30000)
        await expect(page.locator('text=CREATED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=12-24h')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260008')).to_be_visible(timeout=30000)
        await expect(page.locator('text=10')).to_be_visible(timeout=30000)
        await expect(page.locator('text=100 kg')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Imphal Hub')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260007')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260006')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1 kg')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260005')).to_be_visible(timeout=30000)
        await expect(page.locator('text=5')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260001')).to_be_visible(timeout=30000)
        await expect(page.locator('text=2')).to_be_visible(timeout=30000)
        await expect(page.locator('text=5.5 kg')).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    