"""Expand customer test data."""
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

# Get org_id
staff_result = supabase.table('staff').select('org_id').limit(1).execute()
org_id = staff_result.data[0]['org_id']

# Add 10 more customers (total 15)
additional_customers = []
for i in range(6, 16):
    customer_id = f'c{str(i)*32}'[:36]  # Create valid UUID format
    additional_customers.append({
        'id': customer_id,
        'org_id': org_id,
        'customer_code': f'TEST{str(i).zfill(3)}',
        'name': f'Test Customer {i}',
        'type': 'BUSINESS',
        'email': f'test{i}@playwright-test.com',
        'phone': f'999999{str(i).zfill(4)}',
        'gstin': f'29ABCDE{str(i).zfill(4)}F1Z5',
        'address': f'{i*100} Test Street, Imphal, Manipur 795001'
    })

result = supabase.table('customers').upsert(additional_customers).execute()
print(f"✅ Added {len(additional_customers)} customers (total: 15)")
