#!/usr/bin/env node
/**
 * Sentry Data Fetcher
 * Fetches issues, errors, and performance data from Sentry API
 * 
 * Usage: node scripts/sentry-fetch.mjs
 * Requires: SENTRY_AUTH_TOKEN in .env.local
 * 
 * Security: This script extracts only specific fields from API responses
 * to prevent arbitrary data injection (CodeQL js/http-to-file-access).
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
 * Safely extract a string value with length limit
 */
function safeString(value, maxLength = 500) {
    if (typeof value !== 'string') return '';
    return value.slice(0, maxLength);
}

/**
 * Safely extract a number value
 */
function safeNumber(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    return value;
}

/**
 * Extract only safe, known fields from a Sentry issue object
 * This prevents arbitrary network data from being written to file
 */
function extractIssueFields(issue) {
    if (!issue || typeof issue !== 'object') return null;
    return {
        id: safeString(issue.id, 50),
        title: safeString(issue.title, 200),
        level: safeString(issue.level, 20),
        count: safeNumber(issue.count),
        firstSeen: safeString(issue.firstSeen, 30),
        lastSeen: safeString(issue.lastSeen, 30),
        culprit: safeString(issue.culprit, 200),
    };
}

/**
 * Extract only safe, known fields from a Sentry event object
 */
function extractEventFields(event) {
    if (!event || typeof event !== 'object') return null;
    return {
        eventID: safeString(event.eventID, 50),
        title: safeString(event.title, 200),
        message: safeString(event.message, 200),
        dateCreated: safeString(event.dateCreated, 30),
    };
}

/**
 * Extract stats as [timestamp, count] tuples
 */
function extractStats(stats) {
    if (!Array.isArray(stats)) return [];
    return stats.slice(0, 100).map(item => {
        if (!Array.isArray(item) || item.length < 2) return [0, 0];
        return [safeNumber(item[0]), safeNumber(item[1])];
    });
}

async function fetchFromSentry(endpoint) {
    const url = `https://sentry.io/api/0/${endpoint}`;
    console.log(`📡 Fetching: ${endpoint}`);

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ Failed to fetch ${endpoint}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🔍 Fetching Sentry data for TAC Portal...\n');

    // Build report with ONLY controlled fields - no raw network data
    const report = {
        fetchedAt: new Date().toISOString(),
        organization: ORG_SLUG,
        project: PROJECT_SLUG,
        issues: [],
        stats: [],
        errors: [],
    };

    // Fetch unresolved issues (last 24h)
    console.log('\n📋 UNRESOLVED ISSUES (Last 24h)');
    console.log('─'.repeat(50));
    const rawIssues = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/issues/?query=is:unresolved&statsPeriod=24h`
    );

    if (rawIssues && Array.isArray(rawIssues)) {
        // Extract only known safe fields - prevents arbitrary data injection
        report.issues = rawIssues.slice(0, 100)
            .map(extractIssueFields)
            .filter(Boolean);

        if (report.issues.length === 0) {
            console.log('✅ No unresolved issues!');
        } else {
            report.issues.slice(0, 10).forEach((issue, i) => {
                console.log(`\n${i + 1}. ${issue.title}`);
                console.log(`   Level: ${issue.level} | Count: ${issue.count}`);
                console.log(`   First seen: ${issue.firstSeen}`);
                console.log(`   Last seen: ${issue.lastSeen}`);
                if (issue.culprit) console.log(`   Culprit: ${issue.culprit}`);
            });
            if (report.issues.length > 10) {
                console.log(`\n... and ${report.issues.length - 10} more issues`);
            }
        }
    }

    // Fetch project stats
    console.log('\n\n📊 ERROR STATS (Last 24h)');
    console.log('─'.repeat(50));
    const rawStats = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/stats/?stat=received&resolution=1h&statsPeriod=24h`
    );

    if (rawStats) {
        // Extract only numeric tuples
        report.stats = extractStats(rawStats);
        const total = report.stats.reduce((sum, [_, count]) => sum + count, 0);
        console.log(`Total errors received: ${total}`);

        // Find peak hours
        const sorted = [...report.stats].sort((a, b) => b[1] - a[1]);
        if (sorted[0] && sorted[0][1] > 0) {
            console.log(`Peak hour: ${new Date(sorted[0][0] * 1000).toISOString()} (${sorted[0][1]} errors)`);
        }
    }

    // Fetch recent events
    console.log('\n\n🔴 RECENT ERROR EVENTS');
    console.log('─'.repeat(50));
    const rawEvents = await fetchFromSentry(
        `projects/${ORG_SLUG}/${PROJECT_SLUG}/events/?full=true`
    );

    if (rawEvents && Array.isArray(rawEvents)) {
        // Extract only known safe fields
        report.errors = rawEvents.slice(0, 20)
            .map(extractEventFields)
            .filter(Boolean);

        report.errors.slice(0, 5).forEach((event, i) => {
            console.log(`\n${i + 1}. ${event.title || event.message || 'Unknown error'}`);
            console.log(`   ID: ${event.eventID}`);
            console.log(`   Time: ${event.dateCreated}`);
        });
    }

    // Save report - only contains extracted safe fields, not raw network data
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
