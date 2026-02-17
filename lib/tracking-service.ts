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



/**
 * Public tracking API - fetches shipment info by AWB number from Supabase.
 * This is used by the landing page tracking feature.
 */
export const getTrackingInfo = async (
  trackingNumber: string
): Promise<{ success: boolean; data?: TrackingData; error?: string }> => {
  const ref = trackingNumber.trim().toUpperCase();

  try {
    const { data: shipment, error } = await supabase.rpc('get_public_shipment_by_awb' as any, {
      awb_code: ref,
    });

    if (error) throw error;

    if (shipment && (shipment as any).length > 0) {
      const s = (shipment as any)[0]; // RPC returns a table/array
      return {
        success: true,
        data: {
          shipment: {
            reference: s.awb_number,
            status: s.status,
            consignee_name: 'Consignee',
            consignee_city: null,
            origin: s.origin_hub_name || 'Origin Hub',
            destination: s.destination_hub_name || 'Destination Hub',
            mode: s.mode as 'AIR' | 'TRUCK',
          },
          events: (s.events || []).map((e: any) => ({
            status: e.status,
            description: e.description || '',
            created_at: e.created_at,
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
