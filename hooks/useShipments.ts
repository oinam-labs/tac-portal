import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Json } from '../lib/database.types';
import { getOrCreateDefaultOrg } from '../lib/org-helper';

// Type helper to work around Supabase client type inference issues
const db = supabase as any;

/**
 * Query key factory for shipments.
 * Provides consistent, type-safe query keys for caching.
 */
export const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (filters?: { limit?: number; status?: string }) => [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  byAwb: (awb: string) => [...shipmentKeys.all, 'awb', awb] as const,
};

export interface ShipmentWithRelations {
  id: string;
  org_id: string;
  awb_number: string;
  customer_id: string;
  origin_hub_id: string;
  destination_hub_id: string;
  mode: 'AIR' | 'TRUCK';
  service_level: 'STANDARD' | 'EXPRESS';
  status: string;
  package_count: number;
  total_weight: number;
  declared_value: number | null;
  consignee_name: string;
  consignee_phone: string;
  consignee_address: Json;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  customer?: { name: string; phone: string };
  origin_hub?: { code: string; name: string };
  destination_hub?: { code: string; name: string };
}

export function useShipments(options?: { limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['shipments', options],
    queryFn: async () => {
      let query = supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(name, phone),
          origin_hub:hubs!shipments_origin_hub_id_fkey(code, name),
          destination_hub:hubs!shipments_destination_hub_id_fkey(code, name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ShipmentWithRelations[];
    },
  });
}

export function useShipmentByAWB(awb: string | null) {
  return useQuery({
    queryKey: ['shipment', 'awb', awb],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(name, phone, email, address),
          origin_hub:hubs!shipments_origin_hub_id_fkey(code, name, address),
          destination_hub:hubs!shipments_destination_hub_id_fkey(code, name, address)
        `)
        .eq('awb_number', awb!)
        .single();

      if (error) throw error;
      return data as unknown as ShipmentWithRelations;
    },
    enabled: !!awb,
  });
}

interface CreateShipmentInput {
  customer_id: string;
  origin_hub_id: string;
  destination_hub_id: string;
  mode: 'AIR' | 'TRUCK';
  service_level: 'STANDARD' | 'EXPRESS';
  package_count: number;
  total_weight: number;
  declared_value?: number;
  consignee_name: string;
  consignee_phone: string;
  consignee_address: Json;
  special_instructions?: string;
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipment: CreateShipmentInput) => {
      const orgId = await getOrCreateDefaultOrg();

      // Generate AWB number - fallback if function doesn't exist
      let awbNumber = `TAC${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      try {
        const { data: awbResult } = await supabase.rpc('generate_awb_number', { p_org_id: orgId } as any);
        if (awbResult) awbNumber = awbResult as string;
      } catch (e) {
        console.warn('AWB generation function not available, using fallback');
      }

      const insertPayload = {
        ...shipment,
        org_id: orgId,
        awb_number: awbNumber,
        status: 'CREATED' as const,
      };

      const { data, error } = await (supabase
        .from('shipments') as any)
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ShipmentWithRelations;
    },
    onSuccess: (data: ShipmentWithRelations) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success(`Shipment ${data.awb_number} created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create shipment: ${error.message}`);
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await (supabase
        .from('shipments') as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Shipment not found');

      const shipmentData = data as unknown as ShipmentWithRelations;

      // Create tracking event
      await supabase.from('tracking_events').insert({
        org_id: shipmentData.org_id,
        shipment_id: id,
        awb_number: shipmentData.awb_number,
        event_code: status,
        source: 'MANUAL',
      } as any);

      return shipmentData;
    },
    onSuccess: (data: ShipmentWithRelations) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-events', data.awb_number] });
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a shipment (soft delete via deleted_at).
 */
export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('shipments')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Shipment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete shipment: ${error.message}`);
    },
  });
}
