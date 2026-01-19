import { LabelData, ServiceLevel, TransportMode } from '@/components/domain/LabelGenerator';
import { Shipment } from '@/types';

export const generateLabelFromShipment = (shipment: Partial<Shipment>, invoiceData?: any): LabelData => {
    // Map service level to our label types
    let serviceLevel: ServiceLevel = 'STANDARD';
    if (shipment.serviceLevel === 'EXPRESS') {
        serviceLevel = 'EXPRESS';
    }

    const transportMode: TransportMode = shipment.mode === 'AIR' ? 'AIR' : 'TRUCK';

    const serviceLevelCode = serviceLevel === 'EXPRESS' ? 'EXP' : 'STD';

    return {
        awb: shipment.awb || 'TAC00000000',
        transportMode,
        serviceLevel,
        serviceName: `${serviceLevel} ${transportMode === 'AIR' ? 'AIR' : 'SURFACE'}`,
        serviceCode: serviceLevelCode,
        weight: shipment.totalWeight?.chargeable || shipment.totalWeight?.dead || 0,
        weightUnit: 'kg',
        paymentMode: shipment.paymentMode || 'TO PAY',
        recipient: {
            name: shipment.consignee?.name || shipment.customerName || 'RECIPIENT',
            address: shipment.consignee?.address || '',
            city: shipment.consignee?.city || '',
            state: shipment.consignee?.state,
        },
        routing: {
            origin: shipment.originHub || 'DEL',
            destination: shipment.destinationHub || 'IMF',
            deliveryStation: shipment.destinationHub || 'IMF',
            originSort: shipment.originHub || 'DEL',
            destSort: shipment.destinationHub || 'IMF',
        },
        dates: {
            shipDate: shipment.bookingDate
                ? new Date(shipment.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            invoiceDate: invoiceData?.createdAt
                ? new Date(invoiceData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        },
        gstNumber: shipment.consignee?.gstin || invoiceData?.gstNumber,
    };
};

export const generateLabelFromFormData = (formData: any): LabelData => {
    const serviceLevel: ServiceLevel = 'STANDARD';
    const transportMode: TransportMode = formData.transportMode === 'AIR' ? 'AIR' : 'TRUCK';

    return {
        awb: formData.awb || 'TAC00000000',
        transportMode,
        serviceLevel,
        serviceName: `${serviceLevel} ${transportMode === 'AIR' ? 'AIR' : 'SURFACE'}`,
        serviceCode: 'STD',
        weight: formData.chargedWeight || formData.actualWeight || 0,
        weightUnit: 'kg',
        paymentMode: formData.paymentMode || 'TO PAY',
        recipient: {
            name: formData.consigneeName || 'RECIPIENT',
            address: formData.consigneeAddress || '',
            city: formData.consigneeCity || '',
            state: formData.consigneeState,
        },
        routing: {
            origin: 'DEL',
            destination: 'IMF',
            deliveryStation: 'IMF',
            originSort: 'DEL',
            destSort: 'IMF',
        },
        dates: {
            shipDate: formData.bookingDate
                ? new Date(formData.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            invoiceDate: formData.bookingDate
                ? new Date(formData.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        },
        gstNumber: formData.consigneeGstin || formData.gstNumber,
    };
};
