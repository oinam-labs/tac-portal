"""
Comprehensive fix for all Playwright test files.
Fixes: XPath selectors, UTF-8 encoding, HashRouter URLs, login selectors.
"""
import os
import re
import sys
from pathlib import Path

def add_utf8_encoding(content):
    """Add UTF-8 encoding setup at the top of the file."""
    if 'sys.stdout.reconfigure' in content:
        return content
    
    # Add after imports
    import_block_end = content.find('\nasync def')
    if import_block_end == -1:
        import_block_end = content.find('\ndef ')
    
    if import_block_end > 0:
        utf8_code = """
# Configure UTF-8 encoding for Windows console
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

"""
        content = content[:import_block_end] + utf8_code + content[import_block_end:]
    
    return content

def fix_xpath_selectors(content):
    """Replace XPath selectors with proper CSS/data-testid selectors."""
    
    # Common XPath patterns and their replacements
    xpath_fixes = [
        # Login form XPaths
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/form/div\[2\]/input', '[data-testid="login-email-input"]'),
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/form/div/input', '[data-testid="login-email-input"]'),
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/form/div\[3\]/input', '[data-testid="login-password-input"]'),
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/form/button', '[data-testid="login-submit-button"]'),
        
        # Generic form XPaths - replace with more specific selectors
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/form', 'form'),
        (r'xpath=html/body/div/div/div/main/div/button', 'button:visible'),
        (r'xpath=html/body/div/div/div/main/div/div\[3\]/div\[2\]/button', 'button[type="submit"]'),
        
        # Dashboard XPaths
        (r'xpath=html/body/div/div/div/main/div', '[data-testid="dashboard-page"]'),
    ]
    
    for xpath_pattern, replacement in xpath_fixes:
        content = re.sub(xpath_pattern, replacement, content)
    
    # Remove any remaining xpath= prefixes and convert to CSS
    content = re.sub(r'locator\("xpath=([^"]+)"\)', r'locator("\1")', content)
    content = re.sub(r'wait_for_selector\("xpath=([^"]+)"', r'wait_for_selector("\1"', content)
    
    return content

def fix_login_selectors(content):
    """Fix login form selectors to use data-testid."""
    replacements = [
        ('input[type="email"]', '[data-testid="login-email-input"]'),
        ('input[type="password"]', '[data-testid="login-password-input"]'),
        ('button[type="submit"]', '[data-testid="login-submit-button"]'),
    ]
    
    for old, new in replacements:
        # Only replace in login context (near page.goto login)
        if 'login' in content.lower():
            content = content.replace(f'"{old}"', f'"{new}"')
            content = content.replace(f"'{old}'", f"'{new}'")
    
    return content

def fix_hashrouter_urls(content):
    """Fix URLs to use HashRouter format with /#/."""
    # Fix URLs that don't already have /#/
    content = re.sub(
        r'http://localhost:3000/(?!#/)([a-z\-]+)',
        r'http://localhost:3000/#/\1',
        content
    )
    
    # Add networkidle wait if missing
    if 'wait_until=' not in content and 'page.goto(' in content:
        content = re.sub(
            r'await page\.goto\("([^"]+)"\)',
            r'await page.goto("\1", wait_until="networkidle", timeout=60000)',
            content
        )
    
    return content

def add_react_hydration_check(content):
    """Add React hydration check after first page.goto."""
    if 'wait_for_function' in content:
        return content
    
    # Find first goto and add hydration check after it
    goto_pattern = r'(await page\.goto\([^)]+\)\s*\n)'
    hydration_check = r'''\1        # Wait for React to hydrate
        try:
            await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=10000)
        except:
            pass  # Continue if already mounted
        
'''
    
    content = re.sub(goto_pattern, hydration_check, content, count=1)
    return content

def add_console_logging(content):
    """Add console logging if not present."""
    if 'page.on("console"' in content:
        return content
    
    # Add after page creation
    page_creation = r'(page = await context\.new_page\(\)\s*\n)'
    console_logging = r'''\1        
        # Enable console logging for debugging
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
        
'''
    
    content = re.sub(page_creation, console_logging, content, count=1)
    return content

def fix_test_file(filepath):
    """Apply all fixes to a single test file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        # Try with different encoding
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()
    
    original = content
    
    # Apply all fixes
    content = add_utf8_encoding(content)
    content = fix_xpath_selectors(content)
    content = fix_login_selectors(content)
    content = fix_hashrouter_urls(content)
    content = add_react_hydration_check(content)
    content = add_console_logging(content)
    
    # Only write if changes were made
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    test_dir = Path(__file__).parent
    test_files = sorted(test_dir.glob('TC*.py'))
    
    print("="*60)
    print("COMPREHENSIVE TEST SUITE FIX")
    print("="*60)
    print(f"\nFound {len(test_files)} test files\n")
    
    fixed_count = 0
    skipped_count = 0
    error_count = 0
    
    for test_file in test_files:
        try:
            if fix_test_file(test_file):
                print(f"✅ Fixed: {test_file.name}")
                fixed_count += 1
            else:
                print(f"⏭️  Skipped: {test_file.name} (no changes needed)")
                skipped_count += 1
        except Exception as e:
            print(f"❌ Error: {test_file.name} - {str(e)[:50]}")
            error_count += 1
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"✅ Fixed: {fixed_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📊 Total: {len(test_files)}")
    print()
    
    if fixed_count > 0:
        print("✅ Fixes applied successfully!")
        print("\nNext steps:")
        print("  1. Run verification: python testsprite_tests/verify_fixes.py")
        print("  2. Run full suite: python run_all_tests.py")
    else:
        print("⚠️  No changes needed - tests may already be fixed")

if __name__ == "__main__":
    main()
