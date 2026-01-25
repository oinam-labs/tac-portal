-- Seed Test Data for Playwright Tests
-- This script creates consistent test data for E2E testing

-- Clean up existing test data (idempotent)
DELETE FROM shipments WHERE awb LIKE 'TEST%';
DELETE FROM customers WHERE email LIKE '%@playwright-test.com';
DELETE FROM manifests WHERE manifest_number LIKE 'TEST-MAN%';

-- Insert Test Customers
INSERT INTO customers (
    id,
    company_name,
    name,
    email,
    phone,
    gstin,
    address,
    city,
    state,
    pincode,
    created_at
) VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'Playwright Test Corp',
    'Test User 1',
    'test1@playwright-test.com',
    '9999999001',
    '29ABCDE1234F1Z5',
    '123 Test Street',
    'Imphal',
    'Manipur',
    '795001',
    NOW()
),
(
    'c2222222-2222-2222-2222-222222222222',
    'Automated Testing Ltd',
    'Test User 2',
    'test2@playwright-test.com',
    '9999999002',
    '07XYZAB5678G2H9',
    '456 QA Avenue',
    'New Delhi',
    'Delhi',
    '110001',
    NOW()
),
(
    'c3333333-3333-3333-3333-333333333333',
    'E2E Test Solutions',
    'Test User 3',
    'test3@playwright-test.com',
    '9999999003',
    '27PQRST9012K3L4',
    '789 Automation Lane',
    'Imphal',
    'Manipur',
    '795002',
    NOW()
),
(
    'c4444444-4444-4444-4444-444444444444',
    'Quality Assurance Inc',
    'Test User 4',
    'test4@playwright-test.com',
    '9999999004',
    '29MNOPQ3456R7S8',
    '321 Testing Road',
    'New Delhi',
    'Delhi',
    '110002',
    NOW()
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Selenium Logistics',
    'Test User 5',
    'test5@playwright-test.com',
    '9999999005',
    '07UVWXY7890T1U2',
    '654 Browser Boulevard',
    'Imphal',
    'Manipur',
    '795003',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Get hub IDs (assuming they exist)
DO $$
DECLARE
    imphal_hub_id UUID;
    delhi_hub_id UUID;
BEGIN
    -- Get hub IDs
    SELECT id INTO imphal_hub_id FROM hubs WHERE code = 'IMP' LIMIT 1;
    SELECT id INTO delhi_hub_id FROM hubs WHERE code = 'DEL' LIMIT 1;
    
    -- If hubs don't exist, create them
    IF imphal_hub_id IS NULL THEN
        INSERT INTO hubs (id, name, code, location, is_active)
        VALUES (
            'h1111111-1111-1111-1111-111111111111',
            'Imphal Hub',
            'IMP',
            'Imphal, Manipur',
            true
        )
        ON CONFLICT (code) DO NOTHING;
        imphal_hub_id := 'h1111111-1111-1111-1111-111111111111';
    END IF;
    
    IF delhi_hub_id IS NULL THEN
        INSERT INTO hubs (id, name, code, location, is_active)
        VALUES (
            'h2222222-2222-2222-2222-222222222222',
            'New Delhi Hub',
            'DEL',
            'New Delhi, Delhi',
            true
        )
        ON CONFLICT (code) DO NOTHING;
        delhi_hub_id := 'h2222222-2222-2222-2222-222222222222';
    END IF;
    
    -- Insert Test Shipments
    INSERT INTO shipments (
        id,
        awb,
        customer_id,
        origin_hub_id,
        destination_hub_id,
        receiver_name,
        receiver_phone,
        receiver_address,
        mode,
        service_level,
        status,
        package_count,
        total_weight,
        created_at
    ) VALUES 
    (
        's1111111-1111-1111-1111-111111111111',
        'TEST001',
        'c1111111-1111-1111-1111-111111111111',
        imphal_hub_id,
        delhi_hub_id,
        'Receiver 1',
        '8888888001',
        jsonb_build_object('line1', '100 Delivery St', 'city', 'New Delhi', 'pincode', '110001'),
        'AIR',
        'STANDARD',
        'PENDING',
        5,
        12.5,
        NOW()
    ),
    (
        's2222222-2222-2222-2222-222222222222',
        'TEST002',
        'c2222222-2222-2222-2222-222222222222',
        delhi_hub_id,
        imphal_hub_id,
        'Receiver 2',
        '8888888002',
        jsonb_build_object('line1', '200 Pickup Ave', 'city', 'Imphal', 'pincode', '795001'),
        'TRUCK',
        'EXPRESS',
        'IN_TRANSIT',
        3,
        8.0,
        NOW() - INTERVAL '1 day'
    ),
    (
        's3333333-3333-3333-3333-333333333333',
        'TEST003',
        'c3333333-3333-3333-3333-333333333333',
        imphal_hub_id,
        delhi_hub_id,
        'Receiver 3',
        '8888888003',
        jsonb_build_object('line1', '300 Transit Rd', 'city', 'New Delhi', 'pincode', '110002'),
        'AIR',
        'STANDARD',
        'DELIVERED',
        2,
        5.5,
        NOW() - INTERVAL '3 days'
    ),
    (
        's4444444-4444-4444-4444-444444444444',
        'TEST004',
        'c4444444-4444-4444-4444-444444444444',
        delhi_hub_id,
        imphal_hub_id,
        'Receiver 4',
        '8888888004',
        jsonb_build_object('line1', '400 Manifest Ln', 'city', 'Imphal', 'pincode', '795002'),
        'TRUCK',
        'STANDARD',
        'PENDING',
        10,
        25.0,
        NOW()
    ),
    (
        's5555555-5555-5555-5555-555555555555',
        'TEST005',
        'c5555555-5555-5555-5555-555555555555',
        imphal_hub_id,
        delhi_hub_id,
        'Receiver 5',
        '8888888005',
        jsonb_build_object('line1', '500 Exception Blvd', 'city', 'New Delhi', 'pincode', '110003'),
        'AIR',
        'EXPRESS',
        'PENDING',
        7,
        15.0,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW();
    
END $$;

-- Output success message
SELECT 
    (SELECT COUNT(*) FROM customers WHERE email LIKE '%@playwright-test.com') as test_customers_created,
    (SELECT COUNT(*) FROM shipments WHERE awb LIKE 'TEST%') as test_shipments_created;
