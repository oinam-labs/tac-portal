import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Type helper to work around Supabase client type inference issues
const db = supabase as any;

export interface TrackingEvent {
  id: string;
  org_id: string;
  shipment_id: string;
  awb_number: string;
  event_code: string;
  event_time: string;
  hub_id: string | null;
  actor_staff_id: string | null;
  source: 'SCAN' | 'MANUAL' | 'SYSTEM' | 'API';
  meta: any;
  created_at: string;
  hub?: { code: string; name: string };
}

export function useTrackingEvents(awbNumber: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tracking-events', awbNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_events')
        .select(`
          *,
          hub:hubs(code, name)
        `)
        .eq('awb_number', awbNumber!)
        .order('event_time', { ascending: false });

      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!awbNumber,
  });

  // Realtime subscription for tracking events
  useEffect(() => {
    if (!awbNumber) return;

    const channel = supabase
      .channel(`tracking:${awbNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_events',
          filter: `awb_number=eq.${awbNumber}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tracking-events', awbNumber] });
          toast.info(`New tracking event: ${payload.new.event_code}`);
        }
      )
      .subscribe();

    return () => {
      // Use removeChannel for proper cleanup - prevents subscription churn and UI blocking
      supabase.removeChannel(channel);
    };
  }, [awbNumber, queryClient]);

  return query;
}

export function useCreateTrackingEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      shipment_id: string;
      awb_number: string;
      event_code: string;
      hub_id?: string;
      source: 'SCAN' | 'MANUAL' | 'SYSTEM' | 'API';
      meta?: any;
    }) => {
      // Get org_id from the first org
      const { data: org } = await db.from('orgs').select('id').single();
      if (!org) throw new Error('No organization found');

      const { data, error } = await db
        .from('tracking_events')
        .insert({
          ...event,
          org_id: org.id,
          event_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as TrackingEvent;
    },
    onSuccess: (data: TrackingEvent) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-events', data.awb_number] });
    },
    onError: (error) => {
      toast.error(`Failed to create tracking event: ${error.message}`);
    },
  });
}
