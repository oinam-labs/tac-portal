// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify Authentication & Authorization
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Check if user is SUPER_ADMIN
        const { data: staffData, error: staffError } = await supabaseClient
            .from('staff')
            .select('role')
            .eq('auth_user_id', user.id)
            .single()

        if (staffError || staffData?.role !== 'SUPER_ADMIN') {
            return new Response(JSON.stringify({ error: 'Forbidden: Super Admin access required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Parse Request Body
        const { email, password, role, fullName, hubCode } = await req.json()

        if (!email || !password || !role || !fullName) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. Create User via Admin API
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role },
        })

        if (createError) throw createError

        // 4. Create Staff Profile
        // We do this to ensure the trigger or manual insert handles the profile creation
        // If your system relies on triggers on auth.users, this might be redundant but safer to be explicit
        // However, given the existing system likely has triggers or manual profile creation, let's explicit insert into staff

        // First check if staff already exists (unlikely for new user but possible if cleanup failed)
        const { error: profileError } = await supabaseAdmin
            .from('staff')
            .insert({
                auth_user_id: newUser.user.id,
                email: email,
                full_name: fullName,
                role: role,
                org_id: '00000000-0000-0000-0000-000000000001', // Default Org
                hub_id: hubCode ? (await getHubId(supabaseAdmin, hubCode)) : null,
                is_active: true
            })

        if (profileError) {
            // cleanup auth user if profile creation fails? 
            // For now, let's just log and return error, enabling manual fix
            console.error('Failed to create staff profile:', profileError)
            return new Response(JSON.stringify({ error: 'User created but profile failed: ' + profileError.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify({ user: newUser.user, message: 'User created successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

// Helper to resolve Hub Code to ID
async function getHubId(client: any, code: string) {
    const { data } = await client.from('hubs').select('id').eq('code', code).single()
    return data?.id || null
}
