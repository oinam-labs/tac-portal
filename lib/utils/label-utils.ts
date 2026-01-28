/* eslint-disable @typescript-eslint/no-explicit-any -- Label generation requires any for dynamic form/invoice data */
import { LabelData, ServiceLevel, TransportMode } from '@/components/domain/LabelGenerator';
import { HUBS } from '@/lib/constants';
import { HubLocation, Shipment } from '@/types';

const getTextValue = (value?: string | null): string => (typeof value === 'string' ? value.trim() : '');

const resolveHubCode = (value?: string | null): string => {
  if (!value) return '';
  const hubKey = value as HubLocation;
  const direct = HUBS[hubKey];
  if (direct) return direct.code;
  const byCode = Object.values(HUBS).find((hub) => hub.code === value || hub.id === value);
  return byCode?.code || value;
};

const resolveHubName = (value?: string | null): string => {
  if (!value) return '';
  const hubKey = value as HubLocation;
  const direct = HUBS[hubKey];
  if (direct) return direct.name;
  const byCode = Object.values(HUBS).find((hub) => hub.code === value || hub.id === value);
  return byCode?.name || value;
};

const normalizeServiceLevel = (value?: string | null): ServiceLevel => {
  if (!value) return 'STANDARD';
  const upper = value.toUpperCase();
  if (upper === 'EXPRESS' || upper === 'PRIORITY' || upper === 'STANDARD') {
    return upper as ServiceLevel;
  }
  return 'STANDARD';
};

export const generateLabelFromShipment = (
  shipment: Partial<Shipment>,
  invoiceData?: any
): LabelData => {
  const serviceLevel = normalizeServiceLevel(shipment.serviceLevel);

  const transportMode: TransportMode = shipment.mode === 'AIR' ? 'AIR' : 'TRUCK';

  const serviceLevelCode: Record<ServiceLevel, string> = {
    STANDARD: 'STD',
    EXPRESS: 'EXP',
    PRIORITY: 'PRI',
  };

  const originCode = resolveHubCode(shipment.originHub || '') || 'DEL';
  const destinationCode = resolveHubCode(shipment.destinationHub || '') || 'IMF';
  const destinationName = resolveHubName(shipment.destinationHub || '');
  const recipientCity = getTextValue(shipment.consignee?.city) || destinationName.replace(' Hub', '');
  const recipientZip = getTextValue(shipment.consignee?.zip);
  const cityLine = [recipientCity, recipientZip].filter(Boolean).join(' ');

  return {
    awb: shipment.awb || 'TAC00000000',
    transportMode,
    serviceLevel,
    serviceName: `${serviceLevel} ${transportMode === 'AIR' ? 'AIR' : 'SURFACE'}`,
    serviceCode: serviceLevelCode[serviceLevel],
    weight: shipment.totalWeight?.chargeable || shipment.totalWeight?.dead || 0,
    weightUnit: 'kg',
    paymentMode: shipment.paymentMode || 'TO PAY',
    recipient: {
      name: shipment.consignee?.name || shipment.customerName || 'RECIPIENT',
      address: shipment.consignee?.address || HUBS[shipment.destinationHub as HubLocation]?.address || '',
      city: cityLine,
      state: shipment.consignee?.state,
    },
    routing: {
      origin: originCode,
      destination: destinationCode,
      deliveryStation: destinationCode,
      originSort: originCode,
      destSort: destinationCode,
    },
    dates: {
      shipDate: shipment.bookingDate
        ? new Date(shipment.bookingDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      invoiceDate: invoiceData?.createdAt
        ? new Date(invoiceData.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    gstNumber: shipment.consignee?.gstin || invoiceData?.gstNumber,
  };
};

export const generateLabelFromFormData = (formData: any): LabelData => {
  const serviceLevel = normalizeServiceLevel(formData.serviceLevel);
  const transportMode: TransportMode = formData.transportMode === 'AIR' ? 'AIR' : 'TRUCK';
  const serviceLevelCode: Record<ServiceLevel, string> = {
    STANDARD: 'STD',
    EXPRESS: 'EXP',
    PRIORITY: 'PRI',
  };

  const recipientCity = getTextValue(formData.consigneeCity);
  const recipientZip = getTextValue(formData.consigneeZip);
  const cityLine = [recipientCity, recipientZip].filter(Boolean).join(' ');

  return {
    awb: formData.awb || 'TAC00000000',
    transportMode,
    serviceLevel,
    serviceName: `${serviceLevel} ${transportMode === 'AIR' ? 'AIR' : 'SURFACE'}`,
    serviceCode: serviceLevelCode[serviceLevel],
    weight: formData.chargedWeight || formData.actualWeight || 0,
    weightUnit: 'kg',
    paymentMode: formData.paymentMode || 'TO PAY',
    recipient: {
      name: formData.consigneeName || 'RECIPIENT',
      address: formData.consigneeAddress || '',
      city: cityLine,
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
        ? new Date(formData.bookingDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      invoiceDate: formData.bookingDate
        ? new Date(formData.bookingDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    gstNumber: formData.consigneeGstin || formData.gstNumber,
  };
};
