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
                # Click on the Login button to navigate to login page
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the Sign In button to attempt login.
                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password, then click Sign In button to log in.
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Create a new manifest in OPEN status.
                # Click Back button to navigate or find manifest creation option
        await page.wait_for_selector('button:visible')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on the 'Manifests' menu item or button to navigate to manifests section for manifest creation.
                # Click on 'Manifests' menu item to go to manifests section
        await page.wait_for_selector('[data-testid="new-shipment-button"] to start creating a new manifest.
                # Click 'Create Manifest' button to create a new manifest
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Select Origin Hub, Destination Hub, pick a Flight Date, then click 'Next' to proceed to 'Add Shipments' step.
                # Open Origin Hub dropdown to select origin
        await page.wait_for_selector('xpath=html/body/div[4]/div[3]/div/div/div/div/div[2]/div/div/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Scroll down to reveal the dropdowns and try clicking the Origin Hub dropdown again.
        await page.mouse.wheel(0, 200)
        

                # Try clicking Origin Hub dropdown again after scroll
        await page.wait_for_selector('[data-testid="new-shipment-button"] to report the issue and stop testing
        await page.wait_for_selector('[data-testid="dashboard-page"]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Manifest creation successful')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Manifest creation, shipment assignment, and status transitions could not be verified due to manifest creation failure or inability to proceed with manifest creation steps as per the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    