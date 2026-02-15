
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// Management API doesn't let us query pg_policies easily, but we can try via SQL query endpoint
// Using the same approach as migration script
const PROJECT_REF = 'xkkhxhgkyavxcfgeojww';
const ACCESS_TOKEN = 'sbp_29e3b13663969f7bb8d3068cf95643b0f76dfe48';

async function executeSQL(sql) {
    console.log(`Executing SQL: ${sql}`);
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`SQL Error: ${text}`);
    }

    const result = await response.json();
    writeFileSync('rls_report.json', JSON.stringify(result, null, 2));
    console.log('Wrote policies to rls_report.json');
}

async function main() {
    try {
        await executeSQL(`
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('staff', 'invoices', 'shipments', 'orgs') 
            ORDER BY tablename, policyname;
        `);
    } catch (e) {
        console.error(e);
    }
}

main();
