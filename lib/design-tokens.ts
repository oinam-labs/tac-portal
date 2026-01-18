import { ShipmentStatus } from '../types';

export const STATUS_COLORS: Partial<Record<ShipmentStatus, string>> = {
    'CREATED': 'text-slate-500 border-slate-500/30 bg-slate-500/10',
    'PICKED_UP': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    'RECEIVED_AT_ORIGIN_HUB': 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
    'LOADED_FOR_LINEHAUL': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    'IN_TRANSIT_TO_DESTINATION': 'text-cyber-neon border-cyber-neon/30 bg-cyber-neon/10',
    'RECEIVED_AT_DEST_HUB': 'text-teal-400 border-teal-400/30 bg-teal-400/10',
    'OUT_FOR_DELIVERY': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    'DELIVERED': 'text-cyber-success border-cyber-success/30 bg-cyber-success/10',
    'EXCEPTION_RAISED': 'text-cyber-danger border-cyber-danger/30 bg-cyber-danger/10',
    'DAMAGED': 'text-red-600 border-red-600/30 bg-red-600/10',
    'RETURNED': 'text-yellow-600 border-yellow-600/30 bg-yellow-600/10',
    'CANCELLED': 'text-gray-500 border-gray-500/30 bg-gray-500/10'
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
