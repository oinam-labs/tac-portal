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
        

        # -> Input email and password, then click Sign In to log in.
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

        # -> Retry login by inputting email and password again and clicking Sign In.
                # Retry input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Retry input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Retry click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on 'Shipments' in the sidebar to start shipment operations.
                # Click on Shipments in the sidebar to access shipment operations
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[2]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Scroll down to reveal more navigation elements or try to click 'Shipments' link again.
        await page.mouse.wheel(0, 300)
        

                # Try clicking 'Shipments' link again after scrolling
        await page.wait_for_selector('[data-testid="new-shipment-button"] to create a new shipment.
                # Click on 'New Shipment' button to start creating a shipment
        await page.wait_for_selector('[data-testid="new-shipment-button"][2]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Fill in shipment creation form with required details and submit to create shipment.
                # Click 'New Shipment' button to open shipment creation form
        await page.wait_for_selector('[data-testid="new-shipment-button"][2]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Fill in shipment details: select customer, transport mode, service level, and input package details, then submit the form.
                # Select transport mode 'Air Cargo'
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[3]/div/div[2]/form/div[3]/div/div/label')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Select service level 'Standard'
        await page.wait_for_selector('[data-testid="new-shipment-button"] on the first shipment to open details for update
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on an editable field or button to update shipment details (e.g., change service level or package count).
                # Click 'Label' button to check if it allows editing or triggers update operation
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Audit Log Entry Not Found')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Audit logs for critical operations on shipments, invoices, manifests, and exceptions were not captured or viewable as required by the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    