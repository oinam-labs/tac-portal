import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { getOrCreateDefaultOrg } from '../lib/org-helper';

// Type helper to work around Supabase client type inference issues
const db = supabase as any;

/**
 * Query key factory for invoices.
 * Provides consistent, type-safe query keys for caching.
 */
export const invoiceKeys = {
    all: ['invoices'] as const,
    lists: () => [...invoiceKeys.all, 'list'] as const,
    list: (filters?: { status?: string; customerId?: string }) => [...invoiceKeys.lists(), filters] as const,
    details: () => [...invoiceKeys.all, 'detail'] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export interface InvoiceWithRelations {
    id: string;
    org_id: string;
    invoice_number: string;
    customer_id: string;
    shipment_id: string | null;
    awb_number: string | null;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'OVERDUE';
    payment_status: string | null;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    due_date: string | null;
    paid_at: string | null;
    notes: string | null;
    line_items: any;
    created_at: string;
    updated_at: string;
    customer?: { name: string; phone: string; email: string | null };
    shipment?: { awb_number: string };
}

export function useInvoices(options?: { status?: string; customerId?: string }) {
    return useQuery({
        queryKey: invoiceKeys.list(options),
        queryFn: async () => {
            let query = supabase
                .from('invoices')
                .select(`
          *,
          customer:customers(name, phone, email),
          shipment:shipments(awb_number)
        `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (options?.status) {
                query = query.eq('status', options.status);
            }

            if (options?.customerId) {
                query = query.eq('customer_id', options.customerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as unknown as InvoiceWithRelations[];
        },
    });
}

export function useInvoice(id: string | null) {
    return useQuery({
        queryKey: invoiceKeys.detail(id!),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          customer:customers(*),
          shipment:shipments(*)
        `)
                .eq('id', id!)
                .single();

            if (error) throw error;
            return data as unknown as InvoiceWithRelations;
        },
        enabled: !!id,
    });
}

interface CreateInvoiceInput {
    customer_id: string;
    shipment_id?: string;
    awb_number?: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    due_date?: string;
    notes?: string;
    line_items?: any;
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invoice: CreateInvoiceInput) => {
            const orgId = await getOrCreateDefaultOrg();

            // Generate invoice number
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

            const { data, error } = await db
                .from('invoices')
                .insert({
                    ...invoice,
                    org_id: orgId,
                    invoice_number: invoiceNumber,
                    status: 'ISSUED',
                })
                .select()
                .single();

            if (error) throw error;
            return data as unknown as InvoiceWithRelations;
        },
        onSuccess: (data: InvoiceWithRelations) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            toast.success(`Invoice ${data.invoice_number} created successfully`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to create invoice: ${error.message}`);
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: InvoiceWithRelations['status'] }) => {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString(),
            };

            // Set paid_at if marking as paid
            if (status === 'PAID') {
                updateData.paid_at = new Date().toISOString();
            }

            const { data, error } = await db
                .from('invoices')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as unknown as InvoiceWithRelations;
        },
        onSuccess: (data: InvoiceWithRelations) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
            toast.success(`Invoice marked as ${data.status}`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update invoice: ${error.message}`);
        },
    });
}

/**
 * Hook to delete an invoice (soft delete via deleted_at).
 */
export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await db
                .from('invoices')
                .update({
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            toast.success('Invoice deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete invoice: ${error.message}`);
        },
    });
}
