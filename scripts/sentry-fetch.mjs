#!/usr/bin/env node
/**
 * Sentry Data Fetcher
 * Fetches issues, errors, and performance data from Sentry API
 * 
 * Usage: node scripts/sentry-fetch.mjs
 * Requires: SENTRY_AUTH_TOKEN in .env.local
 */

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

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

/**
 * Sanitize data from external API to prevent code injection
 * Only allows safe primitive types and nested objects/arrays
 */
function sanitizeData(data, depth = 0) {
    if (depth > 10) return null; // Prevent deep recursion attacks

    if (data === null || data === undefined) return null;
    if (typeof data === 'string') return data.slice(0, 10000); // Limit string length
    if (typeof data === 'number' && Number.isFinite(data)) return data;
    if (typeof data === 'boolean') return data;

    if (Array.isArray(data)) {
        return data.slice(0, 1000).map(item => sanitizeData(item, depth + 1));
    }

    if (typeof data === 'object') {
        const sanitized = {};
        const keys = Object.keys(data).slice(0, 100);
        for (const key of keys) {
            const safeKey = String(key).slice(0, 100);
            sanitized[safeKey] = sanitizeData(data[key], depth + 1);
        }
        return sanitized;
    }

    return null; // Reject functions, symbols, etc.
}

async function fetchFromSentry(endpoint) {
    const url = `https://sentry.io/api/0/${endpoint}`;
    console.log(`📡 Fetching: ${endpoint}`);

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return sanitizeData(data); // Sanitize external data before use
    } catch (error) {
        console.error(`❌ Failed to fetch ${endpoint}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🔍 Fetching Sentry data for TAC Portal...\n');

    const report = {
        fetchedAt: new Date().toISOString(),
        organization: ORG_SLUG,
        project: PROJECT_SLUG,
        issues: [],
        stats: null,
        errors: [],
    };

    // Fetch unresolved issues (last 24h)
    console.log('\n📋 UNRESOLVED ISSUES (Last 24h)');
    console.log('─'.repeat(50));
    const issues = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/issues/?query=is:unresolved&statsPeriod=24h`
    );

    if (issues && Array.isArray(issues)) {
        report.issues = issues;
        if (issues.length === 0) {
            console.log('✅ No unresolved issues!');
        } else {
            issues.slice(0, 10).forEach((issue, i) => {
                console.log(`\n${i + 1}. ${issue.title}`);
                console.log(`   Level: ${issue.level} | Count: ${issue.count}`);
                console.log(`   First seen: ${issue.firstSeen}`);
                console.log(`   Last seen: ${issue.lastSeen}`);
                if (issue.culprit) console.log(`   Culprit: ${issue.culprit}`);
            });
            if (issues.length > 10) {
                console.log(`\n... and ${issues.length - 10} more issues`);
            }
        }
    }

    // Fetch project stats
    console.log('\n\n📊 ERROR STATS (Last 24h)');
    console.log('─'.repeat(50));
    const stats = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/stats/?stat=received&resolution=1h&statsPeriod=24h`
    );

    if (stats) {
        report.stats = stats;
        const total = stats.reduce((sum, [_, count]) => sum + count, 0);
        console.log(`Total errors received: ${total}`);

        // Find peak hours
        const sorted = [...stats].sort((a, b) => b[1] - a[1]);
        if (sorted[0] && sorted[0][1] > 0) {
            console.log(`Peak hour: ${new Date(sorted[0][0] * 1000).toISOString()} (${sorted[0][1]} errors)`);
        }
    }

    // Fetch recent events
    console.log('\n\n🔴 RECENT ERROR EVENTS');
    console.log('─'.repeat(50));
    const events = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/events/?full=true`
    );

    if (events && Array.isArray(events)) {
        report.errors = events.slice(0, 20);
        events.slice(0, 5).forEach((event, i) => {
            console.log(`\n${i + 1}. ${event.title || event.message || 'Unknown error'}`);
            console.log(`   ID: ${event.eventID}`);
            console.log(`   Time: ${event.dateCreated}`);
            if (event.tags) {
                const browser = event.tags.find(t => t.key === 'browser');
                if (browser) console.log(`   Browser: ${browser.value}`);
            }
        });
    }

    // Save report
    const reportPath = resolve(process.cwd(), 'sentry_report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n\n✅ Full report saved to: sentry_report.json`);

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📈 SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Issues: ${report.issues.length}`);
    console.log(`Recent events captured: ${report.errors.length}`);
    console.log(`\n🔗 Dashboard: https://tac-pf.sentry.io/issues/`);
}

main().catch(console.error);
