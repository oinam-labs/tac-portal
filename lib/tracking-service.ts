
import { db } from './mock-db';

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

export const getTrackingInfo = async (trackingNumber: string): Promise<{ success: boolean; data?: TrackingData; error?: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800)); // Slightly faster than before

    const ref = trackingNumber.trim().toUpperCase();

    // 1. Search in Mock DB
    const dbShipment = db.getShipmentByAWB(ref) || db.getShipments().find(s => s.id === ref);

    if (dbShipment) {
        const events = db.getEvents(dbShipment.id);

        return {
            success: true,
            data: {
                shipment: {
                    reference: dbShipment.awb,
                    status: dbShipment.status,
                    consignee_name: dbShipment.customerName,
                    consignee_city: dbShipment.destinationHub === 'NEW_DELHI' ? 'New Delhi' : 'Imphal', // Simplified mapping based on Hub ID
                    origin: dbShipment.originHub === 'IMPHAL' ? 'Imphal' : 'New Delhi',
                    destination: dbShipment.destinationHub === 'NEW_DELHI' ? 'New Delhi' : 'Imphal'
                },
                events: events.map(e => ({
                    status: e.eventCode,
                    description: e.description,
                    created_at: e.timestamp
                }))
            }
        };
    }

    // 2. Fallback Mock Logic (For Demo if ID not in DB)
    if (ref.startsWith("TAC-") || ref.startsWith("IMP-") || ref.startsWith("DEL-")) {
        return {
            success: true,
            data: {
                shipment: {
                    reference: ref,
                    status: "in_transit",
                    consignee_name: "Verified Client",
                    consignee_city: "New Delhi",
                    origin: "Imphal",
                    destination: "New Delhi"
                },
                events: [
                    {
                        status: "in_transit",
                        description: "Departed Origin Hub",
                        created_at: new Date().toISOString()
                    }
                ]
            }
        }
    }

    return { success: false, error: "Shipment not found. Please check the AWB number." };
}
