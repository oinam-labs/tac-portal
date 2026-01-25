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
        # -> Click the Login button to navigate to the login page.
                # Click the Login button to go to the login page.
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password for the first role (ADMIN) and click Sign In.
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to attempt login
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Verify credentials and retry login or check for error messages.
                # Re-input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Re-input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to attempt login again
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Systematically click and verify access to each major module (Shipments, Manifests, Scanning, Finance, Exceptions, Management) for ADMIN role.
                # Click Shipments module
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click and verify access to Manifests module for ADMIN role.
                # Click Manifests module in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a[3]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click and verify access to Scanning module for ADMIN role.
                # Click Scanning module in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a[4]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click and verify access to Finance module for ADMIN role.
                # Click Invoices (Finance) module in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[3]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click and verify access to Exceptions module for ADMIN role.
                # Click Exceptions module in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a[6]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click and verify access to Customers module for ADMIN role.
                # Click Customers module in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[3]/div[2]/a[2]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the Management module link (anchor tag) with index 13 to verify access for ADMIN role.
                # Click Management module link in navigation menu
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[3]/div[2]/a[3]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Attempt to access any unauthorized modules or routes for ADMIN role to confirm they are blocked, then test direct API endpoint access for protected resources.
                # Click Settings module to verify if ADMIN role has access or is blocked
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[4]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Access Granted to Unauthorized Module')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: The test plan execution has failed because users with different roles were not able to access only permitted modules and routes according to RBAC policies. Unauthorized access was not properly blocked as expected.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    