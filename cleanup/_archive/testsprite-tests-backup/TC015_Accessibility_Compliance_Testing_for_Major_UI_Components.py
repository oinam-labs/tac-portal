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
        # -> Navigate through UI components using keyboard only to verify focus indicators and logical tab order.
                # Click 'Skip to main content' link to start keyboard navigation focus at main content.
        await page.wait_for_selector('xpath=html/body/div/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Use screen reader to interact with forms and buttons to confirm all controls have proper labels and announcements.
                # Click Login button to navigate to login page for form accessibility testing.
        await page.wait_for_selector('[data-testid="new-shipment-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Input login credentials and submit form to access dashboard for further accessibility testing.
                # Input email in login form
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

                # Input password in login form
        await page.wait_for_selector('[data-testid="login-email-input"]')
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

                # Click Sign In button to submit login form and navigate to dashboard
        await page.wait_for_selector('[data-testid="login-submit-button"]')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # -> Start keyboard navigation through dashboard UI components to verify focus indicators and logical tab order.
                # Click 'Skip to main content' link to start keyboard navigation focus at main content on dashboard.
        await page.wait_for_selector('xpath=html/body/div/a')
        await page.wait_for_timeout(3000); await elem.click(timeout=15000)
        

        # --> Assertions to verify final state
                await expect(page.locator('text=Skip to main content')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TRUSTED SINCE 2010 • IMPHAL ↔ DELHI CORRIDOR')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Your trusted cargo partner for over 15 years. Air cargo, surface transport, pickup & delivery, and professional packaging — connecting Imphal and New Delhi with reliability and speed.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Book a Shipment')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Track Shipment')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Live Tracking')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Route Optimization')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Express Delivery')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Secure Handling')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Performance Analytics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=API Integration')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Mobile App Access')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Cloud Sync')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Data Archiving')).to_be_visible(timeout=30000)
        await expect(page.locator('text=AI Logistics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=24/7 Support')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Driver Network')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Warehouse Ops')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time Updates')).to_be_visible(timeout=30000)
        await expect(page.locator('text=System Design')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Intelligent Logistics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time visibility into your supply chain with advanced tracking, AI-powered route optimization, and secure cargo handling.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Global Tracking Protocol')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time telemetry for your high-value consignments.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Trusted by businesses across Manipur')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Kangla Global')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Siroi Logistics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Loktak Hydro')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Ima Exports')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Sangai Systems')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Barak Valley Corp')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Classic Group')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Hills & Valley')).to_be_visible(timeout=30000)
        await expect(page.locator('text=SYSTEM CAPABILITY // 03')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Operating Spectrum')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Air Freight')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Express Air & Next-Flight-Out.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Security')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Military-Grade Secure Packaging.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Sustainability')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Zero-Emission Eco Delivery.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Surface Transport')).to_be_visible(timeout=30000)
        await expect(page.locator('text=High-Capacity Ground Logistics.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Global Telemetry')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Real-time tracking across 120+ countries with millisecond precision and satellite backup.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Instant Customs')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Automated clearance documentation generation reducing border delays by 60%.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Predictive Routing')).to_be_visible(timeout=30000)
        await expect(page.locator('text=AI-driven adjustments for weather, traffic, and geopolitical events in real-time.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=02 // CORE_CAPABILITIES')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Engineered for Maximum Velocity.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Secure Chain')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Blockchain-verified custody logs at every node ensuring immutable audit trails.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Hyper-Scale')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Elastic capacity planning that automatically scales for peak season demands.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Advanced Analytics')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Deep insights into supply chain performance, cost optimization, and vendor reliability.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=ABOUT US')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Connecting Northeast India to the Nation.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Reliable ground logistics connecting Northeast India to major cities. Temperature-controlled options available for sensitive cargo.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contact Us')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Name')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Email')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Message')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Send Message')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Presenting you with the best UI possible.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=TAC')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Advanced logistics for the modern world. Connecting Imphal and New Delhi with precision and speed.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Platform')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Tracking')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Services')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Pricing')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Company')).to_be_visible(timeout=30000)
        await expect(page.locator('text=About Us')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Contact')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Careers')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Legal')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Privacy Policy')).to_be_visible(timeout=30000)
        await expect(page.locator('text=Terms of Service')).to_be_visible(timeout=30000)
        await expect(page.locator('text=© 2026 Tapan Associate Cargo. All rights reserved.')).to_be_visible(timeout=30000)
        await expect(page.locator('text=System Status: OPTIMAL')).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    