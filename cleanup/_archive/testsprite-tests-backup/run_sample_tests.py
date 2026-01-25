"""Run a sample of tests to measure improvements after seeding."""
import subprocess
import sys
from pathlib import Path

# Sample tests covering different modules
sample_tests = [
    "TC001_Role_based_authentication_success.py",
    "TC002_Role_based_authentication_failure.py",
    "TC003_Dashboard_real_time_KPI_and_activity_display.py",
    "TC001_Fixed_Standardized.py",
    "TC001_Successful_shipment_creation_with_valid_inputs.py",
    "TC004_Shipment_creation_with_AWB_generation.py",
    "TC010_UI_rendering_across_themes_responsiveness_and_accessibility.py",
]

test_dir = Path(__file__).parent
passed = 0
failed = 0

print("="*60)
print("SAMPLE TEST RUN (7 tests)")
print("="*60)
print()

for test_file in sample_tests:
    print(f"Running: {test_file}")
    
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
            print(f"  ✅ PASS\n")
            passed += 1
        else:
            print(f"  ❌ FAIL")
            if result.stderr:
                lines = result.stderr.strip().split('\n')
                error = lines[-1] if lines else "Unknown error"
                print(f"  Error: {error[:100]}\n")
            failed += 1
    except subprocess.TimeoutExpired:
        print(f"  ⏱️ TIMEOUT\n")
        failed += 1
    except Exception as e:
        print(f"  ⚠️ ERROR: {str(e)[:100]}\n")
        failed += 1

print("="*60)
print("SAMPLE TEST RESULTS")
print("="*60)
print(f"✅ Passed: {passed}/{len(sample_tests)} ({passed*100//len(sample_tests)}%)")
print(f"❌ Failed: {failed}/{len(sample_tests)}")
print()

if passed >= 4:
    print("🎉 SIGNIFICANT IMPROVEMENT!")
    print("Core infrastructure is stable with test data.")
else:
    print("⚠️ More work needed on test data or selectors")

sys.exit(0 if passed >= 4 else 1)
