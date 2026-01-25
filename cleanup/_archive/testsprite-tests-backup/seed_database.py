"""
Seed test database with consistent test data for Playwright tests.
"""
import os
import sys
from pathlib import Path
from supabase import create_client, Client

def load_env():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / '.env.local'
    env_vars = {}
    
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value
    
    return env_vars

def seed_database():
    """Execute SQL seeding script."""
    print("="*60)
    print("SEEDING TEST DATABASE")
    print("="*60)
    print()
    
    # Load environment
    env = load_env()
    supabase_url = env.get('VITE_SUPABASE_URL')
    service_role_key = env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_role_key:
        print("❌ Missing Supabase credentials in .env.local")
        return False
    
    print(f"📡 Connecting to: {supabase_url}")
    
    # Create Supabase client with service role (bypasses RLS)
    supabase: Client = create_client(supabase_url, service_role_key)
    
    # Read SQL script
    sql_path = Path(__file__).parent / 'seed_test_data.sql'
    with open(sql_path, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    print("📝 Executing SQL seeding script...")
    print()
    
    try:
        # Execute SQL (note: supabase-py doesn't support raw SQL directly)
        # We'll use the REST API to insert data instead
        
        # Clean up existing test data
        print("🧹 Cleaning up existing test data...")
        supabase.table('shipments').delete().like('awb_number', 'TEST%').execute()
        supabase.table('customers').delete().like('email', '%@playwright-test.com').execute()
        
        # Get org_id from existing staff
        staff_result = supabase.table('staff').select('org_id').limit(1).execute()
        org_id = staff_result.data[0]['org_id'] if staff_result.data else '00000000-0000-0000-0000-000000000001'
        print(f"Using org_id: {org_id}")
        
        # Insert test customers
        print("👥 Creating test customers...")
        customers = [
            {
                'id': 'c1111111-1111-1111-1111-111111111111',
                'org_id': org_id,
                'customer_code': 'TEST001',
                'name': 'Playwright Test Corp',
                'type': 'BUSINESS',
                'email': 'test1@playwright-test.com',
                'phone': '9999999001',
                'gstin': '29ABCDE1234F1Z5',
                'address': '123 Test Street, Imphal, Manipur 795001'
            },
            {
                'id': 'c2222222-2222-2222-2222-222222222222',
                'org_id': org_id,
                'customer_code': 'TEST002',
                'name': 'Automated Testing Ltd',
                'type': 'BUSINESS',
                'email': 'test2@playwright-test.com',
                'phone': '9999999002',
                'gstin': '07XYZAB5678G2H9',
                'address': '456 QA Avenue, New Delhi, Delhi 110001'
            },
            {
                'id': 'c3333333-3333-3333-3333-333333333333',
                'org_id': org_id,
                'customer_code': 'TEST003',
                'name': 'E2E Test Solutions',
                'type': 'BUSINESS',
                'email': 'test3@playwright-test.com',
                'phone': '9999999003',
                'gstin': '27PQRST9012K3L4',
                'address': '789 Automation Lane, Imphal, Manipur 795002'
            },
            {
                'id': 'c4444444-4444-4444-4444-444444444444',
                'org_id': org_id,
                'customer_code': 'TEST004',
                'name': 'Quality Assurance Inc',
                'type': 'BUSINESS',
                'email': 'test4@playwright-test.com',
                'phone': '9999999004',
                'gstin': '29MNOPQ3456R7S8',
                'address': '321 Testing Road, New Delhi, Delhi 110002'
            },
            {
                'id': 'c5555555-5555-5555-5555-555555555555',
                'org_id': org_id,
                'customer_code': 'TEST005',
                'name': 'Selenium Logistics',
                'type': 'BUSINESS',
                'email': 'test5@playwright-test.com',
                'phone': '9999999005',
                'gstin': '07UVWXY7890T1U2',
                'address': '654 Browser Boulevard, Imphal, Manipur 795003'
            }
        ]
        
        result = supabase.table('customers').upsert(customers).execute()
        print(f"✅ Created {len(customers)} test customers")
        
        # Get hub IDs
        print("🏢 Fetching hub IDs...")
        hubs = supabase.table('hubs').select('id, code').execute()
        hub_map = {hub['code']: hub['id'] for hub in hubs.data}
        
        imphal_hub = hub_map.get('IMF')  # Imphal code is IMF
        delhi_hub = hub_map.get('DEL')
        
        if not imphal_hub or not delhi_hub:
            print("⚠️  Hubs not found, using first two available hubs")
            if len(hubs.data) >= 2:
                imphal_hub = hubs.data[0]['id']
                delhi_hub = hubs.data[1]['id']
            else:
                print("❌ Not enough hubs in database")
                return False
        
        # Insert test shipments
        print("📦 Creating test shipments...")
        shipments = [
            {
                'id': '11111111-1111-1111-1111-111111111111',
                'org_id': org_id,
                'awb_number': 'TEST001',
                'customer_id': 'c1111111-1111-1111-1111-111111111111',
                'origin_hub_id': imphal_hub,
                'destination_hub_id': delhi_hub,
                'receiver_name': 'Receiver 1',
                'receiver_phone': '8888888001',
                'receiver_address': {'line1': '100 Delivery St', 'city': 'New Delhi', 'pincode': '110001'},
                'mode': 'AIR',
                'service_level': 'STANDARD',
                'status': 'CREATED',
                'package_count': 5,
                'total_weight': 12.5
            },
            {
                'id': '22222222-2222-2222-2222-222222222222',
                'org_id': org_id,
                'awb_number': 'TEST002',
                'customer_id': 'c2222222-2222-2222-2222-222222222222',
                'origin_hub_id': delhi_hub,
                'destination_hub_id': imphal_hub,
                'receiver_name': 'Receiver 2',
                'receiver_phone': '8888888002',
                'receiver_address': {'line1': '200 Pickup Ave', 'city': 'Imphal', 'pincode': '795001'},
                'mode': 'TRUCK',
                'service_level': 'EXPRESS',
                'status': 'IN_TRANSIT',
                'package_count': 3,
                'total_weight': 8.0
            },
            {
                'id': '33333333-3333-3333-3333-333333333333',
                'org_id': org_id,
                'awb_number': 'TEST003',
                'customer_id': 'c3333333-3333-3333-3333-333333333333',
                'origin_hub_id': imphal_hub,
                'destination_hub_id': delhi_hub,
                'receiver_name': 'Receiver 3',
                'receiver_phone': '8888888003',
                'receiver_address': {'line1': '300 Transit Rd', 'city': 'New Delhi', 'pincode': '110002'},
                'mode': 'AIR',
                'service_level': 'STANDARD',
                'status': 'DELIVERED',
                'package_count': 2,
                'total_weight': 5.5
            },
            {
                'id': '44444444-4444-4444-4444-444444444444',
                'org_id': org_id,
                'awb_number': 'TEST004',
                'customer_id': 'c4444444-4444-4444-4444-444444444444',
                'origin_hub_id': delhi_hub,
                'destination_hub_id': imphal_hub,
                'receiver_name': 'Receiver 4',
                'receiver_phone': '8888888004',
                'receiver_address': {'line1': '400 Manifest Ln', 'city': 'Imphal', 'pincode': '795002'},
                'mode': 'TRUCK',
                'service_level': 'STANDARD',
                'status': 'CREATED',
                'package_count': 10,
                'total_weight': 25.0
            },
            {
                'id': '55555555-5555-5555-5555-555555555555',
                'org_id': org_id,
                'awb_number': 'TEST005',
                'customer_id': 'c5555555-5555-5555-5555-555555555555',
                'origin_hub_id': imphal_hub,
                'destination_hub_id': delhi_hub,
                'receiver_name': 'Receiver 5',
                'receiver_phone': '8888888005',
                'receiver_address': {'line1': '500 Exception Blvd', 'city': 'New Delhi', 'pincode': '110003'},
                'mode': 'AIR',
                'service_level': 'EXPRESS',
                'status': 'CREATED',
                'package_count': 7,
                'total_weight': 15.0
            }
        ]
        
        result = supabase.table('shipments').upsert(shipments).execute()
        print(f"✅ Created {len(shipments)} test shipments")
        
        print()
        print("="*60)
        print("✅ TEST DATABASE SEEDED SUCCESSFULLY")
        print("="*60)
        print()
        print("Test Data Summary:")
        print(f"  👥 Customers: {len(customers)}")
        print(f"  📦 Shipments: {len(shipments)}")
        print()
        print("Test Customer Emails:")
        for c in customers:
            print(f"  - {c['email']}")
        print()
        print("Test Shipment AWBs:")
        for s in shipments:
            print(f"  - {s['awb_number']} ({s['status']})")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)
