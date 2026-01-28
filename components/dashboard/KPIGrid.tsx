import React, { useMemo } from 'react';
import { motion } from '@/lib/motion';
import {
  Box,
  Activity,
  CheckCircle,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';
import { Card } from '../ui/card';
import { KPIGridSkeleton } from '../ui/skeleton';
import { usePrevious } from '@/lib/hooks/usePrevious.ts';
import { useShipments } from '@/hooks/useShipments';
import { useExceptions } from '@/hooks/useExceptions';

interface KPIData {
  label: string;
  value: number;
  displayValue: string;
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
    success: 'text-status-success bg-status-success/10 border-status-success/20',
    warning: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    destructive: 'text-status-error bg-status-error/10 border-status-error/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Card data-testid={`kpi-card-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`} className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-border hover:border-primary/50 bg-card">
        {/* Background Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
          <kpi.icon className="w-24 h-24" />
        </div>

        {/* Content */}
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            {/* Icon Badge */}
            <div className={`p-2.5 rounded-lg border shadow-sm ${colorMap[kpi.color]}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>

          {/* Value with Animation */}
          <motion.div
            key={kpi.value}
            initial={{
              opacity: 0.5,
              y: isIncreasing ? 10 : isDecreasing ? -10 : 0,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight"
          >
            {kpi.displayValue}
          </motion.div>

          <div className="text-sm text-muted-foreground font-medium">{kpi.label}</div>
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
    const active = shipments.filter((s) =>
      ['RECEIVED_AT_ORIGIN', 'IN_TRANSIT', 'RECEIVED_AT_DEST'].includes(s.status)
    ).length;
    const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
    const exceptionCount = exceptions.filter((e) => e.status === 'OPEN').length;

    return [
      {
        label: 'Total Shipments',
        value: total,
        displayValue: total.toLocaleString(),
        icon: Box,
        color: 'primary',
      },
      {
        label: 'Active Transit',
        value: active,
        displayValue: active.toLocaleString(),
        icon: Activity,
        color: 'success',
      },
      {
        label: 'Delivered',
        value: delivered,
        displayValue: delivered.toLocaleString(),
        icon: CheckCircle,
        color: 'success',
      },
      {
        label: 'Active Exceptions',
        value: exceptionCount,
        displayValue: exceptionCount.toString(),
        icon: AlertTriangle,
        color: exceptionCount > 0 ? 'destructive' : 'warning',
      },
    ];
  }, [shipments, exceptions]);

  if (isLoading) {
    return <KPIGridSkeleton />;
  }

  return (
    <div data-testid="kpi-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  );
};

export default KPIGrid;
