import { supabase } from './supabase';

export interface TrackingData {
  shipment: {
    reference: string;
    status: string;
    consignee_name: string | null;
    consignee_city: string | null;
    origin: string;
    destination: string;
    mode: 'AIR' | 'TRUCK';
  };
  events: Array<{
    status: string;
    description: string | null;
    created_at: string;
  }>;
}

// Type for Supabase query result
interface ShipmentQueryResult {
  id: string;
  awb_number: string;
  status: string;
  receiver_name: string;
  receiver_address: { city?: string } | null;
  service_type: 'AIR' | 'TRUCK';
  origin_hub: { code: string; name: string } | null;
  destination_hub: { code: string; name: string } | null;
}

interface TrackingEventResult {
  event_code: string;
  notes: string | null;
  created_at: string | null;
}

/**
 * Public tracking API - fetches shipment info by AWB number from Supabase.
 * This is used by the landing page tracking feature.
 */
export const getTrackingInfo = async (
  trackingNumber: string
): Promise<{ success: boolean; data?: TrackingData; error?: string }> => {
  const ref = trackingNumber.trim().toUpperCase();

  try {
    // Search in Supabase by AWB number using secure public view (excludes PII)
    const { data: shipment, error: shipmentError } = await (supabase
      .from('public_shipment_tracking' as any)
      .select(
        `
                id,
                awb_number,
                status,
                mode,
                origin_hub:hubs!public_shipment_tracking_origin_hub_id_fkey(code, name),
                destination_hub:hubs!public_shipment_tracking_destination_hub_id_fkey(code, name)
            `
      )
      .eq('awb_number', ref)
      .maybeSingle() as any);

    if (shipmentError) throw shipmentError;

    if (shipment) {
      // Cast to our expected type
      const s = shipment as unknown as ShipmentQueryResult;

      // Get tracking events using secure public view (excludes actor_staff_id, notes, meta)
      const { data: events, error: eventsError } = await (supabase
        .from('public_tracking_events' as any)
        .select('event_code, created_at')
        .eq('shipment_id', s.id)
        .order('created_at', { ascending: false }) as any);

      if (eventsError) throw eventsError;

      return {
        success: true,
        data: {
          shipment: {
            reference: s.awb_number,
            status: s.status,
            consignee_name: 'Consignee', // PII not exposed in public view
            consignee_city: null,
            origin: s.origin_hub?.name || 'Origin Hub',
            destination: s.destination_hub?.name || 'Destination Hub',
            mode: (s as any).mode,
          },
          events: ((events || []) as TrackingEventResult[]).map((e) => ({
            status: e.event_code,
            description: '',
            created_at: e.created_at || new Date().toISOString(),
          })),
        },
      };
    }

    return { success: false, error: 'Shipment not found. Please check the AWB number.' };
  } catch (error) {
    console.error('Tracking lookup error:', error);
    return { success: false, error: 'Failed to fetch tracking information. Please try again.' };
  }
};
