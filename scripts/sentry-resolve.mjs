#!/usr/bin/env node
/**
 * Sentry Issue Resolver
 * Marks specified issues as resolved via Sentry API
 * 
 * Usage: node scripts/sentry-resolve.mjs
 * Requires: SENTRY_AUTH_TOKEN in .env.local
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ORG_SLUG = 'tac-pf';
const PROJECT_SLUG = 'javascript-react';

if (!SENTRY_AUTH_TOKEN) {
    console.error('❌ SENTRY_AUTH_TOKEN not found in .env.local');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
};

// Issues to resolve by title pattern match
const ISSUES_TO_RESOLVE = [
    { pattern: 'AbortError', reason: 'Added to ignoreErrors in Sentry config' },
    { pattern: 'AuthorizationError', reason: 'Fixed with RLS grants in migration 007' },
    { pattern: 'Rage Click', reason: 'Expected behavior - Sentry test button' },
    { pattern: 'This is your first error', reason: 'Intentional test error from SentryTestButton' },
    { pattern: 'Test exception captured manually', reason: 'Intentional test error from SentryTestButton' },
    { pattern: 'Test message from TAC Portal', reason: 'Intentional test message from SentryTestButton' },
];

async function fetchIssues() {
    const url = `https://sentry.io/api/0/projects/${ORG_SLUG}/${PROJECT_SLUG}/issues/?query=is:unresolved&statsPeriod=14d`;
    console.log(' Fetching unresolved issues...');

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(` Failed to fetch issues: ${error.message}`);
        return [];
    }
}

async function resolveIssue(issueId, title, reason) {
    const url = `https://sentry.io/api/0/issues/${issueId}/`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                status: 'resolved',
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        console.log(` Resolved: ${title}`);
        console.log(`   Reason: ${reason}`);
        return { success: true };
    } catch (error) {
        console.error(` Failed to resolve "${title}": ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log(' Resolving Sentry issues for TAC Portal...\n');
    console.log('─'.repeat(60));

    // Fetch current issues
    const issues = await fetchIssues();
    console.log(`Found ${issues.length} unresolved issues\n`);

    let resolved = 0;
    let skipped = 0;
    let failed = 0;

    for (const issue of issues) {
        // Check if this issue matches any of our patterns
        const matchingRule = ISSUES_TO_RESOLVE.find(rule =>
            issue.title.includes(rule.pattern) ||
            issue.metadata?.title?.includes(rule.pattern)
        );

        if (matchingRule) {
            const result = await resolveIssue(issue.id, issue.title, matchingRule.reason);
            if (result.success) {
                resolved++;
            } else {
                failed++;
            }
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 300));
        } else {
            skipped++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(' ');
    console.log('═'.repeat(60));
    console.log(` Resolved: ${resolved}`);
    console.log(`  Skipped (real issues): ${skipped}`);
    console.log(` Failed: ${failed}`);
    console.log(`\n Dashboard: https://tac-pf.sentry.io/issues/`);
}

main().catch(console.error);
