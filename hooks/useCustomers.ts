import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Type helper to work around Supabase client type inference issues
const db = supabase as any;

export interface Customer {
  id: string;
  org_id: string;
  customer_code: string;
  name: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  type: 'individual' | 'business';
  address: any;
  billing_address: any | null;
  credit_limit: number;
  created_at: string;
  updated_at: string;
}

export function useCustomers(options?: { search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['customers', options],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: {
      customer_code: string;
      name: string;
      phone: string;
      email?: string;
      gstin?: string;
      type?: 'individual' | 'business';
      address: any;
      billing_address?: any;
      credit_limit?: number;
    }) => {
      const { data: org } = await db.from('orgs').select('id').single();
      if (!org) throw new Error('No organization found');

      const { data, error } = await db
        .from('customers')
        .insert({
          ...customer,
          org_id: org.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Customer ${data.name} created successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const { data: result, error } = await db
        .from('customers')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success(`Customer ${data.name} updated successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });
}
