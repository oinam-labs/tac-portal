/**
 * Supabase Edge Function: Send Email via Resend
 * Deploy: supabase functions deploy send-email
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: string;
    }>;
}

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY not configured');
        }

        const { to, subject, html, attachments }: EmailRequest = await req.json();

        // Validate required fields
        if (!to || !subject || !html) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Prepare email payload
        const emailPayload: Record<string, unknown> = {
            from: 'TAC Cargo <noreply@taccargo.com>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            emailPayload.attachments = attachments;
        }

        // Send via Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('[send-email] Resend error:', result);
            return new Response(
                JSON.stringify({ error: result.message || 'Failed to send email' }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('[send-email] Email sent successfully:', result.id);

        return new Response(
            JSON.stringify({ success: true, id: result.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[send-email] Exception:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
