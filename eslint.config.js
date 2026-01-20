/**
 * ESLint 9.x Flat Config for TAC Portal
 * Migrated from legacy .eslintrc.json
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    // Base JavaScript recommended config
    eslint.configs.recommended,

    // TypeScript recommended configs
    ...tseslint.configs.recommended,

    // Global ignores
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
            'vite.config.ts',
            'playwright.config.ts',
            'supabase/functions/**', // Edge functions use Deno runtime
        ],
    },

    // TypeScript and JavaScript files
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
            },
        },
        rules: {
            // React rules (no plugin needed for basic rules)
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // TypeScript rules 
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // Console rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // Disable base rules that TypeScript handles
            'no-unused-vars': 'off',
            'no-undef': 'off',
        },
    },
);
