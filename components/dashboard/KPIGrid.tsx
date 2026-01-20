import React, { useMemo } from 'react';
import { motion } from '@/lib/motion';
import { TrendingUp, TrendingDown, Box, Activity, CheckCircle, AlertTriangle, LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { KPIGridSkeleton } from '../ui/skeleton';
import { usePrevious } from '@/lib/hooks/usePrevious.ts';
import { useShipments } from '@/hooks/useShipments';
import { useExceptions } from '@/hooks/useExceptions';

interface KPIData {
    label: string;
    value: number;
    displayValue: string;
    trend: number;
    trendDirection: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color: 'primary' | 'success' | 'warning' | 'destructive';
}

interface KPICardProps {
    kpi: KPIData;
    index: number;
    isLoading?: boolean;
}

/**
 * Enhanced KPI Card with animations and transitions
 */
const KPICard = React.memo(({ kpi, index }: KPICardProps) => {
    const previousValue = usePrevious(kpi.value);
    const isIncreasing = previousValue !== undefined && kpi.value > previousValue;
    const isDecreasing = previousValue !== undefined && kpi.value < previousValue;

    const colorMap = {
        primary: 'text-primary bg-primary/10 border-primary/20',
        success: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20',
        warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        destructive: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
    };

    const trendColorMap = {
        up: 'text-green-600 dark:text-green-400 bg-green-500/10',
        down: 'text-red-600 dark:text-red-400 bg-red-500/10',
        neutral: 'text-muted-foreground bg-muted',
    };

    // Special case: For exceptions, down is good
    const effectiveTrendColor = kpi.label === 'Active Exceptions'
        ? (kpi.trendDirection === 'down' ? trendColorMap.up : trendColorMap.down)
        : trendColorMap[kpi.trendDirection];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.1,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
                {/* Background Icon */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <kpi.icon className="w-20 h-20" />
                </div>

                {/* Content */}
                <div className="p-6 relative">
                    <div className="flex justify-between items-start mb-4">
                        {/* Icon Badge */}
                        <div className={`p-2.5 rounded-lg border ${colorMap[kpi.color]}`}>
                            <kpi.icon className="w-5 h-5" />
                        </div>

                        {/* Trend Badge */}
                        <div className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${effectiveTrendColor}`}>
                            {kpi.trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
                            {kpi.trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                            {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                        </div>
                    </div>

                    {/* Value with Animation */}
                    <motion.div
                        key={kpi.value}
                        initial={{
                            opacity: 0.5,
                            y: isIncreasing ? 10 : isDecreasing ? -10 : 0
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight"
                    >
                        {kpi.displayValue}
                    </motion.div>

                    <div className="text-sm text-muted-foreground font-medium">
                        {kpi.label}
                    </div>

                    {/* Sparkline placeholder - can be enhanced with real data */}
                    <div className="mt-4 flex items-end gap-0.5 h-8 opacity-40">
                        {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90].map((height, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-sm ${kpi.color === 'destructive' ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

// Props interface for the KPIGrid
interface KPIGridProps {
    isLoading?: boolean;
}

/**
 * Enhanced Dashboard KPI Grid with animated cards and loading states
 */
export const KPIGrid: React.FC<KPIGridProps> = ({ isLoading: externalLoading = false }) => {
    // Use Supabase hooks instead of mock-db
    const { data: shipments = [], isLoading: shipmentsLoading } = useShipments();
    const { data: exceptions = [], isLoading: exceptionsLoading } = useExceptions();

    const isLoading = externalLoading || shipmentsLoading || exceptionsLoading;

    const kpis: KPIData[] = useMemo(() => {
        const total = shipments.length;
        const active = shipments.filter(s =>
            ['IN_TRANSIT_TO_DESTINATION', 'LOADED_FOR_LINEHAUL', 'RECEIVED_AT_ORIGIN_HUB'].includes(s.status)
        ).length;
        const delivered = shipments.filter(s => s.status === 'DELIVERED').length;
        const exceptionCount = exceptions.filter(e => e.status === 'OPEN').length;

        return [
            {
                label: 'Total Shipments',
                value: total,
                displayValue: total.toLocaleString(),
                trend: 12.5,
                trendDirection: 'up',
                icon: Box,
                color: 'primary'
            },
            {
                label: 'Active Transit',
                value: active,
                displayValue: active.toLocaleString(),
                trend: 8.1,
                trendDirection: 'up',
                icon: Activity,
                color: 'success'
            },
            {
                label: 'Delivered',
                value: delivered,
                displayValue: delivered.toLocaleString(),
                trend: 4.3,
                trendDirection: 'up',
                icon: CheckCircle,
                color: 'success'
            },
            {
                label: 'Active Exceptions',
                value: exceptionCount,
                displayValue: exceptionCount.toString(),
                trend: exceptionCount > 0 ? 10 : 0,
                trendDirection: exceptionCount > 0 ? 'down' : 'neutral',
                icon: AlertTriangle,
                color: exceptionCount > 0 ? 'destructive' : 'warning'
            },
        ];
    }, [shipments, exceptions]);

    if (isLoading) {
        return <KPIGridSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {kpis.map((kpi, index) => (
                <KPICard
                    key={kpi.label}
                    kpi={kpi}
                    index={index}
                />
            ))}
        </div>
    );
};

export default KPIGrid;