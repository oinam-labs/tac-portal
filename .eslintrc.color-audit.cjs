/**
 * ESLint Configuration - Color Audit Rules
 * Warns about hardcoded Tailwind colors that should use semantic tokens
 * 
 * To use: Add to your main ESLint config extends array
 * Or run: eslint --config .eslintrc.color-audit.cjs "**/*.tsx"
    */

module.exports = {
    plugins: ['react'],
    rules: {
        // Custom rule to warn about hardcoded colors
        'no-restricted-syntax': [
            'warn',
            {
                // Warn on slate colors in className strings
                selector: 'JSXAttribute[name.name="className"] Literal[value=/text-slate-|bg-slate-|border-slate-/]',
                message: 'Avoid hardcoded slate colors. Use semantic tokens: text-muted-foreground, bg-muted, border-border',
            },
            {
                // Warn on gray colors in className strings
                selector: 'JSXAttribute[name.name="className"] Literal[value=/text-gray-|bg-gray-|border-gray-/]',
                message: 'Avoid hardcoded gray colors. Use semantic tokens: text-muted-foreground, bg-muted, border-border',
            },
        ],
    },
    overrides: [
        {
            files: ['**/*.tsx', '**/*.jsx'],
            rules: {
                // Additional rules for TSX files
            },
        },
    ],
};

/**
 * COLOR TOKEN MAPPING REFERENCE
 * =============================
 * 
 * Hardcoded Color -> Semantic Token
 * ---------------------------------
 * text-slate-50/100      -> text-background (for inverted text)
 * text-slate-200/300     -> text-muted
 * text-slate-400/500     -> text-muted-foreground
 * text-slate-600/700     -> text-foreground
 * text-slate-800/900     -> text-foreground
 * 
 * bg-slate-50/100        -> bg-background, bg-muted
 * bg-slate-200/300       -> bg-muted, bg-accent
 * bg-slate-700/800       -> bg-card (dark mode)
 * bg-slate-900           -> bg-background (dark mode)
 * 
 * border-slate-200/300   -> border-border
 * border-slate-600/700   -> border-border (dark mode)
 * 
 * DARK MODE PAIRS
 * ---------------
 * text-slate-500 dark:text-slate-400  -> text-muted-foreground
 * text-slate-600 dark:text-slate-300  -> text-foreground
 * bg-slate-100 dark:bg-slate-800      -> bg-muted
 * border-slate-200 dark:border-slate-700 -> border-border
 */
