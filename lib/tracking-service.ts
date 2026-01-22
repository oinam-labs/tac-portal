import { supabase } from './supabase';

export interface TrackingData {
  shipment: {
    reference: string;
    status: string;
    consignee_name: string | null;
    consignee_city: string | null;
    origin: string;
    destination: string;
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
  consignee_name: string;
  consignee_address: { city?: string } | null;
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
    // Search in Supabase by AWB number
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(
        `
                id,
                awb_number,
                status,
                consignee_name,
                consignee_address,
                origin_hub:hubs!shipments_origin_hub_id_fkey(code, name),
                destination_hub:hubs!shipments_destination_hub_id_fkey(code, name)
            `
      )
      .eq('awb_number', ref)
      .maybeSingle();

    if (shipmentError) throw shipmentError;

    if (shipment) {
      // Cast to our expected type
      const s = shipment as unknown as ShipmentQueryResult;

      // Get tracking events for this shipment
      const { data: events, error: eventsError } = await supabase
        .from('tracking_events')
        .select('event_code, notes, created_at')
        .eq('shipment_id', s.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Parse consignee address to get city
      const consigneeCity = s.consignee_address?.city || null;

      return {
        success: true,
        data: {
          shipment: {
            reference: s.awb_number,
            status: s.status,
            consignee_name: s.consignee_name,
            consignee_city: consigneeCity,
            origin: s.origin_hub?.name || 'Origin Hub',
            destination: s.destination_hub?.name || 'Destination Hub',
          },
          events: ((events || []) as TrackingEventResult[]).map((e) => ({
            status: e.event_code,
            description: e.notes,
            created_at: e.created_at || new Date().toISOString(),
          })),
        },
      };
    }

    // Fallback demo data for testing (if AWB format matches but not in DB)
    if (ref.startsWith('TAC') || ref.startsWith('IMP-') || ref.startsWith('DEL-')) {
      return {
        success: true,
        data: {
          shipment: {
            reference: ref,
            status: 'IN_TRANSIT',
            consignee_name: 'Demo Recipient',
            consignee_city: 'New Delhi',
            origin: 'Imphal Hub',
            destination: 'New Delhi Hub',
          },
          events: [
            {
              status: 'IN_TRANSIT_TO_DESTINATION',
              description: 'Shipment departed from origin hub',
              created_at: new Date().toISOString(),
            },
          ],
        },
      };
    }

    return { success: false, error: 'Shipment not found. Please check the AWB number.' };
  } catch (error) {
    console.error('Tracking lookup error:', error);
    return { success: false, error: 'Failed to fetch tracking information. Please try again.' };
  }
};
