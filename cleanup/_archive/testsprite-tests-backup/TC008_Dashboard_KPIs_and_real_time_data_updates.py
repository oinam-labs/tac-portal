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
        # -> Click on the Login button to proceed to login page.
                # Click on the Login button to navigate to login page.
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password, then click Sign In to login.
                # Input email address
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password
        await page.wait_for_selector('form/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Verify if there is any error message or alternative login method, or retry login.
                # Click Back button to return to previous page or homepage to retry login or check alternative options
        await page.wait_for_selector('button:visible')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click Login button to navigate to login page and retry login.
                # Click Login button to navigate to login page for retrying login
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Try to input email and password using alternative methods or check if autofill or clipboard paste is possible, then submit login.
                # Click email input field to focus
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Click password input field to focus
        await page.wait_for_selector('form/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Trigger a data change affecting dashboard KPIs or recent activity via another client or backend to test real-time updates.
        await page.goto('http://localhost:3000/#/shipments', timeout=15000)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)  # Wait for page load
        await asyncio.sleep(3)
        

        # -> Create a new shipment to trigger a data change affecting dashboard KPIs and recent activity.
                # Click New Shipment button to create a new shipment and trigger data change
        await page.wait_for_selector('[data-testid="new-shipment-button"][2]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Navigate back to Dashboard page to verify if any real-time updates are reflected after attempted shipment creation.
                # Click Dashboard link in sidebar to navigate back to dashboard page
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                await expect(page.locator('text=Mission Control')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time logistics overview and operations.')).to_be_visible(timeout=30000)
        await expect(page.locator('[data-testid="new-shipment-button"]')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Scan Package')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Manifests')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Print Labels')).to_be_visible(timeout=30000)
        await expect(page.locator('text=+12.5% 12')).to_be_visible(timeout=30000)
        await expect(page.locator('text=+8.1% 0')).to_be_visible(timeout=30000)
        await expect(page.locator('text=+4.3% 1')).to_be_visible(timeout=30000)
        await expect(page.locator('text=0%')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Last 3 months')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Nov 6')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Nov 19')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Dec 1')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Dec 14')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Dec 27')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Jan 9')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Jan 24')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Outbound')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Inbound')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time status overview')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Showing top 4 routes by manifest count')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Live shipment updates')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260012')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260011')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260010')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260009')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC20260008')).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    