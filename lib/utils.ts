
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ShipmentStatus, ShipmentMode, ServiceLevel } from '../types';

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount for INR.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a date string to a readable enterprise format.
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calculates Freight Charges based on logic.
 */
export function calculateFreight(weight: number, mode: ShipmentMode, service: ServiceLevel) {
    let ratePerKg = mode === 'AIR' ? 120 : 40; // Base rates
    if (service === 'EXPRESS') ratePerKg *= 1.5;
    
    // Minimum weights
    const chargeableWeight = Math.max(weight, mode === 'AIR' ? 1 : 10);
    
    const baseFreight = Math.round(chargeableWeight * ratePerKg);
    const fuelSurcharge = Math.round(baseFreight * 0.10); // 10%
    const handlingFee = 50;
    const insurance = Math.round(baseFreight * 0.02); // 2%
    
    // New Standard Charges
    const docketCharge = 80;
    const pickupCharge = 100;
    const packingCharge = 50;

    const subtotal = baseFreight + fuelSurcharge + handlingFee + insurance + docketCharge + pickupCharge + packingCharge;
    const igst = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + igst;

    return {
        ratePerKg,
        baseFreight,
        fuelSurcharge,
        handlingFee,
        insurance,
        docketCharge,
        pickupCharge,
        packingCharge,
        tax: { cgst: 0, sgst: 0, igst, total: igst },
        discount: 0,
        totalAmount,
        advancePaid: 0,
        balance: totalAmount
    };
}

/**
 * Validates Shipment State Transitions (Strict Mode)
 */
export function isValidTransition(current: ShipmentStatus, next: ShipmentStatus): boolean {
    const FLOW: Record<ShipmentStatus, ShipmentStatus[]> = {
        'CREATED': ['PICKED_UP', 'RECEIVED_AT_ORIGIN_HUB', 'CANCELLED'],
        'PICKED_UP': ['RECEIVED_AT_ORIGIN_HUB', 'EXCEPTION_RAISED'],
        'RECEIVED_AT_ORIGIN_HUB': ['LOADED_FOR_LINEHAUL', 'EXCEPTION_RAISED'],
        'LOADED_FOR_LINEHAUL': ['IN_TRANSIT_TO_DESTINATION', 'EXCEPTION_RAISED'],
        'IN_TRANSIT_TO_DESTINATION': ['RECEIVED_AT_DEST_HUB', 'EXCEPTION_RAISED'],
        'RECEIVED_AT_DEST_HUB': ['OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION_RAISED'],
        'OUT_FOR_DELIVERY': ['DELIVERED', 'RETURNED', 'EXCEPTION_RAISED'],
        'DELIVERED': [], // End state
        'RETURNED': [], // End state
        'CANCELLED': [], // End state
        'DAMAGED': ['EXCEPTION_RESOLVED'],
        'EXCEPTION_RAISED': ['EXCEPTION_RESOLVED', 'CANCELLED', 'RETURNED'],
        'EXCEPTION_RESOLVED': ['RECEIVED_AT_ORIGIN_HUB', 'RECEIVED_AT_DEST_HUB', 'IN_TRANSIT_TO_DESTINATION'] // Resume flow
    };

    // Allow forcing EXCEPTION from almost anywhere
    if (next === 'EXCEPTION_RAISED') return true;
    if (next === 'CANCELLED') return true;

    // Check strict flow
    return FLOW[current]?.includes(next) || false;
}
