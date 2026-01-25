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
        # -> Click on the Login button to start login process
                # Click on the Login button to open login form
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input email and password, then click Sign In button
                # Input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Retry login by inputting email and password again and clicking Sign In
                # Retry input email for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Retry input password for login
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Retry click Sign In button to submit login form
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on 'Management' menu item to access audit log viewer page
                # Click on Management menu item to access audit log viewer page
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[3]/div[2]/a[3]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on 'System' menu item to check for audit log viewer or audit logs section
                # Click on System menu to find audit log viewer or audit logs section
        await page.wait_for_selector('[data-testid="dashboard-page"]/aside/nav/div[4]/div[2]/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Click on the 'Audit Logs' tab to view audit log entries
                # Click on Audit Logs tab to access audit log viewer
        await page.wait_for_selector('[data-testid="new-shipment-button"][3]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Use filtering controls to filter audit logs by operation type (e.g., INSERT, UPDATE, DELETE) and date range to verify filtering works correctly.
                # Click on search input to filter audit logs by operation type or date range
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/header/div/div/input')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Filter audit logs by operation type INSERT
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/header/div/div/input')
        await page.wait_for_timeout(3000); await elem.fill('INSERT')
        

                # Trigger filter/search for audit logs
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/header/div/div/input')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Filter audit logs by a specific date range to verify date filtering works correctly.
                # Click on search input to clear or modify filter
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/header/div/div/input')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

                # Filter audit logs by date range from 2026-01-19 to 2026-01-21
        await page.wait_for_selector('[data-testid="dashboard-page"]/div/header/div/div/input')
        await page.wait_for_timeout(3000); await elem.fill('2026-01-19 to 2026-01-21')
        

                # Trigger filter/search for audit logs by date range
        await page.wait_for_selector('[data-testid="new-shipment-button"] to export audit logs to CSV or other formats and verify exported file contains accurate audit log data.
                # Click on export button to export audit logs
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                await expect(page.locator('text=System Audit Logs')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 10:19:49 PM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (e0fe0d0d-d321-4453-9651-7ef12d16e2fd)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0013')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=802')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ISSUED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 9:51:45 AM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (c28ef15d-a776-49e1-a67f-12df63c0d5e9)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0012')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=3918')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ISSUED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 9:47:34 AM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (af78ba50-8740-4da3-b440-f7c13305694b)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0011')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=4342')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ISSUED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 9:39:58 AM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (058c261d-74e7-4f2d-840c-24355d82987d)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0010')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1280')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ISSUED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 9:34:08 AM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (82137f6d-673b-4a33-b599-323f417c74dc)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0009')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1510')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ISSUED')).to_be_visible(timeout=30000)
        await expect(page.locator('text=1/21/2026, 9:17:58 AM')).to_be_visible(timeout=30000)
        await expect(page.locator('text=7ff4d1ea-3b78-4e50-8c05-f5570a356c1e')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INSERT')).to_be_visible(timeout=30000)
        await expect(page.locator('text=invoices (dc367b94-bf19-4387-a69d-eafdb3db7718)')).to_be_visible(timeout=30000)
        await expect(page.locator('text=INV-2026-0008')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contents: Personal Effects | Payment: TO_PAY')).to_be_visible(timeout=30000)
        await expect(page.locator('text=802')).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    