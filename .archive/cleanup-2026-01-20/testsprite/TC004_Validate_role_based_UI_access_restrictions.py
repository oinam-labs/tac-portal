import asyncio
from playwright import async_api
from playwright.async_api import expect

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
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
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
        # -> Click on the Login button to start login as ADMIN user.
        frame = context.pages[-1]
        # Click the Login button to open login form
        elem = frame.locator('xpath=html/body/div/div/div/div/nav/div/div[2]/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input ADMIN user email and password, then click Sign In button.
        frame = context.pages[-1]
        # Input ADMIN user email
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

        frame = context.pages[-1]
        # Input ADMIN user password
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

        frame = context.pages[-1]
        # Click Sign In button to login as ADMIN user
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from ADMIN user and proceed to login as MANAGER role to verify UI components and navigation options.
        frame = context.pages[-1]
        # Click Sign Out button to log out ADMIN user
        elem = frame.locator('xpath=html/body/div/div/div/div/aside/nav/div[2]/div[2]/a[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the Sign Out button to log out ADMIN user.
        frame = context.pages[-1]
        # Click Sign Out button to log out ADMIN user
        elem = frame.locator('xpath=html/body/div/div/div/div/aside/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input MANAGER user credentials and click Sign In to login.
        frame = context.pages[-1]
        # Input MANAGER user email
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('manager@example.com')
        

        frame = context.pages[-1]
        # Input MANAGER user password
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('ManagerPass123')
        

        frame = context.pages[-1]
        # Click Sign In button to login as MANAGER user
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Request valid credentials for MANAGER and other roles or proceed with testing other roles if credentials available.
        frame = context.pages[-1]
        # Input ADMIN user email to login again for further testing
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('tapancargo@gmail.com')
        

        frame = context.pages[-1]
        # Input ADMIN user password
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test@1498')
        

        frame = context.pages[-1]
        # Click Sign In button to login as ADMIN user again
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from ADMIN user and proceed to login as next user role (OPS) to verify UI components and navigation options.
        frame = context.pages[-1]
        # Click Sign Out button to log out ADMIN user
        elem = frame.locator('xpath=html/body/div/div/div/div/aside/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input OPS user credentials and click Sign In to login as OPS user.
        frame = context.pages[-1]
        # Input OPS user email
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('ops@example.com')
        

        frame = context.pages[-1]
        # Input OPS user password
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('OpsPass123')
        

        frame = context.pages[-1]
        # Click Sign In button to login as OPS user
        elem = frame.locator('xpath=html/body/div/div/div/div/div[3]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Request valid credentials for OPS and other roles or proceed with testing other roles if credentials available.
        frame = context.pages[-1]
        # Click Back button to clear login form and return to initial login screen
        elem = frame.locator('xpath=html/body/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Log out from ADMIN user to proceed with testing other user roles for role-based UI verification.
        frame = context.pages[-1]
        # Click Sign Out button to log out ADMIN user
        elem = frame.locator('xpath=html/body/div/div/div/div/main/section[2]/div[3]/div/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=TAC').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Platform').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Solutions').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resources').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Toggle theme').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Login').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRUSTED SINCE 2010 • IMPHAL ↔ DELHI CORRIDOR').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tapan Associate').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cargo.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Your trusted cargo partner for over 15 years. Air cargo, surface transport, pickup & delivery, and professional packaging — connecting Imphal and New Delhi with reliability and speed.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Book a Shipment').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track Shipment').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Live Tracking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Route Optimization').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Express Delivery').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Secure Handling').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Performance Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=API Integration').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mobile App Access').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cloud Sync').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data Archiving').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI Logistics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=24/7 Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Driver Network').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Warehouse Ops').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Real-time Updates').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=System Design').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Intelligent Logistics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Real-time visibility into your supply chain with advanced tracking, AI-powered route optimization, and secure cargo handling.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Global Tracking Protocol').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Real-time telemetry for your high-value consignments.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GPS Telemetry').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Chain of Custody').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRACE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Recent Access:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAC882190').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAC-02531').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DEL-98234').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IMP-45621').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BOM-88219').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NYC-10293').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LHR-99283').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SATELLITE UPLINK ACTIVE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Trusted by businesses across Manipur').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kangla Global').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Siroi Logistics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Loktak Hydro').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ima Exports').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sangai Systems').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Barak Valley Corp').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Classic Group').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hills & Valley').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SYSTEM CAPABILITY // 03').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Operating Spectrum').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Multi-modal logistics infrastructure powered by autonomous systems and military-grade security protocols.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=EXPRESS AIR FREIGHT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Autonomous routing to next-flight-out for urgent payloads.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SECURE PACKAGING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Military-grade crating and biometric sealing for high-value assets.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ECO LAST MILE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Zero-emission electric fleet for urban delivery.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GROUND LOGISTICS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=High-capacity surface transport with real-time telemetry.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=02 // CORE_CAPABILITIES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Engineered for').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Maximum Velocity.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Global Telemetry').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Real-time tracking across 120+ countries with millisecond precision.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=View Coverage').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Instant Customs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Automated clearance documentation generation.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Learn more').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Predictive Routing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI-driven adjustments for weather and traffic.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=See algorithms').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Secure Chain').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Blockchain-verified custody logs at every node.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Security protocols').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hyper-Scale').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Elastic capacity for peak season demands.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Capacity planning').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ABOUT US').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Connecting Northeast India').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=to the Nation.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=(SERVICES)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=/01').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Air Cargo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=/02').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Surface Transport').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Reliable ground logistics connecting Northeast India to major cities. Temperature-controlled options available for sensitive cargo.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=/03').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Professional Packaging').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Serving You for 15+ Years').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=From Imphal to New Delhi and back — we deliver your cargo with care, speed, and reliability.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get a Quote').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=50k+').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Shipments Delivered').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=99%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Safe Arrival Rate').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=48h').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Imphal ↔ Delhi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GET IN TOUCH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We\'re here to help').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Have questions about your shipment? Chat with our AI assistant or reach out to our team directly.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Head Office').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Paona Bazar, Imphal, Manipur - 795001').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Main logistics hub and coordination center.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Phone Support').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=+91 98620 12345').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Available Mon-Sat, 9am to 6pm IST.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email Queries').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=support@taccargo.com').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We usually respond within 24 hours.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Working Hours').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mon - Sat: 9:00 AM - 6:00 PM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Closed on Sundays and National Holidays.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAC').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Advanced logistics for the modern world. Connecting Imphal and New Delhi with precision and speed.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Platform').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tracking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pricing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Company').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About Us').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Careers').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Legal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy Policy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Terms of Service').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2026 Tapan Associate Cargo. All rights reserved.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=System Status: OPTIMAL').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    