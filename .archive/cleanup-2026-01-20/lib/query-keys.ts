/**
 * React Query Keys Factory
 * Provides type-safe, consistent query key management for cache invalidation
 * 
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

import type { ShipmentFilters, InvoiceFilters, CustomerFilters } from '@/types';

export const queryKeys = {
    // Shipments
    shipments: {
        all: ['shipments'] as const,
        lists: () => [...queryKeys.shipments.all, 'list'] as const,
        list: (filters?: ShipmentFilters) => [...queryKeys.shipments.lists(), filters] as const,
        details: () => [...queryKeys.shipments.all, 'detail'] as const,
        detail: (awb: string) => [...queryKeys.shipments.details(), awb] as const,
    },

    // Invoices
    invoices: {
        all: ['invoices'] as const,
        lists: () => [...queryKeys.invoices.all, 'list'] as const,
        list: (filters?: InvoiceFilters) => [...queryKeys.invoices.lists(), filters] as const,
        details: () => [...queryKeys.invoices.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    },

    // Customers
    customers: {
        all: ['customers'] as const,
        lists: () => [...queryKeys.customers.all, 'list'] as const,
        list: (filters?: CustomerFilters) => [...queryKeys.customers.lists(), filters] as const,
        details: () => [...queryKeys.customers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.customers.details(), id] as const,
        search: (query: string) => [...queryKeys.customers.all, 'search', query] as const,
    },

    // Manifests
    manifests: {
        all: ['manifests'] as const,
        lists: () => [...queryKeys.manifests.all, 'list'] as const,
        list: (status?: string) => [...queryKeys.manifests.lists(), status] as const,
        detail: (id: string) => [...queryKeys.manifests.all, 'detail', id] as const,
    },

    // Tracking Events
    trackingEvents: {
        all: ['tracking-events'] as const,
        byShipment: (shipmentId: string) => [...queryKeys.trackingEvents.all, 'shipment', shipmentId] as const,
        byAwb: (awb: string) => [...queryKeys.trackingEvents.all, 'awb', awb] as const,
    },

    // Exceptions
    exceptions: {
        all: ['exceptions'] as const,
        lists: () => [...queryKeys.exceptions.all, 'list'] as const,
        list: (status?: string) => [...queryKeys.exceptions.lists(), status] as const,
        detail: (id: string) => [...queryKeys.exceptions.all, 'detail', id] as const,
    },

    // Audit Logs
    auditLogs: {
        all: ['audit-logs'] as const,
        list: (limit?: number) => [...queryKeys.auditLogs.all, 'list', limit] as const,
        byEntity: (entityType: string, entityId: string) =>
            [...queryKeys.auditLogs.all, 'entity', entityType, entityId] as const,
    },

    // Dashboard Stats
    dashboard: {
        all: ['dashboard'] as const,
        kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
        recentActivity: () => [...queryKeys.dashboard.all, 'recent-activity'] as const,
        charts: (dateRange?: { start: string; end: string }) =>
            [...queryKeys.dashboard.all, 'charts', dateRange] as const,
    },
} as const;

// Type exports for use with useQuery
export type ShipmentsQueryKey = ReturnType<typeof queryKeys.shipments.list>;
export type InvoicesQueryKey = ReturnType<typeof queryKeys.invoices.list>;
export type CustomersQueryKey = ReturnType<typeof queryKeys.customers.list>;
