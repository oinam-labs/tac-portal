'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- Complex form handling requires any */
/* eslint-disable react-hooks/exhaustive-deps -- Form dependencies managed by react-hook-form */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import { useForm, FormProvider as Form } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence, MotionConfig } from '@/lib/motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Check,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  User,
  MapPin,
  Box,
  Calculator,
  Ruler,
  Scale,
  CheckCircle,
  Loader2,
  RotateCcw,
  Plane,
  Truck,
  Printer,
} from 'lucide-react';
import { formatCurrency, calculateFreight } from '@/lib/utils';
import { validateInvoice, validateDiscount } from '@/lib/validation/invoice-validator';
import { PAYMENT_MODES, POPULAR_CITIES, CONTENT_TYPES } from '@/lib/constants';
import type { CustomerAddress } from '@/hooks/useCustomers';

// Hub prefill mapping for cities
const HUB_PREFILL: Record<string, { address: string; zip: string; state: string }> = {
  'Imphal': { address: 'Singjamei Hub', zip: '795001', state: 'Manipur' },
  'New Delhi': { address: 'Kotla Hub', zip: '110003', state: 'Delhi' },
};
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useCustomers, Customer as CustomerDB } from '@/hooks/useCustomers';
import type { Json } from '@/lib/database.types';
import { getOrCreateDefaultOrg } from '@/lib/org-helper';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { Shipment, Invoice, ShipmentMode, ServiceLevel } from '@/types';
import { TrackingDialog } from '@/components/landing-new/tracking-dialog';
import { LabelPreviewDialog } from '@/components/domain/LabelPreviewDialog';
import { generateLabelFromFormData } from '@/lib/utils/label-utils';

// --- SCHEMA (Same as original) ---
const schema = z.object({
  awb: z.string().min(1, 'AWB Required'),
  invoiceNumber: z.string().optional(),
  bookingDate: z.string().min(1, 'Date Required'),
  paymentMode: z.enum(['PAID', 'TO_PAY', 'TBB']),
  transportMode: z.enum(['AIR', 'TRUCK']),

  // Consignor
  consignorName: z.string().min(2, 'Name Required'),
  consignorPhone: z.string().min(10, 'Phone Required'),
  consignorAddress: z.string().min(5, 'Address Required'),
  consignorCity: z.string().min(2, 'City Required'),
  consignorState: z.string().min(2, 'State Required'),
  consignorZip: z.string().min(6, 'Zip Required'),
  consignorGstin: z.string().optional(),

  // Consignee
  consigneeName: z.string().min(2, 'Name Required'),
  consigneePhone: z.string().min(10, 'Phone Required'),
  consigneeAddress: z.string().min(5, 'Address Required'),
  consigneeCity: z.string().min(2, 'City Required'),
  consigneeState: z.string().min(2, 'State Required'),
  consigneeZip: z.string().min(6, 'Zip Required'),
  consigneeGstin: z.string().optional(),

  // Item Details
  contents: z.string().min(2, 'Contents required'),
  declaredValue: z.coerce.number().min(0),
  pieces: z.coerce.number().min(1),

  // Volumetric (Default to 0 if empty)
  dimL: z.coerce.number().default(0),
  dimB: z.coerce.number().default(0),
  dimH: z.coerce.number().default(0),

  // Weights
  actualWeight: z.coerce.number().min(0.1, 'Required'),
  chargedWeight: z.coerce.number().min(0.1, 'Required'),

  // Financials
  ratePerKg: z.coerce.number().min(0),
  baseFreight: z.coerce.number().min(0),
  docketCharge: z.coerce.number().min(0),
  pickupCharge: z.coerce.number().min(0),
  packingCharge: z.coerce.number().min(0),
  fuelSurcharge: z.coerce.number().min(0),
  handlingFee: z.coerce.number().min(0),
  insurance: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  advancePaid: z.coerce.number().min(0),
  gstApplicable: z.boolean().default(true),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

type FormData = z.infer<typeof schema>;

// --- UI HELPERS ---
const SectionHeader: React.FC<{ icon: any; title: string; action?: React.ReactNode }> = ({
  icon: Icon,
  title,
  action,
}) => (
  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40">
    <div className="flex items-center gap-2.5">
      <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-bold tracking-wide text-foreground uppercase">{title}</span>
    </div>
    {action}
  </div>
);

const Label: React.FC<{
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}> = ({ children, required, error, className }) => (
  <div className={`flex justify-between items-end mb-2 ${className}`}>
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
      {children}
      {required && <span className="text-red-500 text-xs leading-none">*</span>}
    </label>
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

// Searchable Customer Dropdown (Simplified for Multistep)
const CustomerSearch: React.FC<{
  customers: CustomerDB[];
  onSelect: (c: CustomerDB) => void;
  placeholder?: string;
}> = ({ customers, onSelect, placeholder = 'Search...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fuzzy search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(customers, {
        keys: ['name', 'companyName', 'phone'],
        threshold: 0.3,
        includeScore: true,
      }),
    [customers]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch) return customers.slice(0, 5);
    return fuse
      .search(debouncedSearch)
      .slice(0, 5)
      .map((result) => result.item);
  }, [debouncedSearch, fuse, customers]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex items-center justify-between border border-input rounded-md bg-background px-3 h-9 cursor-pointer hover:border-primary transition-all text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`truncate ${search ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
        >
          {search || placeholder}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              className="w-full bg-muted rounded border-none text-xs py-1.5 px-2 focus:ring-0 outline-none text-foreground"
              placeholder="Type to filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="p-2 text-center text-[10px] text-muted-foreground">No match.</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className="px-3 py-2 hover:bg-muted cursor-pointer rounded-sm transition-colors"
                  onClick={() => {
                    onSelect(c);
                    setSearch(c.companyName || c.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>{c.companyName || c.name}</span>
                    {c.tier === 'ENTERPRISE' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{c.phone}</span>
                    {c.invoiceCount && (
                      <span className="text-[9px] text-muted-foreground">
                        {c.invoiceCount} invoices · ₹{(c.avgInvoiceValue || 0).toLocaleString()} avg
                      </span>
                    )}
                  </div>
                  {c.preferences && (
                    <div className="flex gap-1 mt-1">
                      {c.preferences.preferredTransportMode && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                          {c.preferences.preferredTransportMode === 'AIR' ? (
                            <Plane className="w-2.5 h-2.5" />
                          ) : (
                            <Truck className="w-2.5 h-2.5" />
                          )}
                          {c.preferences.preferredTransportMode}
                        </span>
                      )}
                      {c.preferences.preferredPaymentMode && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                          {c.preferences.preferredPaymentMode}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  onSuccess: (invoice?: Invoice, shipment?: Shipment) => void;
  onCancel: () => void;
}

export default function MultiStepCreateInvoice({ onSuccess, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const createInvoiceMutation = useCreateInvoice();
  const isLoading = createInvoiceMutation.isPending;
  const { data: customers = [] } = useCustomers();
  const staffUser = useAuthStore((s) => s.user);

  // Mode State
  const [mode, setMode] = useState<'NEW_BOOKING' | 'EXISTING_SHIPMENT'>('NEW_BOOKING');
  const [searchAwb, setSearchAwb] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchError, setSearchError] = useState('');

  // Field Modes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_consignorCityMode, setConsignorCityMode] = useState<'SELECT' | 'INPUT'>('SELECT');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_consigneeCityMode, setConsigneeCityMode] = useState<'SELECT' | 'INPUT'>('SELECT');
  const [contentMode, setContentMode] = useState<'SELECT' | 'INPUT'>('SELECT');
  const [showLabelPreview, setShowLabelPreview] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    shouldUnregister: false, // Critical for multi-step
    defaultValues: {
      bookingDate: new Date().toISOString().split('T')[0],
      paymentMode: 'TO_PAY',
      transportMode: 'TRUCK',
      pieces: 1,
      dimL: 0,
      dimB: 0,
      dimH: 0,
      actualWeight: 0,
      chargedWeight: 0,
      ratePerKg: 120,
      docketCharge: 80,
      contents: 'Personal Effects',
      consignorState: 'Delhi',
      consigneeState: 'Manipur',
      consignorCity: 'New Delhi',
      consigneeCity: 'Imphal',
      declaredValue: 0,
      discount: 0,
      advancePaid: 0,
      insurance: 0,
      fuelSurcharge: 0,
      handlingFee: 0,
      packingCharge: 0,
      pickupCharge: 0,
      gstApplicable: true,
      gstRate: 18,
    },
  });

  const { setValue, watch, trigger, getValues } = form;
  const formValues = watch();

  // useCustomers hook handles data fetching automatically

  // Form auto-save (draft)
  useEffect(() => {
    const timer = setInterval(() => {
      const draft = JSON.stringify(formValues);
      localStorage.setItem('invoice_draft', draft);
    }, 5000);
    return () => clearInterval(timer);
  }, [formValues]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('invoice_draft');
    if (draft && !getValues('awb')) {
      try {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach((key) => {
          if (parsed[key] !== undefined) setValue(key as any, parsed[key]);
        });
        toast.info('Draft restored');
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  // --- LOGIC: CALCULATIONS (Ported) ---
  const safeNum = useCallback((val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  useEffect(() => {
    const { dimL, dimB, dimH, pieces, actualWeight, ratePerKg } = formValues;

    // Volumetric Weight (cm / 5000)
    const volWeight = (safeNum(dimL) * safeNum(dimB) * safeNum(dimH) * safeNum(pieces)) / 5000;

    // Chargeable is higher of Actual vs Volumetric
    const chargeable = Math.max(safeNum(actualWeight), parseFloat(volWeight.toFixed(2)));

    // Only update if significantly different to avoid loops
    if (Math.abs(chargeable - safeNum(formValues.chargedWeight)) > 0.01) {
      setValue('chargedWeight', chargeable);
    }

    if (ratePerKg && chargeable) {
      const freight = Math.round(chargeable * safeNum(ratePerKg));
      if (Math.abs(freight - safeNum(formValues.baseFreight)) > 1) {
        setValue('baseFreight', freight);
      }
    }
  }, [
    formValues.dimL,
    formValues.dimB,
    formValues.dimH,
    formValues.pieces,
    formValues.actualWeight,
    formValues.ratePerKg,
    formValues.chargedWeight,
    formValues.baseFreight,
    setValue,
    safeNum,
  ]);

  const subtotal =
    safeNum(formValues.baseFreight) +
    safeNum(formValues.docketCharge) +
    safeNum(formValues.pickupCharge) +
    safeNum(formValues.packingCharge) +
    safeNum(formValues.fuelSurcharge) +
    safeNum(formValues.handlingFee) +
    safeNum(formValues.insurance) -
    safeNum(formValues.discount);

  const tax = formValues.gstApplicable
    ? Math.round(subtotal * (safeNum(formValues.gstRate) / 100))
    : 0;
  const total = subtotal + tax;
  const balance = total - safeNum(formValues.advancePaid);

  // --- LOGIC: AUTO ID (Smart) ---
  useEffect(() => {
    let cancelled = false;

    const ensureAwb = async () => {
      if (mode !== 'NEW_BOOKING') return;
      if (getValues('awb')) return;

      try {
        const orgId = staffUser?.orgId || (await getOrCreateDefaultOrg());
        const { data, error } = await supabase.rpc('generate_awb_number', { p_org_id: orgId });
        if (error) throw error;
        if (typeof data !== 'string' || !data) {
          throw new Error('AWB generator returned empty');
        }

        if (cancelled) return;
        setValue('awb', data);
        setValue('invoiceNumber', '');
      } catch (error) {
        if (cancelled) return;
        setValue('awb', '');
        logger.error('AWB generation failed', {
          env: import.meta.env.MODE,
          org_id: staffUser?.orgId || null,
          user_id: staffUser?.id || null,
          auth_user_id: staffUser?.authUserId || null,
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error('AWB service unavailable. Contact admin.', {
          description: 'Unable to generate an AWB number at this time.',
        });
      }
    };

    void ensureAwb();
    return () => {
      cancelled = true;
    };
  }, [mode, setValue, getValues, staffUser?.orgId, staffUser?.id, staffUser?.authUserId]);

  // Real-time discount validation
  useEffect(() => {
    const discount = safeNum(formValues.discount);
    const subtotalVal =
      safeNum(formValues.baseFreight) +
      safeNum(formValues.fuelSurcharge) +
      safeNum(formValues.handlingFee) +
      safeNum(formValues.insurance);

    if (subtotalVal > 0 && discount > 0) {
      const result = validateDiscount(subtotalVal, discount);
      if (!result.isValid) {
        // We don't block input, but we could set a form error
        // For now, let's rely on the submit validation but maybe show a toast once
        // or preferably, we could set a local warning state if we had a UI place for it
      }
    }
  }, [formValues.discount, formValues.baseFreight, safeNum]);

  const handleSearch = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchError('');

    try {
      const { data: shipmentData, error } = await supabase
        .from('shipments')
        .select('*, customer:customers(name, phone)')
        .eq('awb_number', searchAwb.trim().toUpperCase())
        .maybeSingle<{
          id: string;
          awb_number: string;
          customer: { name: string; phone: string };
          contents_description: string;
          package_count: number;
          total_weight: number;
          mode: string;
          service_level: string;
        }>();

      if (error) throw error;

      if (shipmentData) {
        // Map Supabase data to frontend format
        const shipment: Partial<Shipment> = {
          id: shipmentData.id,
          awb: shipmentData.awb_number,
          customerName: shipmentData.customer?.name || 'Unknown',
          contentsDescription: shipmentData.contents_description || 'General Cargo',
          totalPackageCount: shipmentData.package_count || 1,
          totalWeight: {
            dead: shipmentData.total_weight || 0,
            volumetric: 0,
            chargeable: shipmentData.total_weight || 0,
          },
          mode: (shipmentData.mode || 'TRUCK') as ShipmentMode,
          serviceLevel: (shipmentData.service_level || 'STANDARD') as ServiceLevel,
        };

        setSelectedShipment(shipment as Shipment);
        setValue('awb', shipment.awb || '');
        setValue('contents', shipment.contentsDescription || 'General Cargo');
        setValue('pieces', shipment.totalPackageCount || 1);
        setValue('actualWeight', shipment.totalWeight?.dead || 0);
        setValue('chargedWeight', shipment.totalWeight?.chargeable || 0);
        if (shipment.customerName) setValue('consigneeName', shipment.customerName);
        const calcs = calculateFreight(
          shipment.totalWeight?.chargeable || 0,
          shipment.mode || 'TRUCK',
          shipment.serviceLevel || 'STANDARD'
        );
        setValue('ratePerKg', calcs.ratePerKg);
        setValue('baseFreight', calcs.baseFreight);
        toast.success('Shipment data loaded!');
      } else {
        setSelectedShipment(null);
        setSearchError('Shipment not found.');
        toast.error('Shipment not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSelectedShipment(null);
      setSearchError('Search failed.');
      toast.error('Failed to search shipment');
    }
  };

  const handleRepeatLast = () => {
    // Feature temporarily disabled - requires fetching last invoice from Supabase
    toast.info('Repeat last invoice feature coming soon');
  };

  // Format CustomerAddress object to string
  const formatCustomerAddress = (address: CustomerAddress | Json | string | null): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const addr = address as CustomerAddress;
    return [addr.street, addr.city, addr.state, addr.postal_code]
      .filter(Boolean)
      .join(', ');
  };

  const fillCustomerData = (customer: CustomerDB, type: 'CONSIGNOR' | 'CONSIGNEE') => {
    const prefix = type === 'CONSIGNOR' ? 'consignor' : 'consignee';
    setValue(`${prefix}Name` as any, customer.companyName || customer.name, {
      shouldValidate: true,
    });
    setValue(`${prefix}Phone` as any, customer.phone, { shouldValidate: true });
    
    // Format address object to string
    const formattedAddress = formatCustomerAddress(customer.address);
    setValue(`${prefix}Address` as any, formattedAddress, { shouldValidate: true });
    setValue(`${prefix}Gstin` as any, customer.gstin || '', { shouldValidate: true });
    
    // Extract city/state/zip from address if available
    const addr = customer.address as CustomerAddress;
    if (addr && typeof addr === 'object') {
      if (addr.city) setValue(`${prefix}City` as any, addr.city, { shouldValidate: true });
      if (addr.state) setValue(`${prefix}State` as any, addr.state, { shouldValidate: true });
      if (addr.postal_code) setValue(`${prefix}Zip` as any, addr.postal_code, { shouldValidate: true });
    }

    // Smart autofill: Apply customer preferences (Phase 2)
    if (type === 'CONSIGNEE' && customer.preferences) {
      if (customer.preferences.preferredTransportMode) {
        setValue('transportMode', customer.preferences.preferredTransportMode);
      }
      if (customer.preferences.preferredPaymentMode) {
        setValue('paymentMode', customer.preferences.preferredPaymentMode as any);
      }
      if (customer.preferences.gstApplicable !== undefined) {
        setValue('gstApplicable', customer.preferences.gstApplicable);
      }
      if (customer.preferences.typicalContents) {
        setValue('contents', customer.preferences.typicalContents);
      }

      // Show notification about applied preferences
      toast.info(`Applied ${customer.companyName || customer.name}'s preferences`);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const financials = {
        ratePerKg: safeNum(data.ratePerKg),
        baseFreight: safeNum(data.baseFreight),
        docketCharge: safeNum(data.docketCharge),
        pickupCharge: safeNum(data.pickupCharge),
        packingCharge: safeNum(data.packingCharge),
        fuelSurcharge: safeNum(data.fuelSurcharge),
        handlingFee: safeNum(data.handlingFee),
        insurance: safeNum(data.insurance),
        discount: safeNum(data.discount),
        advancePaid: safeNum(data.advancePaid),
        balance: balance,
        tax: { cgst: 0, sgst: 0, igst: tax, total: tax },
        totalAmount: total,
      };

      // VALIDATION START
      // Find selected customer object for context-aware validation (e.g., TBB checks)
      // Match by name (consignor or consignee) to find the customer in our database
      const customerContext = customers.find(
        (c) =>
          c.companyName === data.consignorName ||
          c.name === data.consignorName ||
          c.companyName === data.consigneeName ||
          c.name === data.consigneeName
      );

      // CRITICAL: Get a valid customer_id - use first available customer as fallback
      // This ensures we always have a valid foreign key reference
      const validCustomerId = customerContext?.id || customers[0]?.id;

      if (!validCustomerId) {
        toast.error('No customers found. Please create a customer first.');
        return;
      }

      const validationResult = validateInvoice(
        {
          awb: data.awb,
          customerId: validCustomerId,
          paymentMode: data.paymentMode,
          financials: financials,
        },
        customerContext as any
      );

      if (!validationResult.isValid) {
        // Show all errors
        validationResult.errors.forEach((err) => toast.error(err.message));
        return; // Stop submission
      }

      if (validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warn) => toast.warning(warn));
        // We could block here for "Manager Approval", but for now we just warn and proceed
      }
      // VALIDATION END

      // Create invoice in Supabase
      const createdInvoice = await createInvoiceMutation.mutateAsync({
        customer_id: validCustomerId, // Use validated customer ID (never hardcoded)
        shipment_id: selectedShipment?.id,
        subtotal: subtotal,
        tax_amount: tax, // DB column is tax_amount (number)
        total: total, // DB column name (not total_amount)
        discount: safeNum(data.discount),
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Contents: ${data.contents} | Payment: ${data.paymentMode}`,
        line_items: {
          baseFreight: financials.baseFreight,
          docketCharge: financials.docketCharge,
          pickupCharge: financials.pickupCharge,
          packingCharge: financials.packingCharge,
          fuelSurcharge: financials.fuelSurcharge,
          handlingFee: financials.handlingFee,
          insurance: financials.insurance,
          discount: financials.discount,
          tax: { cgst: 0, sgst: 0, igst: tax, total: tax }, // Store tax breakdown in line_items
          consignor: {
            name: data.consignorName,
            phone: data.consignorPhone,
            address: data.consignorAddress,
            city: data.consignorCity,
            state: data.consignorState,
            zip: data.consignorZip,
          },
          consignee: {
            name: data.consigneeName,
            phone: data.consigneePhone,
            address: data.consigneeAddress,
            city: data.consigneeCity,
            state: data.consigneeState,
            zip: data.consigneeZip,
          },
        },
      });

      // Clear draft after success
      localStorage.removeItem('invoice_draft');

      // Build invoice object for success dialog (include consignor/consignee for label generation)
      const invoiceForDialog: Invoice = {
        id: createdInvoice.id,
        invoiceNumber: createdInvoice.invoice_no, // Use DB column name
        customerId: createdInvoice.customer_id,
        customerName: data.consigneeName,
        shipmentId: createdInvoice.shipment_id || '',
        awb: data.awb,
        status: createdInvoice.status as any,
        createdAt: createdInvoice.created_at,
        dueDate: createdInvoice.due_date || '',
        paymentMode: data.paymentMode,
        financials: financials as any,
        // Include consignor/consignee for label generation when no shipment exists
        consignor: {
          name: data.consignorName,
          phone: data.consignorPhone,
          address: data.consignorAddress,
          city: data.consignorCity,
          state: data.consignorState,
        },
        consignee: {
          name: data.consigneeName,
          phone: data.consigneePhone,
          address: data.consigneeAddress,
          city: data.consigneeCity,
          state: data.consigneeState,
        },
      } as Invoice;

      // Pass invoice to parent for success dialog
      onSuccess(invoiceForDialog, selectedShipment || undefined);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to create invoice.');
    }
  };

  // --- STEPS ---
  const steps = [
    {
      title: 'Basics',
      description: 'AWB & Booking Info',
      fields: ['awb', 'bookingDate', 'paymentMode', 'invoiceNumber'],
    },
    {
      title: 'Parties',
      description: 'Sender & Receiver',
      fields: ['consignorName', 'consigneeName', 'consignorPhone', 'consigneePhone'],
    },
    {
      title: 'Cargo',
      description: 'Dims, Weight & Content',
      fields: ['contents', 'pieces', 'actualWeight', 'chargedWeight'],
    },
    { title: 'Payment', description: 'Rates & Charges', fields: [] },
  ];

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const valid = await trigger(fieldsToValidate as any);
    if (valid) {
      if (currentStep < steps.length - 1) {
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // BASICS
        return (
          <div className="space-y-6 py-2">
            <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/60 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('NEW_BOOKING');
                  setValue('awb', '');
                  setValue('invoiceNumber', '');
                }}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-2 tracking-wide ${mode === 'NEW_BOOKING' ? 'bg-background shadow-sm text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Plus className="w-3.5 h-3.5" /> New Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('EXISTING_SHIPMENT');
                  setValue('awb', '');
                }}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-2 tracking-wide ${mode === 'EXISTING_SHIPMENT' ? 'bg-background shadow-sm text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Search className="w-3.5 h-3.5" /> Link Shipment
              </button>
              <button
                type="button"
                onClick={handleRepeatLast}
                className="px-3.5 py-1.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-background tracking-wide"
                title="Repeat last invoice"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Repeat Last
              </button>
            </div>

            {mode === 'EXISTING_SHIPMENT' && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 animate-in fade-in slide-in-from-top-2">
                <Input
                  placeholder="Enter AWB Number..."
                  value={searchAwb}
                  onChange={(e) => setSearchAwb(e.target.value)}
                  className="h-10 w-64 bg-background"
                />
                <Button size="sm" onClick={handleSearch} className="h-10">
                  Load
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <TrackingDialog>
                  <Button size="sm" variant="outline" className="h-10 gap-2 border-dashed">
                    <Search className="w-4 h-4" /> Check Status
                  </Button>
                </TrackingDialog>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>AWB Number</Label>
                <Input
                  {...form.register('awb')}
                  readOnly
                  className="h-11 font-mono bg-muted/40 border-border/60 text-sm"
                />
                {form.formState.errors.awb && (
                  <span className="text-xs text-red-500">{form.formState.errors.awb.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Invoice Ref</Label>
                <Input
                  {...form.register('invoiceNumber')}
                  readOnly
                  className="h-11 font-mono bg-muted/40 border-border/60 text-sm"
                  placeholder="Auto-generated on save"
                />
              </div>
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Input
                  type="date"
                  {...form.register('bookingDate')}
                  className="h-11 bg-background"
                />
                {form.formState.errors.bookingDate && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.bookingDate.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Transport Mode</Label>
                <div className="relative">
                  <select
                    {...form.register('transportMode')}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-12 pr-10 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="TRUCK">🚚 Surface / Truck</option>
                    <option value="AIR">✈️ Air Cargo</option>
                  </select>
                  <div
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md border pointer-events-none ${
                      formValues.transportMode === 'AIR'
                        ? 'bg-status-info/10 text-status-info border-status-info/30'
                        : 'bg-status-warning/10 text-status-warning border-status-warning/30'
                    }`}
                  >
                    {formValues.transportMode === 'AIR' ? (
                      <Plane className="w-4 h-4" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <select
                  {...form.register('paymentMode')}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {PAYMENT_MODES.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 1: // PARTIES
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Consignor */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <SectionHeader
                icon={User}
                title="Consignor (Sender)"
                action={
                  <div className="w-32">
                    <CustomerSearch
                      customers={customers}
                      onSelect={(c) => fillCustomerData(c, 'CONSIGNOR')}
                    />
                  </div>
                }
              />
              <div className="space-y-3">
                <div className="space-y-1">
                  <Input placeholder="Company / Full Name" {...form.register('consignorName')} />
                  {form.formState.errors.consignorName && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.consignorName.message}
                    </span>
                  )}
                </div>
                <Input {...form.register('consignorPhone')} placeholder="Phone Number" />
                <Input placeholder="Address Line" {...form.register('consignorAddress')} />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      const city = e.target.value;
                      if (city === 'OTHER') {
                        setConsignorCityMode('INPUT');
                        setValue('consignorCity', '');
                      } else {
                        setValue('consignorCity', city);
                        // Hub prefill for known cities
                        const hub = HUB_PREFILL[city];
                        if (hub) {
                          setValue('consignorAddress', hub.address, { shouldValidate: true });
                          setValue('consignorZip', hub.zip, { shouldValidate: true });
                          setValue('consignorState', hub.state, { shouldValidate: true });
                        }
                      }
                    }}
                    value={
                      POPULAR_CITIES.includes(watch('consignorCity'))
                        ? watch('consignorCity')
                        : 'OTHER'
                    }
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">Other...</option>
                  </select>
                  <Input placeholder="Zip Code" {...form.register('consignorZip')} maxLength={6} />
                </div>
              </div>
            </div>

            {/* Consignee */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <SectionHeader
                icon={MapPin}
                title="Consignee (Receiver)"
                action={
                  <div className="w-32">
                    <CustomerSearch
                      customers={customers}
                      onSelect={(c) => fillCustomerData(c, 'CONSIGNEE')}
                    />
                  </div>
                }
              />
              <div className="space-y-3">
                <div className="space-y-1">
                  <Input placeholder="Company / Full Name" {...form.register('consigneeName')} />
                  {form.formState.errors.consigneeName && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.consigneeName.message}
                    </span>
                  )}
                </div>
                <Input {...form.register('consigneePhone')} placeholder="Phone Number" />
                <Input placeholder="Address Line" {...form.register('consigneeAddress')} />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      const city = e.target.value;
                      if (city === 'OTHER') {
                        setConsigneeCityMode('INPUT');
                        setValue('consigneeCity', '');
                      } else {
                        setValue('consigneeCity', city);
                        // Hub prefill for known cities
                        const hub = HUB_PREFILL[city];
                        if (hub) {
                          setValue('consigneeAddress', hub.address, { shouldValidate: true });
                          setValue('consigneeZip', hub.zip, { shouldValidate: true });
                          setValue('consigneeState', hub.state, { shouldValidate: true });
                        }
                      }
                    }}
                    value={
                      POPULAR_CITIES.includes(watch('consigneeCity'))
                        ? watch('consigneeCity')
                        : 'OTHER'
                    }
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">Other...</option>
                  </select>
                  <Input placeholder="Zip Code" {...form.register('consigneeZip')} maxLength={6} />
                </div>
              </div>
            </div>
          </div>
        );
      case 2: // CARGO
        return (
          <div className="space-y-6 py-2">
            <SectionHeader icon={Box} title="Cargo Specification" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>
                  Nature of Goods <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      if (e.target.value === 'OTHER') {
                        setContentMode('INPUT');
                        setValue('contents', '');
                      } else setValue('contents', e.target.value);
                    }}
                    value={CONTENT_TYPES.includes(watch('contents')) ? watch('contents') : 'OTHER'}
                  >
                    {CONTENT_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">Other...</option>
                  </select>
                  {contentMode === 'INPUT' && (
                    <Input {...form.register('contents')} placeholder="Type..." />
                  )}
                </div>
                {form.formState.errors.contents && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.contents.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" {...form.register('pieces')} className="text-center" />
              </div>
              <div className="space-y-2">
                <Label>Value (₹)</Label>
                <Input type="number" {...form.register('declaredValue')} className="text-right" />
              </div>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border space-y-6">
              {/* Dimensions Row */}
              <div className="space-y-3">
                <Label className="flex gap-2">
                  <Ruler className="w-4 h-4" /> Package Dimensions (L × W × H in cm)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Length</span>
                    <Input
                      placeholder="0"
                      type="number"
                      {...form.register('dimL')}
                      className="text-center h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Width</span>
                    <Input
                      placeholder="0"
                      type="number"
                      {...form.register('dimB')}
                      className="text-center h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Height</span>
                    <Input
                      placeholder="0"
                      type="number"
                      {...form.register('dimH')}
                      className="text-center h-12 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Weights Row */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                  <Label className="flex gap-2">
                    <Scale className="w-4 h-4" /> Actual Weight
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register('actualWeight')}
                      className="pr-12 h-12 text-lg font-bold"
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-bold text-muted-foreground">
                      KG
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="flex gap-2 text-primary">
                    <CheckCircle className="w-4 h-4" /> Charged Weight
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register('chargedWeight')}
                      className="pr-12 h-12 text-lg font-bold border-primary/50 bg-primary/5"
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-bold text-primary">
                      KG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3: // FINANCIALS
        return (
          <div className="space-y-6 py-2">
            <Card className="p-6 border-t-4 border-t-primary">
              <SectionHeader icon={Calculator} title="Freight & Charges" />

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Freight Rate / KG</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      {...form.register('ratePerKg')}
                      className="pl-8 h-12 text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary">Base Freight (Auto)</Label>
                  <Input
                    type="number"
                    {...form.register('baseFreight')}
                    className="h-12 text-lg font-bold bg-muted"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  'docketCharge',
                  'pickupCharge',
                  'packingCharge',
                  'handlingFee',
                  'insurance',
                  'fuelSurcharge',
                ].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Input type="number" {...form.register(field as any)} className="text-right" />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <Label className="text-green-600 font-bold text-sm">Discount</Label>
                  <div className="relative w-40">
                    <span className="absolute left-3 top-2.5 text-green-600">−₹</span>
                    <Input
                      type="number"
                      {...form.register('discount')}
                      className="pl-10 text-right text-green-600 font-bold bg-green-500/5 border-green-500/30"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Summary Panel - Enhanced */}
            <div className="bg-gradient-to-br from-muted/60 to-muted/30 p-6 rounded-xl border border-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register('gstApplicable')}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-foreground">GST</span>
                      </label>
                      {formValues.gstApplicable && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            {...form.register('gstRate')}
                            className="w-14 h-7 text-center text-xs"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Advance Paid</span>
                    <Input
                      placeholder="₹0"
                      type="number"
                      {...form.register('advancePaid')}
                      className="w-28 text-right h-8 text-sm"
                    />
                  </div>

                  {balance > 0 && balance !== total && (
                    <div className="flex justify-between items-center py-2 bg-amber-500/10 px-3 rounded-lg border border-amber-500/20">
                      <span className="text-sm font-medium text-amber-600">Balance Due</span>
                      <span className="font-bold text-amber-600">{formatCurrency(balance)}</span>
                    </div>
                  )}
                </div>

                {/* Right: Grand Total */}
                <div className="flex flex-col items-end justify-center bg-primary/5 rounded-xl p-6 border border-primary/20">
                  <div className="text-xs uppercase text-primary/70 tracking-wider font-bold mb-1">
                    Grand Total
                  </div>
                  <div className="text-4xl font-black text-primary tracking-tight">
                    {formatCurrency(total)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {formValues.gstApplicable ? 'Inclusive of GST' : 'GST not applicable'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const variants = {
    initial: (direction: number) => ({ x: `${110 * direction}%`, opacity: 0 }),
    animate: { x: '0%', opacity: 1 },
    exit: (direction: number) => ({ x: `${-110 * direction}%`, opacity: 0 }),
  };

  return (
    <Form {...form}>
      <MotionConfig transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}>
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full min-h-[70vh]">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground text-sm">{steps[currentStep].description}</p>
              </div>
              <div className="text-xs font-semibold tracking-wide uppercase text-muted-foreground border border-border/60 bg-muted/40 px-3 py-1 rounded-full">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                const stateClasses = isActive
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : isComplete
                    ? 'border-border bg-muted text-foreground'
                    : 'border-border/40 bg-muted/40 text-muted-foreground';
                const badgeClasses = isActive
                  ? 'bg-primary text-primary-foreground'
                  : isComplete
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground';
                return (
                  <div
                    key={step.title}
                    className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${stateClasses}`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${badgeClasses}`}
                    >
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content Card */}
          <Card className="flex-1 overflow-hidden flex flex-col border-border/60 shadow-lg min-h-[500px]">
            <div className="flex-1 overflow-y-auto">
              <CardContent className="p-8">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={currentStep}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={direction}
                    className="w-full"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </div>

            <CardFooter className="flex justify-between border-t bg-muted/20 p-6 z-10 mt-auto">
              <Button
                variant="outline"
                type="button"
                onClick={currentStep === 0 ? onCancel : prevStep}
                disabled={isLoading}
              >
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>

              <div className="flex gap-2">
                {currentStep === steps.length - 1 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowLabelPreview(true)}
                    disabled={isLoading}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Preview Label
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Confirm & Book <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </MotionConfig>

      {/* Label Preview Dialog */}
      <LabelPreviewDialog
        open={showLabelPreview}
        onOpenChange={setShowLabelPreview}
        shipmentData={generateLabelFromFormData(formValues)}
      />
    </Form>
  );
}
