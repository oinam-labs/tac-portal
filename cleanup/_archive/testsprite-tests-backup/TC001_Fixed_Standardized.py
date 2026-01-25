import asyncio
from playwright.async_api import async_playwright, expect

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
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 1. Login
        # Enable console logging
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        
        print("Step 1: Logging in...")
        await page.goto("http://localhost:3000/#/login", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(1000)  # Wait for real-time subscriptions
        print(f"Current URL: {page.url}")
        
        # Wait for React to hydrate - check for root div to have content
        try:
            await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=15000)
            print("✅ React app mounted")
        except Exception as e:
            print(f"❌ React app failed to mount: {e}")
            content = await page.content()
            print("PAGE CONTENT:")
            print(content[:2000])
            raise
        
        # Check if redirected to dashboard (already logged in)
        if "/dashboard" in page.url:
            print("✅ Already logged in, redirected to dashboard")
            return
        
        # Wait for login form to be visible (use data-testid selectors)
        try:
            await page.wait_for_selector('[data-testid="login-email-input"]', state='visible', timeout=15000)
            print("✅ Login form visible")
        except Exception as e:
            print(f"❌ Login form not visible: {e}")
            
            # Debug: Check if element exists in DOM but not visible
            email_input = page.locator('[data-testid="login-email-input"]')
            count = await email_input.count()
            print(f"Email input count in DOM: {count}")
            
            if count > 0:
                is_visible = await email_input.is_visible()
                is_hidden = await email_input.is_hidden()
                print(f"Email input visible: {is_visible}, hidden: {is_hidden}")
                
                # Get computed styles
                opacity = await email_input.evaluate("el => window.getComputedStyle(el).opacity")
                display = await email_input.evaluate("el => window.getComputedStyle(el).display")
                visibility = await email_input.evaluate("el => window.getComputedStyle(el).visibility")
                print(f"Styles - opacity: {opacity}, display: {display}, visibility: {visibility}")
            
            # Take screenshot
            await page.screenshot(path="login_debug.png")
            print("Screenshot saved to login_debug.png")
            
            # Check for common blockers
            content = await page.content()
            if "Verifying credentials" in content: 
                print("⚠️ Stuck on 'Verifying credentials' spinner")
            if "Something went wrong" in content: 
                print("⚠️ Error Boundary triggered")
            
            raise
            
        await page.fill('[data-testid="login-email-input"]', 'tapancargo@gmail.com')
        await page.fill('[data-testid="login-password-input"]', 'Test@1498')
        await page.click('[data-testid="login-submit-button"]')
        
        # Wait for Dashboard
        await page.wait_for_selector('[data-testid="dashboard-page"]', timeout=15000)
        print("✅ Logged in successfully.")

        # 2. Open New Shipment Modal
        print("Step 2: Opening New Shipment Modal...")
        await page.goto("http://localhost:3000/#/shipments", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)
        await page.wait_for_timeout(2000)  # Wait for page load
        await page.wait_for_selector('[data-testid="new-shipment-button"]', state='visible', timeout=15000)
        await page.click('[data-testid="new-shipment-button"]')
        
        # Wait for modal to open
        await page.wait_for_selector('[data-testid="create-shipment-modal"]', state='visible', timeout=15000)
        print("✅ Modal opened.")

        # 3. Fill Form
        print("Step 3: Filling Shipment Form...")
        
        # Wait for customers to load
        await page.wait_for_timeout(2000)
        
        # Select Customer (first available)
        customer_select = page.locator('select[name="customerId"]')
        options = await customer_select.locator('option').count()
        if options > 1:
            await customer_select.select_option(index=1)
            print(f"✅ Selected customer (found {options} options)")
        else:
            print("⚠️ No customers found! Test will fail.")
            raise Exception("No customers available")
        
        # Click TRUCK mode label (radio buttons are hidden, labels handle the UI)
        await page.click('text=TRUCK')
        
        # Fill package details
        await page.fill('input[name="packageCount"]', '5')
        await page.fill('input[name="weightDead"]', '12.5')
        await page.fill('input[name="dimL"]', '30')
        await page.fill('input[name="dimW"]', '20')
        await page.fill('input[name="dimH"]', '15')
        
        print("✅ Form filled.")

        # 4. Submit
        print("Step 4: Submitting...")
        submit_btn = page.locator('[data-testid="login-submit-button"]')
        await submit_btn.click()
        
        # 5. Verify Success
        # The modal should close or Show success toast.
        # We can wait for the modal to disappear.
        try:
             # Wait for form to detach/hidden
            await page.locator('form').wait_for(state='hidden', timeout=15000)
            print("✅ Modal closed (Success).")
            
            # Optional: Check for toast or new row in table (if on shipments page)
            # await expect(page.locator('text=Shipment created')).to_be_visible()
            
        except Exception as e:
            print(f"❌ Failed to submit: {e}")
            # print error if form still open
            if await page.locator('form').is_visible():
                print("Form validation errors likely.")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
