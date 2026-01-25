"""Final verification that core test infrastructure fixes are working."""
import subprocess
import sys
from pathlib import Path

# Core tests that verify infrastructure fixes
verification_tests = [
    ("Authentication Success", "TC001_Role_based_authentication_success.py"),
    ("Authentication Failure", "TC002_Role_based_authentication_failure.py"),
    ("Dashboard KPIs", "TC003_Dashboard_real_time_KPI_and_activity_display.py"),
    ("Shipment Creation", "TC001_Fixed_Standardized.py"),
]

test_dir = Path(__file__).parent
passed = 0
failed = 0

print("="*60)
print("VERIFYING CORE TEST INFRASTRUCTURE FIXES")
print("="*60)
print()

for name, test_file in verification_tests:
    print(f"Testing: {name}")
    print(f"  File: {test_file}")
    
    try:
        import os
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        
        result = subprocess.run(
            [sys.executable, str(test_dir / test_file)],
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
            encoding='utf-8'
        )
        
        if result.returncode == 0:
            print(f"  ✅ PASS")
            passed += 1
        else:
            print(f"  ❌ FAIL")
            if result.stderr:
                lines = result.stderr.strip().split('\n')
                error = lines[-1] if lines else "Unknown error"
                print(f"  Error: {error[:100]}")
            failed += 1
    except subprocess.TimeoutExpired:
        print(f"  ⏱️ TIMEOUT")
        failed += 1
    except Exception as e:
        print(f"  ⚠️ ERROR: {str(e)[:100]}")
        failed += 1
    
    print()

print("="*60)
print("VERIFICATION RESULTS")
print("="*60)
print(f"Passed: {passed}/{len(verification_tests)}")
print(f"Failed: {failed}/{len(verification_tests)}")
print()

if passed == len(verification_tests):
    print("✅ ALL CORE INFRASTRUCTURE FIXES VERIFIED!")
    print()
    print("Next Steps:")
    print("  1. Run full test suite: python run_all_tests.py")
    print("  2. Fix business logic issues in failing tests")
    print("  3. Add test data seeding for consistent results")
elif passed > 0:
    print("⚠️ PARTIAL SUCCESS")
    print()
    print(f"Core fixes work for {passed} tests.")
    print("Remaining failures need investigation.")
else:
    print("❌ VERIFICATION FAILED")
    print()
    print("Core infrastructure fixes need more work.")
    print("Check:")
    print("  - Dev server running on port 3000")
    print("  - Supabase credentials in .env.local")
    print("  - Database has test user account")

sys.exit(0 if passed == len(verification_tests) else 1)
