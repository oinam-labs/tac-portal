"""Fix syntax errors and .first selector issues."""
import re
from pathlib import Path

def fix_syntax_and_selectors(filepath):
    """Fix syntax errors and problematic selectors."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix unterminated strings (look for odd number of quotes on a line)
    lines = content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines):
        # Check for unterminated strings
        if line.count('"') % 2 != 0 and not line.strip().startswith('#'):
            # Try to fix by adding closing quote at end
            if not line.rstrip().endswith('"'):
                line = line.rstrip() + '"'
        
        # Remove .first from selectors - it causes issues
        line = re.sub(r'\.locator\(([^)]+)\)\.first', r'.locator(\1)', line)
        line = re.sub(r'\.wait_for_selector\(([^)]+)\)\.first', r'.wait_for_selector(\1)', line)
        
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    # Remove any .first() calls
    content = content.replace('.first()', '')
    content = content.replace('.first', '')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    test_dir = Path(__file__).parent
    test_files = sorted(test_dir.glob('TC*.py'))
    
    print("Fixing syntax errors and .first selectors...")
    fixed = 0
    
    for test_file in test_files:
        try:
            if fix_syntax_and_selectors(test_file):
                print(f"✅ {test_file.name}")
                fixed += 1
        except Exception as e:
            print(f"❌ {test_file.name}: {e}")
    
    print(f"\n✅ Fixed {fixed} files")

if __name__ == "__main__":
    main()
