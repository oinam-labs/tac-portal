#!/usr/bin/env node

/**
 * Hub Code Audit Script
 * 
 * Purpose: Scan the codebase for invalid hub code references (IXA)
 * Valid codes: DEL, GAU, CCU, IMF
 * Forbidden: IXA
 * 
 * Usage: node scripts/audit-hub-codes.js
 * Exit: 0 if clean, 1 if violations found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, normalize, resolve, sep } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const FORBIDDEN_CODE = 'IXA';
const VALID_CODES = ['DEL', 'GAU', 'CCU', 'IMF'];

// Directories to scan
const SCAN_DIRS = [
    'components',
    'pages',
    'lib',
    'hooks',
    'store',
    'types',
    'supabase/migrations',
    'tests',
];

// File extensions to check
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.md'];

// Patterns to ignore (legitimate documentation, etc.)
const IGNORE_PATTERNS = [
    /audit-hub-codes\.js/, // This file itself
    /TAC_CARGO_FULL_.*\.md/, // Documentation files explaining the migration
    /CLEANUP_.*\.md/, // Cleanup reports
    /\.git\//, // Git directory
    /node_modules\//, // Dependencies
    /dist\//, // Build output
    /\.next\//, // Next.js build
];

const violations = [];

function shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Security: Validate that a path stays within the expected base directory
 * to prevent path traversal attacks.
 */
function isPathWithinBase(targetPath, baseDir) {
    const normalizedTarget = normalize(resolve(targetPath));
    const normalizedBase = normalize(resolve(baseDir));
    return normalizedTarget.startsWith(normalizedBase + sep) || normalizedTarget === normalizedBase;
}

function scanFile(filePath) {
    if (shouldIgnore(filePath)) return;

    // Security: Validate path is within ROOT_DIR to prevent path traversal
    if (!isPathWithinBase(filePath, ROOT_DIR)) {
        console.error(`Security: Skipping path outside root: ${filePath}`);
        return;
    }

    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            // Check for forbidden code
            if (line.includes(FORBIDDEN_CODE)) {
                const trimmed = line.trim();

                // Ignore if it's in a comment explaining the migration
                if (
                    trimmed.startsWith('//') &&
                    (trimmed.includes('→') || trimmed.includes('migration') || trimmed.includes('old'))
                ) {
                    return;
                }
                if (trimmed.startsWith('*') && trimmed.includes('migration')) {
                    return;
                }

                // Ignore SQL migration file that's updating IXA to IMF
                if (filePath.includes('012_enforce_imf_hub_codes.sql')) {
                    return;
                }

                // Ignore test files checking for absence of IXA
                if (filePath.includes('production-readiness.spec.ts')) {
                    // Allow lines that check for NOT having IXA or describe what should NOT be there
                    if (
                        line.includes('not.toContain') ||
                        line.includes('not display') ||
                        line.includes('Should NOT') ||
                        line.includes('No IXA') ||
                        line.includes('not "') ||
                        line.includes('imphalIXA') ||
                        line.includes('.toBe(false)')
                    ) {
                        return;
                    }
                }

                violations.push({
                    file: relative(ROOT_DIR, filePath),
                    line: index + 1,
                    content: line.trim(),
                });
            }
        });
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
    }
}

function scanDirectory(dirPath) {
    // Security: Validate directory is within ROOT_DIR
    if (!isPathWithinBase(dirPath, ROOT_DIR)) {
        console.error(`Security: Skipping directory outside root: ${dirPath}`);
        return;
    }

    try {
        const entries = readdirSync(dirPath);

        entries.forEach((entry) => {
            // Security: Reject entries with path traversal attempts
            if (entry.includes('..') || entry.includes('/') || entry.includes('\\')) {
                console.error(`Security: Skipping invalid entry name: ${entry}`);
                return;
            }

            const fullPath = join(dirPath, entry);

            // Security: Validate resolved path stays within ROOT_DIR
            if (!isPathWithinBase(fullPath, ROOT_DIR)) {
                console.error(`Security: Skipping path outside root: ${fullPath}`);
                return;
            }

            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (stat.isFile()) {
                const ext = entry.substring(entry.lastIndexOf('.'));
                if (EXTENSIONS.includes(ext)) {
                    scanFile(fullPath);
                }
            }
        });
    } catch (err) {
        console.error(`Error scanning directory ${dirPath}:`, err.message);
    }
}

console.log('🔍 Auditing codebase for invalid hub codes...\n');
console.log(`   Forbidden: ${FORBIDDEN_CODE}`);
console.log(`   Valid: ${VALID_CODES.join(', ')}\n`);

SCAN_DIRS.forEach((dir) => {
    // Security: Validate scan directory names
    if (dir.includes('..') || dir.startsWith('/') || dir.startsWith('\\')) {
        console.error(`Security: Skipping invalid scan directory: ${dir}`);
        return;
    }

    const fullPath = resolve(ROOT_DIR, dir);

    // Security: Verify path stays within ROOT_DIR
    if (!isPathWithinBase(fullPath, ROOT_DIR)) {
        console.error(`Security: Skipping directory outside root: ${fullPath}`);
        return;
    }

    console.log(`   Scanning ${dir}/`);
    scanDirectory(fullPath);
});

console.log('\n' + '='.repeat(60) + '\n');

if (violations.length === 0) {
    console.log('✅ PASSED: No invalid hub code references found\n');
    process.exit(0);
} else {
    console.log(`❌ FAILED: Found ${violations.length} violation(s)\n`);
    violations.forEach((v) => {
        console.log(`   ${v.file}:${v.line}`);
        console.log(`      ${v.content}\n`);
    });
    console.log('Please fix these references before pushing.\n');
    process.exit(1);
}
