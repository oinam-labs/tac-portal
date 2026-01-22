/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShippingLabel, ShippingLabelData } from '../components/shipping/ShippingLabel';
import { Shipment, HubLocation } from '../types';
import { HUBS } from '../lib/constants';
import { logger } from '../lib/logger';

// Service level code mapping for enterprise standardization
const SERVICE_LEVEL_CODES: Record<string, string> = {
  EXPRESS: 'X-09',
  STANDARD: 'S-01',
  ECONOMY: 'E-03',
  PRIORITY: 'P-01',
};

// Service type display codes
const SERVICE_TYPE_CODES: Record<string, string> = {
  EXPRESS: 'EXP',
  STANDARD: 'STD',
  ECONOMY: 'ECO',
  PRIORITY: 'PRI',
};

// Validate shipment has required fields for label generation
const validateShipmentForLabel = (shipment: unknown): shipment is Shipment => {
  if (!shipment || typeof shipment !== 'object') return false;
  const s = shipment as Record<string, unknown>;
  return !!(s.awb && typeof s.awb === 'string' && s.destinationHub && s.originHub && s.totalWeight);
};

// Safe date formatter with fallback
const formatLabelDate = (dateStr: string | undefined): string => {
  if (!dateStr)
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
};

// Helper to map Domain Shipment to View Model with enterprise-grade validation
const mapShipmentToLabel = (shipment: Shipment): ShippingLabelData => {
  const destHub = HUBS[shipment.destinationHub as HubLocation] || {
    name: 'Unknown Hub',
    code: 'UNK',
    sortCode: 'UNK',
  };
  const originHub = HUBS[shipment.originHub as HubLocation] || {
    name: 'Unknown Hub',
    code: 'UNK',
    sortCode: 'UNK',
  };

  // Build address lines with proper fallbacks
  const consigneeAddress = shipment.consignee?.address?.trim();
  const consigneeCity = shipment.consignee?.city?.trim();

  const address = consigneeAddress || `${destHub.name} Airport Road`;
  const city = consigneeCity || destHub.name.replace(' Hub', '');

  const shipToLines = [address.substring(0, 40), city, destHub.name].filter(Boolean);

  // Derive service codes from service level
  const serviceLevel = shipment.serviceLevel || 'STANDARD';
  const serviceLevelCode = SERVICE_LEVEL_CODES[serviceLevel] || 'S-01';
  const serviceTypeCode = SERVICE_TYPE_CODES[serviceLevel] || 'STD';

  // Build service name from mode and level
  const serviceName = serviceLevel === 'EXPRESS' ? 'EXPRESS SERVICE' : 'STANDARD EXPRESS';

  // Safe weight extraction (chargeable is the billing weight)
  const weight = shipment.totalWeight?.chargeable ?? 1;

  return {
    serviceName,
    tracking: shipment.awb,
    weight: `${weight} kg`,
    serviceType: serviceTypeCode,
    payment: (shipment as any).paymentMode || 'TO PAY',
    mode: shipment.mode || 'TRUCK',
    shipToName: (shipment.consignee?.name || shipment.customerName || 'CUSTOMER').toUpperCase(),
    shipToLines,
    deliveryStation: destHub.code,
    originSort: originHub.code,
    destSort: destHub.code,
    shipDate: formatLabelDate(shipment.createdAt),
    gstNumber: (shipment as any).gstNumber || '07AAMFT6165B1Z3',
    invoiceDate: formatLabelDate(shipment.createdAt),
    routingFrom: originHub.code,
    routingTo: destHub.code,
    serviceLevel: serviceLevelCode,
    contents: (shipment.contentsDescription || 'GENERAL GOODS').toUpperCase(),
    qty: String(shipment.totalPackageCount || 1).padStart(2, '0'),
    footerLeft: ['Liability limited to conditions of carriage.', '© 2026 TAC Logistics.'],
    brand: 'TAC SHIPPING',
  };
};

export const PrintLabel: React.FC = () => {
  const { awb } = useParams();
  const [data, setData] = useState<ShippingLabelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadShipmentData = () => {
      try {
        // Try per-AWB key first (new format), then fallback to legacy key
        const perAwbKey = `print_shipping_label_${awb}`;
        const legacyKey = 'print_shipping_label';

        logger.debug('[PrintLabel] Attempt', { attempt: retryCount + 1, awb });

        // Try localStorage first, then sessionStorage (Firefox ETP may block localStorage in new tabs)
        let stored = localStorage.getItem(perAwbKey) || sessionStorage.getItem(perAwbKey);
        let usedKey = perAwbKey;
        let usedStorage: 'localStorage' | 'sessionStorage' = localStorage.getItem(perAwbKey)
          ? 'localStorage'
          : 'sessionStorage';

        logger.debug('[PrintLabel] Per-AWB key result', { found: !!stored, storage: usedStorage });

        if (!stored) {
          stored = localStorage.getItem(legacyKey) || sessionStorage.getItem(legacyKey);
          usedKey = legacyKey;
          usedStorage = localStorage.getItem(legacyKey) ? 'localStorage' : 'sessionStorage';
          logger.debug('[PrintLabel] Legacy key result', { found: !!stored, storage: usedStorage });
        }

        // Debug: List all storage keys containing 'label'
        const localKeys = Object.keys(localStorage).filter((k) => k.includes('label'));
        const sessionKeys = Object.keys(sessionStorage).filter((k) => k.includes('label'));
        logger.debug('[PrintLabel] Storage keys', { localKeys, sessionKeys });

        if (!stored) {
          // Retry up to 3 times with delay (handles race condition)
          if (retryCount < 3) {
            logger.debug('[PrintLabel] Data not found, retrying in 300ms');
            setTimeout(() => setRetryCount((c) => c + 1), 300);
            return;
          }
          setError('No shipment data found. Please generate label from Invoices dashboard.');
          return;
        }

        const parsed = JSON.parse(stored);
        logger.debug('[PrintLabel] Parsed data', { awb: parsed.awb });

        // Validate shipment data before processing
        if (!validateShipmentForLabel(parsed)) {
          logger.warn('[PrintLabel] Validation failed', {
            awb: parsed.awb,
            originHub: parsed.originHub,
            destinationHub: parsed.destinationHub,
            totalWeight: parsed.totalWeight,
          });
          setError('Invalid shipment data. Missing required fields (AWB, hubs, or weight).');
          return;
        }

        const shipment = parsed as Shipment;

        // Warn if AWB mismatch but still process (stale data scenario)
        if (shipment.awb !== awb) {
          console.warn(
            `AWB mismatch: URL has ${awb}, storage has ${shipment.awb}. Using stored data.`
          );
        }

        setData(mapShipmentToLabel(shipment));

        // Clean up localStorage after reading to prevent PII lingering
        localStorage.removeItem(usedKey);
      } catch (e) {
        console.error('Failed to load shipment:', e);
        setError('Failed to parse shipment data. Please try generating the label again.');
      }
    };

    loadShipmentData();
  }, [awb, retryCount]);

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
