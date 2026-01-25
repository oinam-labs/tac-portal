"""Check staff table to find org_id."""
from pathlib import Path
from supabase import create_client

def load_env():
    env_path = Path(__file__).parent.parent / '.env.local'
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value
    return env_vars

env = load_env()
supabase = create_client(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

# Check staff to get org_id
print("Checking staff table for org_id...")
result = supabase.table('staff').select('org_id, email').limit(1).execute()
if result.data:
    org_id = result.data[0]['org_id']
    print(f"Found org_id: {org_id}")
    print(f"From staff: {result.data[0]['email']}")
else:
    print("No staff found")
