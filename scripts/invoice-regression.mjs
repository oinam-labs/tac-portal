import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const invoiceCount = Number.parseInt(process.env.INVOICE_REGRESSION_COUNT || '10', 10);

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const pickOrg = async () => {
    const { data, error } = await supabase.from('orgs').select('id').limit(1).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('No org found. Seed orgs table first.');
    return data.id;
};

const pickOrCreateCustomer = async (orgId) => {
    const { data: existing, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('org_id', orgId)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    if (existing) return existing.id;

    const timestamp = Date.now();
    const { data: created, error: createError } = await supabase
        .from('customers')
        .insert({
            org_id: orgId,
            customer_code: `REG-${timestamp}`,
            name: 'Invoice Regression Customer',
            type: 'business',
            phone: '9999999999',
            address: {
                line1: 'Regression Lane',
                city: 'Imphal',
                state: 'Manipur',
                zip: '795001',
            },
        })
        .select('id')
        .single();

    if (createError) throw createError;
    return created.id;
};

const createInvoice = async ({ orgId, customerId }, index) => {
    const { data, error } = await supabase
        .from('invoices')
        .insert({
            org_id: orgId,
            customer_id: customerId,
            subtotal: 100 + index,
            tax_amount: 0,
            discount: 0,
            total: 100 + index,
            issue_date: new Date().toISOString().split('T')[0],
            notes: 'Regression invoice',
            line_items: [{ label: 'Regression Item', amount: 100 + index }],
        })
        .select('id, invoice_no')
        .single();

    if (error) throw error;
    return data;
};

const main = async () => {
    const orgId = await pickOrg();
    const customerId = await pickOrCreateCustomer(orgId);

    const results = await Promise.all(
        Array.from({ length: invoiceCount }, (_, index) => createInvoice({ orgId, customerId }, index))
    );

    const invoiceNos = results.map((row) => row.invoice_no);
    const uniqueInvoiceNos = new Set(invoiceNos);

    if (uniqueInvoiceNos.size !== invoiceNos.length) {
        throw new Error('Duplicate invoice numbers detected.');
    }

    const invoiceIds = results.map((row) => row.id);
    const { data: logs, error: logError } = await supabase
        .from('audit_logs')
        .select('entity_id')
        .eq('entity_type', 'invoices')
        .in('entity_id', invoiceIds);

    if (logError) throw logError;

    if (!logs || logs.length < invoiceIds.length) {
        throw new Error(`Expected ${invoiceIds.length} audit logs, found ${logs?.length ?? 0}.`);
    }

    console.log(`Created ${invoiceIds.length} invoices without duplicates.`);
    console.log(`Verified ${logs.length} invoice audit log entries.`);
    console.log('Sample invoice numbers:', invoiceNos.slice(0, 5));
};

main().catch((error) => {
    console.error('Invoice regression failed:', error.message || error);
    process.exit(1);
});
