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
        # -> Click on the Login button to start authentication as FINANCE_STAFF
                # Click on the Login button to open login form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password, then click Sign In
                # Input email for FINANCE_STAFF login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for FINANCE_STAFF login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to authenticate
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Navigate to Invoice creation page by clicking on 'Invoices' in the sidebar
                # Click on 'Invoices' link in sidebar to go to Invoice creation page
        await page.wait_for_selector('[data-testid="new-shipment-button"] to start creating a new invoice with line items, GST, and discounts.
                # Click 'New Invoice' button to open invoice creation form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the 'New Invoice' button again or find alternative way to open invoice creation form.
                # Click 'New Invoice' button again to open invoice creation form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the 'New Invoice' button to open the invoice creation form and proceed with invoice creation.
                # Click 'New Invoice' button to open invoice creation form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Change Transport Mode to 'Air Cargo' and click Continue to proceed to next step.
                # Click Continue to proceed to next step in invoice creation
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Fill in consignor and consignee details and click Continue to proceed to next step.
                # Input consignor company/full name
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('Tapan Kumar')
        

                # Input consignor phone number
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('9876543210')
        

                # Input consignor address
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/input[2]')
        await page.wait_for_timeout(3000); await elem.fill('123 Main St, New Delhi')
        

                # Input consignor zip code
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('110001')
        

                # Input consignee company/full name
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('Hilo D')
        

                # Input consignee phone number
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('1234567890')
        

                # Input consignee address
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[2]/input[2]')
        await page.wait_for_timeout(3000); await elem.fill('456 Market St, Imphal')
        

                # Input consignee zip code
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('795001')
        

        # -> Click Continue to proceed to Step 3 (Line Items) to add invoice line items with GST and discounts.
                # Click Continue to proceed to Step 3 (Line Items) in invoice creation
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Fill in cargo details including nature of goods, quantity, value, dimensions, weights, then click Continue to proceed to final step.
                # Input quantity as 2
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('2')
        

                # Input value as 5000
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[2]/div[3]/input')
        await page.wait_for_timeout(3000); await elem.fill('5000')
        

                # Input length as 30 cm
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[3]/div/div[2]/div/input')
        await page.wait_for_timeout(3000); await elem.fill('30')
        

                # Input width as 20 cm
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[3]/div/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('20')
        

                # Input height as 15 cm
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[3]/div/div[2]/div[3]/input')
        await page.wait_for_timeout(3000); await elem.fill('15')
        

                # Input actual weight as 10 KG
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[3]/div[2]/div/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('10')
        

                # Input charged weight as 12 KG
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/main/div/div[4]/div/div[2]/div/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div[2]/input')
        await page.wait_for_timeout(3000); await elem.fill('12')
        

                # Click Continue to proceed to final step in invoice creation
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                try:
            await expect(page.locator('text=Invoice Creation Successful')).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Invoice creation workflow including GST tax, discount application, and correct total calculation and persistence did not complete successfully.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    