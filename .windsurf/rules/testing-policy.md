---
description: Testing policy and required test coverage for TAC Cargo
activation: always
---

# Testing Policy Rule

## Why This Rule Exists
TAC Cargo handles financial documents (invoices), operational data (manifests), and audit-critical events (scans). Untested code in production causes:
- Revenue loss from calculation bugs
- Operational failures from broken workflows
- Compliance issues from missing audit trails
- Customer trust erosion from data errors

This rule defines minimum testing requirements.

---

## Test Framework Stack

| Type | Tool | Config | Command |
|------|------|--------|---------|
| Unit | Vitest | `vitest.config.ts` | `npm run test:unit` |
| E2E | Playwright | `playwright.config.ts` | `npm run test` |
| Coverage | Vitest | Built-in | `npm run test:unit:coverage` |

---

## Required Test Coverage by Module

### Critical Modules (Must Have Tests)
| Module | Unit Tests | E2E Tests |
|--------|-----------|-----------|
| Invoices | Calculation logic, number format | Create → Pay flow |
| Scanning | Parser, queue operations | Scan → Sync flow |
| Manifests | Status transitions, totals | Full lifecycle |
| Shipments | Status updates, AWB validation | Create → Track flow |

### Secondary Modules (Should Have Tests)
| Module | Recommended Tests |
|--------|-------------------|
| Customers | CRUD operations |
| Exceptions | Create, resolve flow |
| Auth | Login, logout, session |
| Dashboard | Data aggregation |

---

## Unit Test Standards

### File Location
```
tests/unit/
├── lib/
│   ├── errors.test.ts
│   ├── scanParser.test.ts
│   ├── utils.test.ts
│   └── services/
│       └── invoiceService.test.ts
├── hooks/
│   └── useManifests.test.ts
├── store/
│   └── scanQueueStore.test.ts
└── components/
    └── domain/
        └── StatusBadge.test.ts
```

### Test Structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseScanInput } from '@/lib/scanParser';

describe('parseScanInput', () => {
  describe('AWB format', () => {
    it('parses valid TAC AWB', () => {
      const result = parseScanInput('TAC12345678');
      expect(result.type).toBe('shipment');
      expect(result.awb).toBe('TAC12345678');
    });

    it('throws on invalid format', () => {
      expect(() => parseScanInput('INVALID')).toThrow('Invalid scan format');
    });
  });

  describe('JSON payload', () => {
    it('parses manifest QR', () => {
      const payload = JSON.stringify({ v: 1, type: 'manifest', id: 'uuid' });
      const result = parseScanInput(payload);
      expect(result.type).toBe('manifest');
    });
  });
});
```

### Mocking Patterns
```typescript
// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  },
}));

// Mock org service
vi.mock('@/lib/services/orgService', () => ({
  orgService: {
    getCurrentOrgId: vi.fn(() => 'test-org-id'),
  },
}));
```

---

## E2E Test Standards

### File Location
```
tests/e2e/
├── auth.spec.ts
├── shipments.spec.ts
├── manifests.spec.ts
└── scanning.spec.ts
```

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Manifest Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('create and close manifest', async ({ page }) => {
    await page.goto('/manifests');
    
    // Create manifest
    await page.click('text=New Manifest');
    await page.selectOption('[name="type"]', 'AIR');
    await page.click('text=Create');
    
    // Verify created
    await expect(page.locator('[data-testid="manifest-status"]')).toHaveText('OPEN');
    
    // Close manifest
    await page.click('text=Close Manifest');
    await expect(page.locator('[data-testid="manifest-status"]')).toHaveText('CLOSED');
  });
});
```

---

## Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode (development)
npm run test:unit:watch

# Run unit tests with coverage report
npm run test:unit:coverage

# Run all E2E tests (headless)
npm run test

# Run E2E tests with UI (debugging)
npm run test:ui

# Run E2E tests in headed browser
npm run test:headed

# Debug E2E tests
npm run test:debug
```

---

## When Tests Are Required

### Always Required
- [ ] New service method
- [ ] New utility function with logic
- [ ] Invoice calculation change
- [ ] Scan parsing change
- [ ] Status transition change

### Strongly Recommended
- [ ] New hook with business logic
- [ ] New validation schema
- [ ] Error handling change
- [ ] Auth flow change

### Optional (Manual QA OK)
- [ ] UI component styling
- [ ] Layout change
- [ ] Copy/text change

---

## Test Setup

### Unit Test Setup (`tests/unit/setup.ts`)
```typescript
import { vi } from 'vitest';

// Mock environment
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

### Playwright Setup (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Manual QA Checklist Template

When automated tests are not practical, provide a manual checklist:

```markdown
## Manual QA for [Feature Name]

### Prerequisites
- [ ] Test user logged in
- [ ] Sample data available

### Steps
1. Navigate to [page]
2. Click [button]
3. Verify [expected result]

### Expected Results
- [ ] [Result 1]
- [ ] [Result 2]

### Edge Cases
- [ ] Empty state displays correctly
- [ ] Error state shows message
- [ ] Loading state shows spinner
```

---

## Coverage Thresholds (Goals)

| Category | Target | Current |
|----------|--------|---------|
| Statements | 70% | TBD |
| Branches | 60% | TBD |
| Functions | 70% | TBD |
| Lines | 70% | TBD |

**Critical modules** (invoices, scanning, manifests) should exceed 80% coverage.
