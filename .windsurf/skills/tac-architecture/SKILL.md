---
name: tac-architecture
description: Architecture analysis and safe refactoring guidance for TAC Cargo codebase.
version: 2.0.0
tags: [tac, architecture, refactoring, patterns]
---

# Architecture Analysis Skill

## Purpose
Analyze and document TAC Cargo architecture, identify patterns, and guide safe refactoring decisions while maintaining system integrity.

## Preconditions
- [ ] Full codebase access
- [ ] Understanding of module boundaries
- [ ] Review of existing patterns

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                    Pages                         │
│  (Dashboard, Shipments, Manifests, Scanning)    │
├─────────────────────────────────────────────────┤
│                  Components                      │
│  (UI primitives, domain components, layouts)    │
├─────────────────────────────────────────────────┤
│                    Hooks                         │
│  (useShipments, useManifests, useInvoices)      │
├─────────────────────────────────────────────────┤
│                   Services                       │
│  (shipmentService, manifestService, etc.)       │
├─────────────────────────────────────────────────┤
│                    Stores                        │
│  (authStore, scanQueueStore, auditStore)        │
├─────────────────────────────────────────────────┤
│                  Supabase                        │
│  (PostgreSQL + Auth + RLS + Edge Functions)     │
└─────────────────────────────────────────────────┘
```

## Key Patterns

### Data Flow Pattern
```
Page → Hook → Service → Supabase
  ↓       ↓        ↓
 UI    React    Org-scoped
State  Query    Queries
```

### Service Pattern
```typescript
// All services follow this pattern
export const entityService = {
  async list(filters?: Filters): Promise<Entity[]>,
  async getById(id: string): Promise<Entity>,
  async create(data: CreateInput): Promise<Entity>,
  async update(id: string, data: UpdateInput): Promise<Entity>,
  async delete(id: string): Promise<void>,
};
```

### Hook Pattern
```typescript
// Query keys factory
export const entityKeys = {
  all: ['entities'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id) => [...entityKeys.details(), id] as const,
};

// Hook using React Query
export function useEntities(filters?: Filters) {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entityService.list(filters),
  });
}
```

## Module Boundaries

| Module | Owns | Depends On |
|--------|------|------------|
| Shipments | shipments, tracking_events | customers, hubs |
| Manifests | manifests, manifest_items | shipments, hubs, staff |
| Invoices | invoices, invoice_counters | customers, shipments |
| Scanning | scan queue (local) | shipments, manifests |
| Exceptions | exceptions | shipments, staff |
| Customers | customers | orgs |
| Auth | staff, orgs | Supabase Auth |

## Safe Refactoring Checklist

Before any refactoring:
- [ ] Identify all usages of target code
- [ ] Verify test coverage exists
- [ ] Plan incremental changes
- [ ] Prepare rollback strategy

### Safe Changes
- Renaming local variables
- Extracting pure functions
- Adding new optional parameters
- Creating new utility functions

### Risky Changes (Need Approval)
- Renaming exported functions
- Changing function signatures
- Moving files between directories
- Modifying database queries
- Changing state shape

### Forbidden Without Migration
- Schema changes
- Identifier format changes
- Status value changes
- RLS policy changes

## File Organization

```
lib/
├── services/          # Data access (one per entity)
│   ├── index.ts       # Re-exports
│   ├── shipmentService.ts
│   └── ...
├── schemas/           # Zod validation schemas
├── hooks/             # Shared utility hooks
├── utils/             # Pure utility functions
└── errors.ts          # Error handling

hooks/                 # React Query hooks (one per entity)
├── useShipments.ts
├── useManifests.ts
└── ...

store/                 # Zustand stores
├── authStore.ts
├── scanQueueStore.ts
└── ...

pages/                 # Route pages
├── Dashboard.tsx
├── Shipments.tsx
└── ...

components/
├── ui/               # shadcn/ui primitives
├── domain/           # Cross-module components
├── manifests/        # Module-specific
└── ...
```

## Output Format

```markdown
## Architecture Analysis

### Current State
- Module: [name]
- Pattern: [service/hook/store]
- Dependencies: [list]

### Proposed Change
- Type: [refactor/feature/fix]
- Scope: [files affected]
- Risk: [low/medium/high]

### Impact Analysis
- Breaking changes: [yes/no]
- Migration required: [yes/no]
- Test updates needed: [yes/no]

### Recommendation
[Proceed/Modify/Avoid]
