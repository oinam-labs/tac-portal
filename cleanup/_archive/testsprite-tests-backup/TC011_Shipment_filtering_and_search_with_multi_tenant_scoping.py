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
        # -> Locate and click on the login or sign-in button or link to access the login form.
        await page.mouse.wheel(0, 300)
        

        # -> Click the login button to open the login form.
                # Click the Login button to open the login form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on the email input field to focus it, then send keys to input the email address, followed by password and sign in.
                # Click on email input field to focus
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Input email address after focusing
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Click on password input field to focus
        await page.wait_for_selector('form/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Input password after focusing
        await page.wait_for_selector('form/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Locate and open the shipment list or shipment management section to apply filters and perform search.
                # Click on 'Welcome back, Boss!' or relevant dashboard element to navigate to shipment list or menu
        await page.wait_for_selector('xpath=html/body/div/div/section/ol/li')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        await page.mouse.wheel(0, 300)
        

        # -> Click on the 'Shipments' menu item to open the shipment list page.
                # Click on 'Shipments' menu item to open shipment list
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Apply status filter to shipments and verify results are scoped to user's organization and hub.
                # Click on 'Status' filter header to open status filter options
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[2]/div[2]/table/thead/tr/th[7]/div')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Unauthorized Shipment Access Detected')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Shipment list filters and search did not properly constrain results within user's organization and hub scope, leading to potential data leakage.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    