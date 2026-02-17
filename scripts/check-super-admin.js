
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixSuperAdmin() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const fullName = process.env.SUPER_ADMIN_FULL_NAME || 'Super Admin';
    const orgId = process.env.SUPER_ADMIN_ORG_ID || '00000000-0000-0000-0000-000000000001';
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email) {
        console.error('❌ Missing SUPER_ADMIN_EMAIL environment variable');
        process.exit(1);
    }

    console.log(`Checking for ${email}...`);

    // 1. Check Auth User
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing users:', authError);
        return;
    }

    let user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found in auth.users!');
        console.log('Creating user...');
        if (!password) {
            console.error('❌ Missing SUPER_ADMIN_PASSWORD environment variable (required to create a new user)');
            process.exit(1);
        }
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (createError) {
            console.error('Failed to create user:', createError);
            return;
        }
        console.log('User created:', newUser.user.id);
        user = newUser.user;
    } else {
        console.log('Auth user found:', user.id);
    }

    // 2. Check Public Staff
    const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

    if (staffError && staffError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error fetching staff record:', staffError);
        return;
    }

    if (!staff) {
        console.log('Staff record not found. Creating...');

        // Check if user object exists before accessing property
        if (!user) {
            console.error('Fatal: User object is null/undefined when trying to create staff record');
            return;
        }

        const { data: newStaff, error: insertError } = await supabase
            .from('staff')
            .insert({
                auth_user_id: user.id,
                email: email,
                full_name: fullName,
                role: 'SUPER_ADMIN',
                org_id: orgId,
                is_active: true
            })
            .select()
            .single();

        if (insertError) {
            console.error('Failed to insert staff:', insertError);
        } else {
            console.log('Staff record created with SUPER_ADMIN role:', newStaff);
        }
    } else {
        console.log('Staff record state:', staff);

        if (staff.role !== 'SUPER_ADMIN') {
            console.warn('⚠️  Role is NOT SUPER_ADMIN. Fixing now...');

            const { error: updateError } = await supabase
                .from('staff')
                .update({ role: 'SUPER_ADMIN' })
                .eq('id', staff.id);

            if (updateError) {
                console.error('Failed to update role:', updateError);
            } else {
                console.log('✅ Role updated to SUPER_ADMIN');
            }
        } else {
            console.log('✅ User already has SUPER_ADMIN role');
        }
    }
}

checkAndFixSuperAdmin();
