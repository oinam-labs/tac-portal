---
name: tac-api-architect
description: API design expert for TAC Portal. Use when designing Supabase queries, creating data access patterns, implementing TanStack Query hooks, or building type-safe API layers.
metadata:
  author: tac-portal
  version: "1.0"
---

# TAC API Architect

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Query   │────▶│   Repository    │────▶│    Supabase     │
│   (Caching)     │     │   (Data Access) │     │    (Database)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Data Access Layer

### Repository Pattern

```typescript
// lib/data-access/types.ts
export interface Repository<T> {
  getById(id: string): Promise<T | null>;
  getAll(filters?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// lib/data-access/supabase-repository.ts
export class SupabaseInvoiceRepository implements Repository<Invoice> {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        shipment:shipments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new RepositoryError('Failed to fetch invoice', error);
    return data;
  }

  async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    let query = this.supabase
      .from('invoices')
      .select('*, customer:customers(name)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    const { data, error } = await query;
    if (error) throw new RepositoryError('Failed to fetch invoices', error);
    return data ?? [];
  }

  async create(invoice: CreateInvoicePayload): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw new RepositoryError('Failed to create invoice', error);
    return data;
  }
}
```

---

## TanStack Query Hooks

### Query Hook Pattern

```typescript
// hooks/useInvoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoiceRepository.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoicePayload) => 
      invoiceRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
```

### Optimistic Updates

```typescript
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoiceRepository.update(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: invoiceKeys.detail(id) });
      
      const previous = queryClient.getQueryData(invoiceKeys.detail(id));
      
      queryClient.setQueryData(invoiceKeys.detail(id), (old: Invoice) => ({
        ...old,
        status,
      }));
      
      return { previous };
    },

    onError: (err, { id }, context) => {
      queryClient.setQueryData(invoiceKeys.detail(id), context?.previous);
      toast.error('Failed to update status');
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}
```

---

## Supabase Query Patterns

### Filtering

```typescript
// Complex filters
const { data } = await supabase
  .from('shipments')
  .select('*')
  .eq('org_id', orgId)
  .in('status', ['IN_TRANSIT', 'OUT_FOR_DELIVERY'])
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Joins

```typescript
// Nested selects (foreign keys)
const { data } = await supabase
  .from('invoices')
  .select(`
    id,
    invoice_number,
    total,
    customer:customers (
      id,
      name,
      email
    ),
    shipment:shipments (
      awb_number,
      status,
      packages:packages (
        id,
        weight
      )
    )
  `)
  .eq('id', invoiceId)
  .single();
```

### Pagination

```typescript
// Cursor-based (recommended)
async function fetchPage(cursor?: string) {
  let query = supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data } = await query;
  const nextCursor = data?.[data.length - 1]?.created_at;
  
  return { data, nextCursor };
}
```

---

## Error Handling

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in hooks
export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError('Invoice not found', 'NOT_FOUND', 404);
        }
        throw new ApiError('Failed to fetch invoice', 'FETCH_ERROR', 500, error);
      }

      return data;
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
```

---

## Type Safety

### Zod Validation

```typescript
// lib/schemas/invoice.ts
import { z } from 'zod';

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().regex(/^INV-\d{4}-\d+$/),
  customerId: z.string().uuid(),
  awb: z.string().regex(/^TAC\d{8}$/),
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'OVERDUE']),
  financials: z.object({
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().positive(),
  }),
  createdAt: z.string().datetime(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Runtime validation
const validated = invoiceSchema.parse(apiResponse);
```

---

## Real-time Subscriptions

```typescript
// hooks/useRealtimeInvoices.ts
export function useRealtimeInvoices(orgId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData(
              invoiceKeys.detail(payload.new.id),
              payload.new
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, queryClient]);
}
```

---

## When to Use This Skill

- "Create API hooks for [entity]"
- "Design data fetching pattern"
- "Implement real-time updates"
- "Add pagination to list"
- "Handle API errors"
