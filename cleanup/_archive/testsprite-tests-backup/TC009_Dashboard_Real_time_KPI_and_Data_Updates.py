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
        # -> Click the Login button to go to the login page.
                # Click the Login button to navigate to the login page.
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password, then click Sign In to log in as the test user.
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click the Refresh button to simulate or trigger data refresh and real-time update on dashboard.
                # Click Refresh button to trigger data refresh and real-time update on dashboard
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Log out and log in as a different user role to verify role-based dashboard filtering.
                # Click user profile button to open user menu for logout
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Click the 'Sign out' option to log out from the current user session.
                # Click 'Sign out' option to log out from current user session
        await page.wait_for_selector('xpath=html/body/div[3]/div/div[5]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password for the second user role, then click Sign In to log in.
                # Input email for login as second user role
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login as second user role
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form for second user role
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Navigate away from dashboard to another page to verify realtime subscriptions are terminated properly.
                # Click Analytics link to navigate away from dashboard and trigger subscription cleanup
        await page.wait_for_selector('[data-testid="new-shipment-button"] to open user menu for logout
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Scroll down to try to reveal the user profile button or menu for logout option.
        await page.mouse.wheel(0, 200)
        

        # -> Click the user profile button to open the menu and then click 'Sign out' to log out from current user session.
                # Click user profile button to open user menu for logout
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                await expect(page.locator('text=TAC CARGO')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Dashboard')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Analytics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Shipments')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Tracking')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Manifests')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Scanning')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Inventory')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Exceptions')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Invoices')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Customers')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Management')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Settings')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Test Admin User')).to_be_visible(timeout=30000)
        await expect(page.locator('text=tapancargo@gmail.com')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Operations Analytics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Shipment Volume (In/Out)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Showing total shipments for the last 6 months')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Aug')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Sep')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Oct')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Nov')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Dec')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Jan')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Inbound (Arrived)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Outbound (Created)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Trending up by 5.2% this month')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Current Fleet Status')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Shipment status breakdown')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Delivered')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Delayed')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Exceptions')).to_be_visible(timeout=30000)
        await expect(page.locator('text=On Track')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Delivery rate up by 8.1%')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TOTAL VOLUME (6M)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1100')).to_be_visible(timeout=30000)
        await expect(page.locator('text=+12%')).to_be_visible(timeout=30000)
        await expect(page.locator('text=SLA ADHERENCE')).to_be_visible(timeout=30000)
        await expect(page.locator('text=98.2%')).to_be_visible(timeout=30000)
        await expect(page.locator('text=+2.1%')).to_be_visible(timeout=30000)
        await expect(page.locator('text=DELIVERED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ACTIVE EXCEPTIONS')).to_be_visible(timeout=30000)
        await expect(page.locator('text=2')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Test Admin User')).to_be_visible(timeout=30000)
        await expect(page.locator('text=tapancargo@gmail.com')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Profile')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Billing')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Settings')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Sign out')).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    