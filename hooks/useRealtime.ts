/**
 * Realtime Subscription Hooks
 * Subscribe to Supabase realtime changes for live updates
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { isFeatureEnabled } from '@/config/features';

/**
 * Subscribe to realtime changes for shipments
 */
export function useRealtimeShipments() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isFeatureEnabled('realtimeTracking')) return;

        const channel = supabase
            .channel('shipments-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'shipments',
                },
                (payload) => {
                    console.log('[Realtime] Shipment changed:', payload.eventType, payload.new);

                    // Invalidate shipments queries
                    queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });

                    // If it's a specific shipment, invalidate that too
                    if (payload.new && (payload.new as any).id) {
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.shipments.detail((payload.new as any).id)
                        });
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Shipments subscription:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}

/**
 * Subscribe to realtime changes for manifests
 */
export function useRealtimeManifests() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isFeatureEnabled('realtimeTracking')) return;

        const channel = supabase
            .channel('manifests-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'manifests',
                },
                (payload) => {
                    console.log('[Realtime] Manifest changed:', payload.eventType);
                    queryClient.invalidateQueries({ queryKey: queryKeys.manifests.all });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}

/**
 * Subscribe to realtime changes for tracking events
 */
export function useRealtimeTracking(awb?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isFeatureEnabled('realtimeTracking') || !awb) return;

        const channel = supabase
            .channel(`tracking-${awb}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tracking_events',
                    filter: `awb_number=eq.${awb}`,
                },
                (payload) => {
                    console.log('[Realtime] New tracking event:', payload.new);
                    queryClient.invalidateQueries({ queryKey: queryKeys.tracking.byAwb(awb) });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, awb]);
}

/**
 * Subscribe to realtime changes for exceptions
 */
export function useRealtimeExceptions() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isFeatureEnabled('realtimeTracking')) return;

        const channel = supabase
            .channel('exceptions-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'exceptions',
                },
                (payload) => {
                    console.log('[Realtime] Exception changed:', payload.eventType);
                    queryClient.invalidateQueries({ queryKey: queryKeys.exceptions.all });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}

/**
 * Combined hook for dashboard - subscribes to all important tables
 */
export function useRealtimeDashboard() {
    useRealtimeShipments();
    useRealtimeManifests();
    useRealtimeExceptions();
}
