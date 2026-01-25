"""Check organizations in database."""
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

# Check organizations
print("Checking organizations...")
result = supabase.table('organizations').select('*').execute()
print(f"Found {len(result.data)} organizations:")
for org in result.data:
    print(f"  - {org.get('name', 'N/A')}: {org['id']}")
