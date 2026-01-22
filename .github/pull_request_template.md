## 📋 Description

<!-- Provide a clear and concise description of your changes -->

## 🎯 Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] 🧪 Test update

## 🔒 Security Checklist

**All PRs must complete this security checklist:**

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] No PII logged to console or external services
- [ ] Input validation implemented for user inputs
- [ ] SQL injection prevention verified (parameterized queries)
- [ ] XSS prevention verified (sanitized outputs)
- [ ] Authentication/authorization checks in place
- [ ] Sensitive data cleared on logout (localStorage, sessionStorage)
- [ ] CORS and CSP policies reviewed if applicable

## 💻 Code Quality Checklist

- [ ] No `any` types added (or justified in comments)
- [ ] No `console.log` statements (use logger or gate with `import.meta.env.DEV`)
- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code follows existing patterns and conventions
- [ ] No unused imports or variables

## 🧪 Testing Checklist

- [ ] Unit tests added/updated for new functionality
- [ ] E2E tests added/updated if user-facing changes
- [ ] All existing tests pass (`npm run test:unit && npm run test`)
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

## ♿ Accessibility Checklist

- [ ] Semantic HTML elements used
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation works correctly
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible

## 📊 Performance Checklist

- [ ] No unnecessary re-renders introduced
- [ ] Large lists virtualized if applicable
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size impact considered
- [ ] No N+1 query patterns introduced

## 🗄️ Database Changes

<!-- Complete if this PR includes database changes -->

- [ ] Migration file created
- [ ] RLS policies updated if needed
- [ ] Indexes added for query performance
- [ ] Rollback plan documented
- [ ] Data migration tested

## 📸 Screenshots

<!-- Add screenshots for UI changes -->

## 🔗 Related Issues

<!-- Link related issues: Fixes #123, Relates to #456 -->

## ✅ Pre-Merge Checklist

- [ ] PR title follows conventional commit format
- [ ] Branch is up to date with main
- [ ] All CI checks pass
- [ ] Code review completed
- [ ] Documentation updated if needed

---

**Reviewer Notes:**
<!-- Any specific areas you'd like reviewers to focus on -->
