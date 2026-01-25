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
        # -> Locate and click on the login or sign-in button to authenticate with provided credentials.
                # Click on 'Skip to main content' to ensure focus on main content area
        await page.wait_for_selector('[data-testid="new-shipment-button"] directly to try to reach the authentication page.
                # Click the 'Login' button to navigate to the login page
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password fields sequentially, then click Sign In button to authenticate.
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('form/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to authenticate
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Create a new manifest with status OPEN.
                # Click 'Back' button to navigate to main dashboard or manifest management area if applicable
        await page.wait_for_selector('button:visible')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Scroll down to reveal more elements and try to locate the 'Manifests' button or link to proceed with manifest lifecycle testing.
        await page.mouse.wheel(0, 300)
        

                # Click 'Manifests' button to open manifest management section
        await page.wait_for_selector('[data-testid="new-shipment-button"][3]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the 'Manifests' button to open the manifest management section and proceed with manifest lifecycle testing.
                # Click 'Manifests' button to open manifest management section
        await page.wait_for_selector('[data-testid="new-shipment-button"] to create a new manifest with status OPEN.
                # Click 'Create Manifest' button to start creating a new manifest
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Attempt to transition the newly created manifest status directly from OPEN to ARRIVED to test invalid transition rejection.
                # Click 'View' button for the newly created manifest with status OPEN to open details
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click 'Next' button to proceed to 'Review & Finalize' step and complete manifest creation as OPEN.
                # Click 'Next' button to proceed to 'Review & Finalize' step in manifest creation
        await page.wait_for_selector('xpath=html/body/div[3]/div[4]/div/div/span/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click 'Save as Open' button to create the manifest with status OPEN.
                # Click 'Save as Open' button to create manifest with status OPEN
        await page.wait_for_selector('xpath=html/body/div[3]/div[4]/div/div/div/button')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Refresh the Fleet Manifests page to reset DOM context and then locate the manifest with status OPEN to retry the invalid status transition test.
        await page.goto('http://localhost:3000/#/manifests', timeout=15000)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)  # Wait for page load
        await asyncio.sleep(3)
        

                # Click 'View' button for the manifest with status OPEN to open details
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Invalid Manifest Status Transition Attempted')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test failed: The system did not reject the invalid manifest status transition from OPEN directly to ARRIVED as required by the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    