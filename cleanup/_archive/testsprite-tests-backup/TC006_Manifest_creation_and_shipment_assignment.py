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
        # -> Click on the Login button to start authentication as MANAGER.
                # Click on the Login button to open login form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input MANAGER email and password, then click the Sign In button to authenticate.
                # Input MANAGER email
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input MANAGER password
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Navigate to the Manifests page from the dashboard.
                # Click Back button to check if it leads to main navigation or manifests page
        await page.wait_for_selector('button:visible')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on the 'Manifests' link or button in the sidebar or main navigation to go to the Manifests page.
                # Click on the 'Manifests' link in the sidebar navigation
        await page.wait_for_selector('[data-testid="new-shipment-button"] to start creating a new manifest.
                # Click the 'Create Manifest' button to create a new manifest
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Select an origin hub to load available shipments for manifest creation.
                # Click 'Select origin' dropdown to choose origin hub
        await page.wait_for_selector('xpath=html/body/div[4]/form/div/div/div/div[2]/div/div/div/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the 'Create Manifest' button to open the manifest creation form again.
                # Click the 'Create Manifest' button to open the manifest creation form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the 'Select origin' dropdown to open origin hub options.
                # Click 'Select origin' dropdown to open origin hub options
        await page.wait_for_selector('xpath=html/body/div[4]/form/div/div/div/div[2]/div/div/div/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Select 'IMPHAL (IMF)' as the origin hub to load available shipments.
                # Select 'IMPHAL (IMF)' as the origin hub
        await page.wait_for_selector('xpath=html/body/div[4]/form/div/div/div/div[2]/div/div/div/div/div/div')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Select a destination hub to attempt loading shipments for the manifest.
                # Click 'Select destination' dropdown to open destination hub options
        await page.wait_for_selector('xpath=html/body/div[4]/form/div/div/div/div[2]/div/div[2]/div/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Select 'NEW DELHI (DEL)' as the destination hub to attempt loading shipments.
                # Select 'NEW DELHI (DEL)' as the destination hub
        await page.wait_for_selector('xpath=html/body/div[4]/form/div/div/div/div[2]/div/div[2]/div/div/div/div[2]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Close the 'Create Manifest' form and return to the Manifests page to check existing manifests and their statuses.
                # Click Close button to close the 'Create Manifest' form
        await page.wait_for_selector('xpath=html/body/div[4]/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Manifest Creation Successful')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Manifest creation, shipment assignment, and dispatch workflow status transitions could not be verified as the test plan execution failed.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    