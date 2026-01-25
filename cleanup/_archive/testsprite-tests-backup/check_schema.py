"""Check actual database schema to understand column names."""
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

# Check shipments table structure
print("Checking shipments table...")
result = supabase.table('shipments').select('*').limit(1).execute()
if result.data:
    print("Shipments columns:", list(result.data[0].keys()))
else:
    print("No shipments found")

# Check customers table
print("\nChecking customers table...")
result = supabase.table('customers').select('*').limit(1).execute()
if result.data:
    print("Customers columns:", list(result.data[0].keys()))
else:
    print("No customers found")

# Check hubs table
print("\nChecking hubs table...")
result = supabase.table('hubs').select('*').execute()
print(f"Found {len(result.data)} hubs")
for hub in result.data:
    print(f"  - {hub.get('name', 'N/A')} ({hub.get('code', 'N/A')}): {hub['id']}")
