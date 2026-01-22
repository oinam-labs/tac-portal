/**
 * Realtime Subscription Hooks
 * Subscribe to Supabase realtime changes for live updates
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { isFeatureEnabled } from '@/config/features';
import { logger } from '@/lib/logger';

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
                    logger.debug('[Realtime] Shipment changed', { eventType: payload.eventType });

                    // Invalidate shipments queries
                    queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });

                    // If it's a specific shipment, invalidate that too
                    const newRecord = payload.new as Record<string, unknown> | null;
                    if (newRecord?.id && typeof newRecord.id === 'string') {
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.shipments.detail(newRecord.id)
                        });
                    }
                }
            )
            .subscribe((status) => {
                logger.debug('[Realtime] Shipments subscription', { status });
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
                    logger.debug('[Realtime] Manifest changed', { eventType: payload.eventType });
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
                () => {
                    logger.debug('[Realtime] New tracking event', { awb });
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
                    logger.debug('[Realtime] Exception changed', { eventType: payload.eventType });
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
