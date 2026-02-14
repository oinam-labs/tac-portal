import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipmentById, ShipmentWithRelations } from '@/hooks/useShipments';
import { ShipmentDetails } from '@/components/shipments/ShipmentDetails';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Shipment } from '@/types';

// Adapter: Convert ShipmentWithRelations to Shipment type
// Duplicated from Shipments.tsx - consider moving to a utility file
function adaptToShipment(s: ShipmentWithRelations): Shipment {
    return {
        id: s.id,
        awb: s.awb_number,
        customerId: s.customer_id,
        customerName: s.customer?.name || '',
        originHub: (s.origin_hub?.code as any) || (s.origin_hub_id as any),
        destinationHub: (s.destination_hub?.code as any) || (s.destination_hub_id as any),
        mode: s.mode,
        serviceLevel: s.service_level,
        status: s.status as any,
        totalPackageCount: s.package_count,
        totalWeight: {
            dead: s.total_weight,
            volumetric: 0,
            chargeable: s.total_weight,
        },
        eta: '',
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        consignor: {
            name: s.sender_name || '',
            phone: s.sender_phone || '',
            address: typeof s.sender_address === 'string' ? s.sender_address : '',
        },
        consignee: {
            name: s.receiver_name || '',
            phone: s.receiver_phone || '',
            address: typeof s.receiver_address === 'string' ? s.receiver_address : '',
        },
        declaredValue: s.declared_value ?? undefined,
        contentsDescription: s.special_instructions || 'General Cargo',
        bookingDate: s.created_at,
    };
}

export const ShipmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: shipment, isLoading, error } = useShipmentById(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-xl font-bold text-destructive">Shipment not found</h2>
                <p className="text-muted-foreground">The shipment you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/shipments')}>Back to Shipments</Button>
            </div>
        );
    }

    const handleClose = () => {
        navigate('/shipments');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleClose}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <PageHeader title={`Shipment ${shipment.awb_number}`} description="Detailed view" />
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <ShipmentDetails
                    shipment={adaptToShipment(shipment)}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
};

export default ShipmentDetailsPage;
