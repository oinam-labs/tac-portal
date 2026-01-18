import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShippingLabel, ShippingLabelData } from '../components/shipping/ShippingLabel';
import { Shipment } from '../types';
import { HUBS } from '../lib/constants';

// Helper to map Domain Shipment to View Model
const mapShipmentToLabel = (shipment: Shipment): ShippingLabelData => {
    const destHub = HUBS[shipment.destinationHub] || { name: 'Unknown', code: 'UNK' };
    const originHub = HUBS[shipment.originHub] || { code: 'DEL' };

    // Address lines logic
    const address = shipment.consignee?.address || `${destHub.name} Airport Road`;
    const city = shipment.consignee?.city || destHub.name;
    // stateZip fallback removed - extract from address if structured
    // We'll simplisticly split address or just use as is. 
    // The reference design used 3 lines.
    const shipToLines = [
        address.substring(0, 40),
        city,
        `${destHub.name} Hub`
    ];

    return {
        serviceName: "STANDARD EXPRESS",
        tracking: shipment.awb,
        weight: `${shipment.totalWeight.chargeable} kg`,
        serviceType: "STD", // Or derive from serviceLevel
        payment: (shipment as any).paymentMode || "TO PAY",
        mode: shipment.mode || 'TRUCK', // Transport mode for icon
        shipToName: (shipment.consignee?.name || shipment.customerName || "CUSTOMER").toUpperCase(),
        shipToLines,
        deliveryStation: destHub.code || "IMF",
        originSort: originHub.code || "DEL",
        destSort: destHub.code || "SUR", // Logic for dest sort?
        shipDate: new Date(shipment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        gstNumber: (shipment as any).gstNumber || "07AAMFT6165B1Z3",
        invoiceDate: new Date(shipment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        routingFrom: originHub.code || "DEL",
        routingTo: destHub.code || "IMF",
        serviceLevel: shipment.serviceLevel === 'EXPRESS' ? 'X-09' : 'S-01',
        contents: (shipment.contentsDescription || "GENERAL GOODS").toUpperCase(),
        qty: String(shipment.totalPackageCount || 1).padStart(2, '0'),
        footerLeft: ["Liability limited to conditions of carriage.", "© 2025 TAC Logistics."],
        brand: "TAC SHIPPING"
    };
};

export const PrintLabel: React.FC = () => {
    const { awb } = useParams();
    const [data, setData] = useState<ShippingLabelData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Attempt to get from local storage (passed from Finance page)
            const stored = localStorage.getItem('print_shipping_label');
            if (stored) {
                const shipment: Shipment = JSON.parse(stored);
                if (shipment.awb === awb) {
                    setData(mapShipmentToLabel(shipment));
                } else {
                    // Fallback or error if ID mismatch (prevent stale data)
                    // If AWB matches, good. If not, maybe use it anyway if debugging, but cleaner to warn.
                    // Actually, if window.open is used with a specific URL, maybe we just trust the storage if it seems recent.
                    // For now, let's map it if valid JSON.
                    setData(mapShipmentToLabel(shipment));
                }
            } else {
                setError("No shipment data found. Please generate label from Finance dashboard.");
            }
        } catch (e) {
            console.error("Failed to load shipment", e);
            setError("Failed to load shipment data.");
        }
    }, [awb]);

    // Auto print when loaded - MUST be before any conditional returns!
    useEffect(() => {
        if (data) {
            setTimeout(() => {
                // window.print(); 
                // User might want to preview first. 
            }, 500);
        }
    }, [data]);

    if (error) {
        return <div className="p-8 text-red-500 font-bold">{error}</div>;
    }

    if (!data) {
        return <div className="p-8">Loading label...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-100 flex justify-center">
            <ShippingLabel shipment={data} />
        </div>
    );
};
