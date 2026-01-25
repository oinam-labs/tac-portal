"""
Batch fix all TestSprite test files to work with HashRouter and correct selectors.
"""
import os
import re
from pathlib import Path

def fix_test_file(filepath):
    """Apply fixes to a single test file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix 1: Update URLs to use HashRouter format (/#/)
    content = re.sub(
        r'http://localhost:3000/([^"\'#\s]+)',
        r'http://localhost:3000/#/\1',
        content
    )
    
    # Fix 2: Replace generic input selectors with data-testid
    # Login form selectors
    content = content.replace('input[type="email"]', '[data-testid="login-email-input"]')
    content = content.replace('input[type="password"]', '[data-testid="login-password-input"]')
    content = content.replace('button[type="submit"]', '[data-testid="login-submit-button"]')
    
    # Fix 3: Add wait for React hydration after goto
    if 'await page.goto(' in content and 'wait_for_function' not in content:
        # Add networkidle wait
        content = re.sub(
            r'await page\.goto\("([^"]+)"\)',
            r'await page.goto("\1", wait_until="networkidle", timeout=60000)',
            content
        )
        
        # Add React mount check after first goto
        if 'wait_for_function' not in content:
            goto_pattern = r'(await page\.goto\([^)]+\)\s*\n)'
            replacement = r'''\1
        # Wait for React to hydrate
        try:
            await page.wait_for_function("document.querySelector('#root').children.length > 0", timeout=10000)
        except:
            pass  # Continue if already mounted
        
'''
            content = re.sub(goto_pattern, replacement, content, count=1)
    
    # Fix 4: Fix dashboard page selector
    content = content.replace('data-testid="dashboard"', 'data-testid="dashboard-page"')
    
    # Fix 5: Add console logging if not present
    if 'page.on("console"' not in content and 'async with async_playwright()' in content:
        content = re.sub(
            r'(page = await context\.new_page\(\)\s*\n)',
            r'''\1        
        # Enable console logging
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        
''',
            content
        )
    
    # Only write if changes were made
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    test_dir = Path(__file__).parent
    test_files = list(test_dir.glob('TC*.py'))
    
    print(f"Found {len(test_files)} test files to fix...")
    
    fixed_count = 0
    for test_file in test_files:
        if test_file.name == 'TC001_Fixed_Standardized.py':
            print(f"⏭️  Skipping {test_file.name} (already fixed)")
            continue
            
        try:
            if fix_test_file(test_file):
                print(f"✅ Fixed {test_file.name}")
                fixed_count += 1
            else:
                print(f"⏭️  No changes needed for {test_file.name}")
        except Exception as e:
            print(f"❌ Error fixing {test_file.name}: {e}")
    
    print(f"\n✅ Fixed {fixed_count} test files")
    print(f"⏭️  Skipped {len(test_files) - fixed_count} files")

if __name__ == "__main__":
    main()
