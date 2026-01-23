#!/usr/bin/env node
/**
 * Run Supabase Migrations
 * Executes SQL migration files against the Supabase database
 * 
 * Usage: node scripts/run-migrations.mjs
 */

import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, normalize, basename } from 'path';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

/**
 * Execute SQL against Supabase using the REST API
 * 
 * Security Note: SQL content is transmitted over HTTPS to Supabase.
 * Ensure migration files do not contain sensitive credentials or secrets.
 */
async function executeSQL(sql, description) {
    // First try using the sql endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
    });

    // If that doesn't work, use pg_query via postgrest
    if (!response.ok) {
        // Use the management API instead
        const mgmtResponse = await fetch(
            `https://api.supabase.com/v1/projects/${getProjectRef()}/database/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: sql })
            }
        );

        if (!mgmtResponse.ok) {
            const error = await mgmtResponse.text();
            throw new Error(`Failed to execute SQL: ${error}`);
        }

        return mgmtResponse.json();
    }

    return response.json();
}

/**
 * Extract project ref from Supabase URL
 */
function getProjectRef() {
    // URL format: https://xkkhxhgkyavxcfgeojww.supabase.co
    const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
}

/**
 * Run a specific migration file
 */
async function runMigration(filename) {
    const migrationsDir = resolve(process.cwd(), 'supabase/migrations');

    // Security: Validate filename to prevent path traversal
    const sanitizedFilename = basename(normalize(filename));
    if (sanitizedFilename !== filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        console.error(`❌ Invalid filename (possible path traversal): ${filename}`);
        return false;
    }

    const filepath = join(migrationsDir, sanitizedFilename);

    // Security: Verify resolved path is within migrations directory
    if (!filepath.startsWith(migrationsDir)) {
        console.error(`❌ Path traversal detected: ${filename}`);
        return false;
    }

    console.log(`\n📄 Running migration: ${sanitizedFilename}`);
    console.log('─'.repeat(50));

    const sql = readFileSync(filepath, 'utf-8');

    // Security: Validate SQL content before transmission
    if (sql.length === 0) {
        console.error(`❌ Empty migration file: ${filename}`);
        return false;
    }

    // Security: Check for potential secrets (basic validation)
    const sensitivePatterns = [
        /password\s*=\s*['"][^'"]+['"]/gi,
        /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
        /secret\s*=\s*['"][^'"]+['"]/gi
    ];

    for (const pattern of sensitivePatterns) {
        if (pattern.test(sql)) {
            console.warn(`⚠️  Warning: Migration file may contain sensitive data`);
            console.warn(`   Review ${sanitizedFilename} before running`);
            break;
        }
    }

    try {
        await executeSQL(sql, filename);
        console.log(`✅ ${filename} - Success`);
        return true;
    } catch (error) {
        console.error(`❌ ${filename} - Failed:`, error.message);
        return false;
    }
}

/**
 * List available migrations
 */
function listMigrations() {
    const migrationsDir = resolve(process.cwd(), 'supabase/migrations');
    const files = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    return files;
}

async function main() {
    console.log('🚀 Supabase Migration Runner');
    console.log('═'.repeat(50));
    console.log(`Project: ${getProjectRef()}`);
    console.log(`URL: ${SUPABASE_URL}`);

    // Get specific migrations to run from args, or run the new RBAC ones
    const args = process.argv.slice(2);
    let migrationsToRun = args.length > 0
        ? args
        : ['010_rbac_enhancement.sql', '011_e2e_test_user.sql'];

    const allMigrations = listMigrations();
    console.log(`\nAvailable migrations: ${allMigrations.length}`);

    // Filter to only existing migrations
    migrationsToRun = migrationsToRun.filter(m => allMigrations.includes(m));

    if (migrationsToRun.length === 0) {
        console.log('No migrations to run.');
        return;
    }

    console.log(`\nRunning ${migrationsToRun.length} migration(s)...`);

    let success = 0;
    let failed = 0;

    for (const migration of migrationsToRun) {
        const result = await runMigration(migration);
        if (result) success++;
        else failed++;
    }

    console.log('\n' + '═'.repeat(50));
    console.log('📊 Summary');
    console.log(`   ✅ Successful: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
