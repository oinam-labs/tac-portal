/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShippingLabel, ShippingLabelData } from '../components/shipping/ShippingLabel';
import { Shipment, HubLocation, ShipmentMode, ServiceLevel, PaymentMode } from '../types';
import { HUBS } from '../lib/constants';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

// Service level code mapping for enterprise standardization
const SERVICE_LEVEL_CODES: Record<string, string> = {
  EXPRESS: 'X-09',
  STANDARD: 'S-01',
  ECONOMY: 'E-03',
  PRIORITY: 'P-01',
};

const formatAddress = (address: unknown): string => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address !== 'object') return '';
  const { line1, line2, city, state, zip } = address as Record<string, string | undefined>;
  return [line1, line2, city, state, zip].filter(Boolean).join(', ');
};

const resolveHubLocation = (row: any, type: 'origin' | 'destination'): HubLocation => {
  const hubId = type === 'origin' ? row.origin_hub_id : row.destination_hub_id;
  const hubCode = type === 'origin' ? row.origin_hub?.code : row.destination_hub?.code;
  const byUuid = Object.values(HUBS).find((hub) => hub.uuid === hubId)?.id;
  const byCode = Object.values(HUBS).find((hub) => hub.code === hubCode)?.id;
  return (byUuid || byCode || 'IMPHAL') as HubLocation;
};

const resolveMode = (value?: string | null): ShipmentMode => {
  if (!value) return 'TRUCK';
  return value.toUpperCase() === 'AIR' ? 'AIR' : 'TRUCK';
};

const resolveServiceLevel = (value?: string | null): ServiceLevel => {
  if (!value) return 'STANDARD';
  const upper = value.toUpperCase();
  if (upper === 'EXPRESS' || upper === 'PRIORITY' || upper === 'STANDARD') {
    return upper as ServiceLevel;
  }
  return 'STANDARD';
};

const mapShipmentRowToShipment = (row: any): Shipment => {
  const originHub = resolveHubLocation(row, 'origin');
  const destinationHub = resolveHubLocation(row, 'destination');
  const weight = Number(row.total_weight ?? row.totalWeight ?? 0);
  const serviceValue = row.service_level || row.service_type || row.mode;

  return {
    id: row.id,
    awb: row.awb_number || row.awb,
    customerId: row.customer_id,
    customerName: row.customer?.name || row.receiver_name || 'Unknown',
    originHub,
    destinationHub,
    mode: resolveMode(serviceValue),
    serviceLevel: resolveServiceLevel(serviceValue),
    totalPackageCount: row.total_packages ?? row.package_count ?? 1,
    totalWeight: {
      dead: weight,
      volumetric: 0,
      chargeable: weight,
    },
    status: row.status ?? 'CREATED',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    eta: 'TBD',
    consignor: {
      name: row.sender_name || 'SENDER',
      phone: row.sender_phone || '',
      address: formatAddress(row.sender_address),
    },
    consignee: {
      name: row.receiver_name || 'RECIPIENT',
      phone: row.receiver_phone || '',
      address: formatAddress(row.receiver_address),
    },
    contentsDescription: row.contents || 'General Cargo',
    paymentMode: (row.payment_mode as PaymentMode) || 'TO_PAY',
  };
};

const fetchShipmentByAwb = async (awb?: string) => {
  if (!awb) return null;
  const { data, error } = await supabase
    .from('shipments')
    .select(
      `
        *,
        customer:customers(name),
        origin_hub:hubs!shipments_origin_hub_id_fkey(code),
        destination_hub:hubs!shipments_destination_hub_id_fkey(code)
      `
    )
    .eq('awb_number', awb)
    .maybeSingle();

  if (error) {
    logger.error('[PrintLabel] Shipment fetch error', { message: error.message });
    return null;
  }

  return data as any;
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
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string; shipment?: Shipment };
      if (payload?.type !== 'TAC_LABEL_PAYLOAD' || !payload.shipment) return;
      if (!validateShipmentForLabel(payload.shipment)) return;

      const perAwbKey = `print_shipping_label_${payload.shipment.awb}`;
      sessionStorage.setItem(perAwbKey, JSON.stringify(payload.shipment));
      setError(null);
      setData(mapShipmentToLabel(payload.shipment));
      logger.debug('[PrintLabel] Payload received via postMessage');
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadShipmentData = async () => {
      try {
        if (!awb) {
          if (isMounted) setError('Missing AWB for label generation.');
          return;
        }
        // Try per-AWB key first (new format), then fallback to legacy key
        const perAwbKey = `print_shipping_label_${awb}`;
        const legacyKey = 'print_shipping_label';

        logger.debug('[PrintLabel] Attempt', { attempt: retryCount + 1, awb });

        // Prefer sessionStorage for this tab; fall back to localStorage (Firefox ETP may block localStorage)
        const sessionValue = sessionStorage.getItem(perAwbKey);
        const localValue = localStorage.getItem(perAwbKey);
        let stored = sessionValue || localValue;
        let usedKey = perAwbKey;
        let usedStorage: 'localStorage' | 'sessionStorage' = sessionValue
          ? 'sessionStorage'
          : localValue
            ? 'localStorage'
            : 'sessionStorage';

        logger.debug('[PrintLabel] Per-AWB key result', { found: !!stored, storage: usedStorage });

        if (!stored) {
          const legacySession = sessionStorage.getItem(legacyKey);
          const legacyLocal = localStorage.getItem(legacyKey);
          stored = legacySession || legacyLocal;
          usedKey = legacyKey;
          usedStorage = legacySession ? 'sessionStorage' : legacyLocal ? 'localStorage' : 'sessionStorage';
          logger.debug('[PrintLabel] Legacy key result', { found: !!stored, storage: usedStorage });
        }

        // Debug: List all storage keys containing 'label'
        const localKeys = Object.keys(localStorage).filter((k) => k.includes('label'));
        const sessionKeys = Object.keys(sessionStorage).filter((k) => k.includes('label'));
        logger.debug('[PrintLabel] Storage keys', { localKeys, sessionKeys });

        if (!stored && typeof window.name === 'string' && window.name.startsWith('TAC_LABEL:')) {
          stored = window.name.replace('TAC_LABEL:', '');
          usedStorage = 'sessionStorage';
          logger.debug('[PrintLabel] window.name payload used');
        }

        if (!stored) {
          // Retry briefly to handle storage race, then fall back to DB fetch.
          if (retryCount < 2) {
            logger.debug('[PrintLabel] Data not found, retrying in 300ms');
            setTimeout(() => setRetryCount((c) => c + 1), 300);
            return;
          }

          logger.debug('[PrintLabel] Falling back to DB fetch', { awb });
          const fetched = await fetchShipmentByAwb(awb);
          if (fetched) {
            const shipment = mapShipmentRowToShipment(fetched);
            if (isMounted) {
              sessionStorage.setItem(perAwbKey, JSON.stringify(shipment));
              setData(mapShipmentToLabel(shipment));
            }
            return;
          }

          if (isMounted) {
            setError('No shipment data found. Please generate label from Invoices dashboard.');
          }
          return;
        }

        const parsed = JSON.parse(stored);
        logger.debug('[PrintLabel] Parsed data', { awb: parsed.awb });

        // Persist payload in this tab's sessionStorage to survive StrictMode remounts
        sessionStorage.setItem(perAwbKey, stored);

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

        if (isMounted) {
          setData(mapShipmentToLabel(shipment));
        }

        // Clean up localStorage after reading to prevent PII lingering
        localStorage.removeItem(usedKey);
      } catch (e) {
        console.error('Failed to load shipment:', e);
        if (isMounted) {
          setError('Failed to parse shipment data. Please try generating the label again.');
        }
      }
    };

    loadShipmentData();
    return () => {
      isMounted = false;
    };
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
