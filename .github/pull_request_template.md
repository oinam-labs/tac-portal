# Pull Request

## 📋 Description
<!-- Provide a brief description of the changes in this PR -->

## 🔗 Related Issues
<!-- Link to related GitHub issues -->
- Closes #
- Related to #

## 🧪 Type of Change
<!-- Mark the relevant option with an "x" -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test coverage improvement
- [ ] 🔒 Security fix

## 🔒 Security Checklist
<!-- MANDATORY for all PRs - Mark with "x" or "N/A" -->
- [ ] No hardcoded secrets, API keys, or passwords
- [ ] No sensitive data logged to console
- [ ] Input validation implemented where applicable
- [ ] No SQL injection vulnerabilities (parameterized queries only)
- [ ] No XSS vulnerabilities (proper sanitization)
- [ ] Authentication/authorization checks in place
- [ ] PII data handling follows privacy guidelines
- [ ] No `dangerouslySetInnerHTML` without sanitization

## 🎯 Code Quality Checklist
<!-- Mark with "x" or "N/A" -->
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] ESLint passes without warnings
- [ ] No `console.log` statements in production code
- [ ] Proper error handling implemented
- [ ] Code follows existing patterns and conventions
- [ ] Functions and variables have descriptive names
- [ ] Complex logic is commented/documented

## 🧪 Testing Checklist
<!-- Mark with "x" or "N/A" -->
- [ ] Unit tests added/updated for new functionality
- [ ] Component tests added/updated where applicable
- [ ] All existing tests pass
- [ ] E2E tests pass (run `npm test`)
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

## 📱 UI/UX Checklist
<!-- For frontend changes - Mark with "x" or "N/A" -->
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility standards followed (ARIA labels, keyboard navigation)
- [ ] Loading states implemented where applicable
- [ ] Error states handled gracefully
- [ ] Consistent with design system/UI patterns
- [ ] Performance impact considered (bundle size, render performance)

## 🚀 Performance Checklist
<!-- Mark with "x" or "N/A" -->
- [ ] No unnecessary re-renders (React.memo, useMemo, useCallback used appropriately)
- [ ] Database queries optimized (proper indexes, no N+1 queries)
- [ ] Bundle size impact considered
- [ ] Images optimized (if applicable)
- [ ] Lazy loading implemented where beneficial

## 📊 Database Changes
<!-- For database-related changes -->
- [ ] Database migrations included (if schema changes)
- [ ] RLS policies updated (if new tables/columns)
- [ ] Indexes added for new foreign keys
- [ ] Backward compatibility maintained
- [ ] Migration tested on staging environment

## 🔍 Review Guidelines

### For Reviewers
Please check:
1. **Security:** Review security checklist items carefully
2. **Code Quality:** Ensure TypeScript strict mode compliance
3. **Testing:** Verify adequate test coverage
4. **Performance:** Consider impact on bundle size and runtime performance
5. **Accessibility:** Check for proper ARIA labels and keyboard navigation

### Critical Review Areas
- [ ] Authentication/authorization logic
- [ ] Data validation and sanitization
- [ ] Error handling and logging
- [ ] Database queries and RLS policies
- [ ] Type safety (no `any` types)

## 📸 Screenshots
<!-- For UI changes, include before/after screenshots -->

## 🧪 Testing Instructions
<!-- Provide step-by-step instructions for testing this PR -->
1. 
2. 
3. 

## 📝 Additional Notes
<!-- Any additional information for reviewers -->

---

## ✅ Pre-Merge Checklist
<!-- Final checks before merging -->
- [ ] All CI/CD checks pass
- [ ] Security review completed
- [ ] Code review approved by at least 1 reviewer
- [ ] Documentation updated (if applicable)
- [ ] Breaking changes communicated to team
- [ ] Ready for production deployment

---

**By submitting this PR, I confirm that:**
- [ ] I have followed the security guidelines
- [ ] I have tested my changes thoroughly
- [ ] I have considered the impact on existing functionality
- [ ] I have updated documentation where necessary

<!-- 
Enterprise Code Review Standards:
- All PRs must pass security checklist
- TypeScript strict mode required (no `any` types)
- Minimum test coverage maintained
- Performance impact considered
- Accessibility standards followed
-->
