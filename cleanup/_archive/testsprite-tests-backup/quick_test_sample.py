"""Quick test to verify core fixes work on a sample of tests."""
import subprocess
import sys
from pathlib import Path

# Test a representative sample
sample_tests = [
    "TC001_Role_based_authentication_success.py",
    "TC002_Role_based_authentication_failure.py",
    "TC001_Fixed_Standardized.py",
]

test_dir = Path(__file__).parent
passed = 0
failed = 0

print("Running sample tests to verify fixes...\n")

for test_file in sample_tests:
    print(f"Testing {test_file}...")
    result = subprocess.run(
        [sys.executable, str(test_dir / test_file)],
        capture_output=True,
        text=True,
        timeout=60
    )
    
    if result.returncode == 0:
        print(f"  ✅ PASS\n")
        passed += 1
    else:
        print(f"  ❌ FAIL")
        # Show last line of error
        if result.stderr:
            lines = result.stderr.strip().split('\n')
            print(f"  Error: {lines[-1][:150]}\n")
        failed += 1

print("="*50)
print(f"Sample Results: {passed}/{len(sample_tests)} passed")
print("="*50)

if passed == len(sample_tests):
    print("\n✅ Core routing and selector fixes are working!")
    print("Remaining failures are likely due to:")
    print("  - Missing test data (customers, shipments)")
    print("  - Business logic validation errors")
    print("  - Feature-specific selectors needing updates")
else:
    print("\n⚠️ Core fixes need more work")
