---
name: tac-testing-engineer
description: Testing expert for TAC Portal. Use when writing unit tests, integration tests, E2E tests with Playwright, or establishing testing strategies for React/TypeScript applications.
metadata:
  author: tac-portal
  version: "1.0"
---

# TAC Testing Engineer

## Testing Philosophy
**Test behavior, not implementation.** Tests should validate what users experience, not internal component details. Every test should answer: "Does this feature work correctly?"

---

## Testing Stack

| Tool | Purpose | Location |
|------|---------|----------|
| **Vitest** | Unit & Integration tests | `*.test.ts`, `*.test.tsx` |
| **React Testing Library** | Component testing | `*.test.tsx` |
| **Playwright** | E2E browser tests | `e2e/*.spec.ts` |
| **MSW** | API mocking | `mocks/handlers.ts` |

---

## Test Coverage Requirements

| Category | Minimum | Target |
|----------|---------|--------|
| **Statements** | 70% | 85% |
| **Branches** | 65% | 80% |
| **Functions** | 70% | 85% |
| **Lines** | 70% | 85% |

**Critical paths require 100% coverage:**
- Invoice creation/calculation
- Payment processing
- Authentication flows
- AWB generation

---

## Unit Testing

### Pure Functions

```typescript
// lib/invoiceCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoice, calculateGST, validateAWB } from './invoiceCalculator';

describe('calculateGST', () => {
  it('calculates 18% GST correctly', () => {
    expect(calculateGST(1000, 18)).toBe(180);
  });

  it('rounds to nearest rupee', () => {
    expect(calculateGST(999.50, 18)).toBe(180);  // Not 179.91
  });

  it('handles zero subtotal', () => {
    expect(calculateGST(0, 18)).toBe(0);
  });
});

describe('validateAWB', () => {
  it('accepts valid AWB format', () => {
    expect(validateAWB('TAC48878789')).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(validateAWB('tac48878789')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validateAWB('TAC123')).toBe(false);
  });
});

describe('calculateInvoice', () => {
  const baseInput = {
    weight: 10,
    ratePerKg: 100,
    gstRate: 18,
    pickupCharge: 50,
    discount: 0,
  };

  it('calculates complete invoice correctly', () => {
    const result = calculateInvoice(baseInput);
    
    expect(result.baseFreight).toBe(1000);
    expect(result.subtotal).toBe(1050);
    expect(result.tax).toBe(189);
    expect(result.total).toBe(1239);
  });

  it('applies discount before GST', () => {
    const result = calculateInvoice({ ...baseInput, discount: 100 });
    
    expect(result.subtotal).toBe(950);
    expect(result.tax).toBe(171);
    expect(result.total).toBe(1121);
  });
});
```

### Custom Hooks

```typescript
// hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });
    expect(result.current).toBe('hello');  // Still old value

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');  // Now updated
  });
});
```

---

## Component Testing

### Basic Component

```typescript
// components/InvoiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceCard } from './InvoiceCard';

const mockInvoice = {
  id: '1',
  invoiceNumber: 'INV-2026-001',
  customerName: 'Test Corp',
  total: 15000,
  status: 'ISSUED' as const,
};

describe('InvoiceCard', () => {
  it('renders invoice details', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
    expect(screen.getByText('₹15,000')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    
    const badge = screen.getByText('ISSUED');
    expect(badge).toHaveClass('bg-blue-500');  // Or appropriate class
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<InvoiceCard invoice={mockInvoice} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('article'));
    
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('shows mark as paid button for unpaid invoices', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    
    expect(screen.getByRole('button', { name: /mark as paid/i })).toBeInTheDocument();
  });

  it('hides mark as paid button for paid invoices', () => {
    render(<InvoiceCard invoice={{ ...mockInvoice, status: 'PAID' }} />);
    
    expect(screen.queryByRole('button', { name: /mark as paid/i })).not.toBeInTheDocument();
  });
});
```

### Form Component

```typescript
// components/InvoiceForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceForm } from './InvoiceForm';

describe('InvoiceForm', () => {
  it('validates AWB format on blur', async () => {
    render(<InvoiceForm onSubmit={vi.fn()} />);
    
    const awbInput = screen.getByLabelText(/awb number/i);
    await userEvent.type(awbInput, 'invalid');
    fireEvent.blur(awbInput);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid awb format/i)).toBeInTheDocument();
    });
  });

  it('prevents submission with invalid data', async () => {
    const onSubmit = vi.fn();
    render(<InvoiceForm onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('submits valid form data', async () => {
    const onSubmit = vi.fn();
    render(<InvoiceForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/awb/i), 'TAC12345678');
    await userEvent.type(screen.getByLabelText(/customer/i), 'Test Customer');
    await userEvent.type(screen.getByLabelText(/amount/i), '1000');
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        awb: 'TAC12345678',
        customerName: 'Test Customer',
        amount: 1000,
      });
    });
  });
});
```

---

## Integration Testing (with MSW)

### API Mocking Setup

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/invoices', () => {
    return HttpResponse.json([
      { id: '1', invoiceNumber: 'INV-001', total: 1000 },
      { id: '2', invoiceNumber: 'INV-002', total: 2000 },
    ]);
  }),

  http.post('/api/invoices', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-id',
      invoiceNumber: 'INV-003',
      ...body,
    }, { status: 201 });
  }),

  http.get('/api/invoices/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      invoiceNumber: `INV-${params.id}`,
      total: 1500,
    });
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Integration Test

```typescript
// pages/Invoices.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { InvoicesPage } from './Invoices';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('InvoicesPage', () => {
  it('fetches and displays invoices', async () => {
    render(<InvoicesPage />, { wrapper: createWrapper() });
    
    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Data loaded
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    server.use(
      http.get('/api/invoices', () => {
        return HttpResponse.error();
      })
    );

    render(<InvoicesPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing (Playwright)

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test

```typescript
// e2e/invoice-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates invoice successfully', async ({ page }) => {
    await page.goto('/invoices/new');
    
    // Step 1: Customer Selection
    await page.fill('[data-testid="customer-search"]', 'Test Corp');
    await page.click('[data-testid="customer-option-1"]');
    await page.click('button:has-text("Next")');
    
    // Step 2: Shipment Details
    await page.fill('[name="weight"]', '10');
    await page.selectOption('[name="mode"]', 'AIR');
    await page.click('button:has-text("Next")');
    
    // Step 3: Pricing
    await expect(page.locator('[data-testid="calculated-total"]'))
      .toContainText('₹');
    await page.click('button:has-text("Create Invoice")');
    
    // Success
    await expect(page.locator('.toast-success'))
      .toContainText('Invoice created');
    await expect(page).toHaveURL(/\/invoices\/INV-/);
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/invoices/new');
    await page.click('button:has-text("Next")');
    
    await expect(page.locator('.error-message'))
      .toContainText('Customer is required');
  });
});
```

### Page Object Model

```typescript
// e2e/pages/InvoicePage.ts
import { Page, Locator } from '@playwright/test';

export class InvoicePage {
  readonly page: Page;
  readonly customerSearch: Locator;
  readonly weightInput: Locator;
  readonly modeSelect: Locator;
  readonly submitButton: Locator;
  readonly totalDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerSearch = page.getByTestId('customer-search');
    this.weightInput = page.locator('[name="weight"]');
    this.modeSelect = page.locator('[name="mode"]');
    this.submitButton = page.getByRole('button', { name: /create invoice/i });
    this.totalDisplay = page.getByTestId('calculated-total');
  }

  async goto() {
    await this.page.goto('/invoices/new');
  }

  async selectCustomer(name: string) {
    await this.customerSearch.fill(name);
    await this.page.click(`[data-testid="customer-option"]:has-text("${name}")`);
  }

  async fillShipmentDetails(weight: number, mode: 'AIR' | 'TRUCK') {
    await this.weightInput.fill(weight.toString());
    await this.modeSelect.selectOption(mode);
  }

  async submit() {
    await this.submitButton.click();
  }
}
```

---

## Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

---

## Testing Checklist

Before PR merge:
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Coverage meets threshold
- [ ] No flaky tests
- [ ] E2E tests for critical paths
- [ ] Edge cases covered
- [ ] Error states tested

---

## When to Use This Skill

- "Write tests for this component"
- "Add E2E test for [flow]"
- "Mock this API call"
- "Increase test coverage"
- "Fix flaky test"
- "Set up testing infrastructure"
