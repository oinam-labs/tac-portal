"""Run full test suite quickly and report results."""
import subprocess
import sys
from pathlib import Path
import os

def run_test(test_file):
    """Run a single test and return result."""
    try:
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        
        result = subprocess.run(
            [sys.executable, str(test_file)],
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
            encoding='utf-8'
        )
        
        return {
            'name': test_file.name,
            'passed': result.returncode == 0,
            'error': result.stderr[-200:] if result.stderr else ''
        }
    except subprocess.TimeoutExpired:
        return {'name': test_file.name, 'passed': False, 'error': 'TIMEOUT'}
    except Exception as e:
        return {'name': test_file.name, 'passed': False, 'error': str(e)[:200]}

def main():
    test_dir = Path(__file__).parent
    test_files = sorted(test_dir.glob('TC*.py'))
    
    print("="*60)
    print(f"RUNNING FULL TEST SUITE ({len(test_files)} tests)")
    print("="*60)
    print()
    
    results = []
    passed_count = 0
    failed_count = 0
    
    for i, test_file in enumerate(test_files, 1):
        print(f"[{i}/{len(test_files)}] {test_file.name[:50]:<50}", end=' ')
        
        result = run_test(test_file)
        results.append(result)
        
        if result['passed']:
            print("✅")
            passed_count += 1
        else:
            print("❌")
            failed_count += 1
    
    print()
    print("="*60)
    print("RESULTS SUMMARY")
    print("="*60)
    print(f"✅ Passed: {passed_count}/{len(test_files)} ({passed_count*100//len(test_files)}%)")
    print(f"❌ Failed: {failed_count}/{len(test_files)}")
    print()
    
    if failed_count > 0:
        print("Failed Tests:")
        for r in results:
            if not r['passed']:
                print(f"  ❌ {r['name']}")
                if r['error']:
                    error_line = r['error'].split('\n')[-1][:80]
                    print(f"     {error_line}")
        print()
    
    if passed_count == len(test_files):
        print("🎉🎉🎉 100% PASS RATE ACHIEVED! 🎉🎉🎉")
    elif passed_count >= len(test_files) * 0.8:
        print(f"🎯 {passed_count*100//len(test_files)}% pass rate - Close to goal!")
    else:
        print(f"⚠️ {passed_count*100//len(test_files)}% pass rate - More work needed")
    
    return passed_count == len(test_files)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
