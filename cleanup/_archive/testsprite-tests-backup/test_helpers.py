"""
Reusable test helpers for Playwright tests.
Provides common functions for login, navigation, and form interactions.
"""

async def login_user(page, email='tapancargo@gmail.com', password='Test@1498'):
    """
    Login to the application.
    
    Args:
        page: Playwright page object
        email: User email (default: tapancargo@gmail.com)
        password: User password (default: Test@1498)
    """
    await page.goto("http://localhost:3000/#/login", wait_until="networkidle", timeout=60000)
    
    # Wait for React to hydrate
    try:
        await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=10000)
    except:
        pass
    
    # Check if already logged in
    if "/dashboard" in page.url or "#/dashboard" in page.url:
        return True
    
    # Wait for login form
    await page.wait_for_selector('[data-testid="login-email-input"]', state='visible', timeout=10000)
    
    # Fill login form
    await page.fill('[data-testid="login-email-input"]', email)
    await page.fill('[data-testid="login-password-input"]', password)
    await page.click('[data-testid="login-submit-button"]')
    
    # Wait for dashboard
    await page.wait_for_selector('[data-testid="dashboard-page"]', timeout=15000)
    
    return True


async def navigate_to_module(page, module):
    """
    Navigate to a specific module.
    
    Args:
        page: Playwright page object
        module: Module name (shipments, manifests, scanning, customers, etc.)
    """
    await page.goto(f"http://localhost:3000/#/{module}", wait_until="networkidle", timeout=30000)
    
    # Wait for page to load
    await page.wait_for_timeout(1000)


async def create_shipment(page, customer_index=1):
    """
    Create a new shipment through the UI.
    
    Args:
        page: Playwright page object
        customer_index: Index of customer to select (default: 1)
    
    Returns:
        bool: True if successful
    """
    # Navigate to shipments
    await navigate_to_module(page, 'shipments')
    
    # Click new shipment button
    await page.wait_for_selector('[data-testid="new-shipment-button"]', state='visible', timeout=10000)
    await page.click('[data-testid="new-shipment-button"]')
    
    # Wait for modal
    await page.wait_for_selector('[data-testid="create-shipment-modal"]', state='visible', timeout=10000)
    
    # Wait for customers to load
    await page.wait_for_timeout(2000)
    
    # Select customer
    customer_select = page.locator('select[name="customerId"]')
    options = await customer_select.locator('option').count()
    if options > customer_index:
        await customer_select.select_option(index=customer_index)
    else:
        raise Exception(f"Not enough customers (found {options}, need {customer_index+1})")
    
    # Click TRUCK mode (radio button via label)
    await page.click('text=TRUCK')
    
    # Fill package details
    await page.fill('input[name="packageCount"]', '5')
    await page.fill('input[name="weightDead"]', '12.5')
    await page.fill('input[name="dimL"]', '30')
    await page.fill('input[name="dimW"]', '20')
    await page.fill('input[name="dimH"]', '15')
    
    # Submit form
    await page.click('button[type="submit"]')
    
    # Wait for modal to close
    try:
        await page.wait_for_selector('[data-testid="create-shipment-modal"]', state='hidden', timeout=10000)
        return True
    except:
        return False


async def wait_for_page_load(page, timeout=10000):
    """
    Wait for page to fully load with React hydration.
    
    Args:
        page: Playwright page object
        timeout: Maximum wait time in milliseconds
    """
    try:
        await page.wait_for_function(
            "document.querySelector('#root').children.length > 0", 
            timeout=timeout
        )
        await page.wait_for_load_state('networkidle', timeout=timeout)
    except:
        pass  # Continue if already loaded


async def check_element_exists(page, selector, timeout=5000):
    """
    Check if an element exists without throwing error.
    
    Args:
        page: Playwright page object
        selector: CSS selector
        timeout: Maximum wait time in milliseconds
    
    Returns:
        bool: True if element exists and is visible
    """
    try:
        await page.wait_for_selector(selector, state='visible', timeout=timeout)
        return True
    except:
        return False


async def get_table_row_count(page, table_selector='table'):
    """
    Get the number of rows in a table.
    
    Args:
        page: Playwright page object
        table_selector: CSS selector for the table
    
    Returns:
        int: Number of rows (excluding header)
    """
    try:
        rows = await page.locator(f'{table_selector} tbody tr').count()
        return rows
    except:
        return 0


async def click_button_by_text(page, text, timeout=10000):
    """
    Click a button by its text content.
    
    Args:
        page: Playwright page object
        text: Button text to search for
        timeout: Maximum wait time in milliseconds
    
    Returns:
        bool: True if successful
    """
    try:
        await page.click(f'button:has-text("{text}")', timeout=timeout)
        return True
    except:
        return False


async def fill_form_field(page, name, value):
    """
    Fill a form field by name attribute.
    
    Args:
        page: Playwright page object
        name: Field name attribute
        value: Value to fill
    """
    selector = f'input[name="{name}"], select[name="{name}"], textarea[name="{name}"]'
    await page.fill(selector, str(value))


async def select_dropdown_option(page, name, value=None, index=None):
    """
    Select an option from a dropdown.
    
    Args:
        page: Playwright page object
        name: Select name attribute
        value: Option value to select (optional)
        index: Option index to select (optional)
    """
    selector = f'select[name="{name}"]'
    if value is not None:
        await page.select_option(selector, value=value)
    elif index is not None:
        await page.select_option(selector, index=index)
