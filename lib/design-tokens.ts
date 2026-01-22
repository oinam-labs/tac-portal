import { ShipmentStatus } from '../types';

/**
 * Status color mapping using semantic badge classes
 * These classes are defined in globals.css using CSS custom properties
 */
export const STATUS_COLORS: Partial<Record<ShipmentStatus, string>> = {
    'CREATED': 'badge--created',
    'PICKUP_SCHEDULED': 'badge--created',
    'PICKED_UP': 'badge--manifested',
    'RECEIVED_AT_ORIGIN': 'badge--manifested',
    'IN_TRANSIT': 'badge--in-transit',
    'RECEIVED_AT_DEST': 'badge--arrived',
    'OUT_FOR_DELIVERY': 'badge--in-transit',
    'DELIVERED': 'badge--delivered',
    'CANCELLED': 'badge--cancelled',
    'RTO': 'badge--returned',
    'EXCEPTION': 'badge--exception',
};

export const ANIMATION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    slideIn: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
    }
};

export const CHART_COLORS = {
    primary: '#22d3ee',
    secondary: '#c084fc',
    success: '#10b981',
    danger: '#ef4444',
    background: 'transparent',
    grid: 'rgba(34, 211, 238, 0.1)'
};
