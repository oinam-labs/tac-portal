# Comprehensive Frontend Code Review Request

**Date:** January 20, 2026  
**Scope:** Full Frontend Codebase Audit

---

## Review Objectives

This PR is created specifically to trigger a comprehensive CodeRabbit review of the entire TAC Portal frontend codebase.

### Areas to Review

#### 1. Architecture & Design Patterns
- Component composition and reusability
- State management patterns (Zustand stores)
- Custom hooks organization
- Service layer architecture

#### 2. Security
- XSS prevention and input sanitization
- Authentication flow security
- Authorization (RBAC) implementation
- Sensitive data handling
- API key management

#### 3. Performance
- React rendering optimization
- Bundle size analysis
- Lazy loading implementation
- Query caching strategies (React Query)

#### 4. Type Safety
- TypeScript strictness
- Type inference issues
- Generic type usage
- Runtime type validation (Zod schemas)

#### 5. Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast and visual accessibility

#### 6. Code Quality
- Dead code detection
- Duplicate code analysis
- Consistent naming conventions
- Error handling patterns

#### 7. Testing Coverage
- E2E test coverage
- Component test opportunities
- Edge case handling

---

## Key Files and Directories

### Core Application
- `App.tsx` - Main application entry
- `store/` - Zustand state management
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and services

### Components
- `components/ui/` - UI primitives
- `components/domain/` - Business logic components
- `components/layout/` - Layout components
- `components/shipping/` - Shipping-specific components
- `components/finance/` - Finance module components

### Services
- `lib/services/` - API service layer
- `lib/notifications/` - Notification system
- `lib/supabase/` - Supabase client utilities

### Pages
- `pages/` - Route-level page components
- `app/(protected)/` - Protected route pages

---

## @coderabbitai Review Instructions

Please perform a comprehensive review focusing on:

1. **Critical Issues** - Security vulnerabilities, data leaks, runtime errors
2. **Major Issues** - Performance bottlenecks, accessibility failures, type safety gaps
3. **Minor Issues** - Code style, naming, documentation
4. **Suggestions** - Best practices, modern patterns, optimization opportunities

### Specific Areas of Concern

- The `NotesPanel` component uses DOMPurify - verify sanitization is adequate
- The `useManifests` hook has complex async logic - check for race conditions
- The authentication flow in `authStore.ts` - verify token refresh handling
- Real-time subscriptions in `useRealtime.ts` - check for memory leaks
- PDF generation in `InvoiceDetails.tsx` - verify large data handling

---

## Files Modified in This Review Branch

This is a review-only PR. The trigger file for CodeRabbit review is this markdown file.
