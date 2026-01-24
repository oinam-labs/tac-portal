import React from 'react';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { DashboardCharts } from '../components/dashboard/Charts';
import { Button } from '../components/ui/CyberComponents';
import { RefreshCw } from 'lucide-react';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';

import { ErrorBoundary, InlineError } from '../components/ui/error-boundary';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { useRealtimeShipments, useRealtimeExceptions } from '../hooks/useRealtime';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Enable realtime subscriptions for live dashboard updates
  useRealtimeShipments();
  useRealtimeExceptions();

  // Global refresh handler
  const refreshData = () => {
    // Invalidate all dashboard queries
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    // Also invalidate shipments as they power the recent activity
    queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
  };

  return (
    <div data-testid="dashboard-page" className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 data-testid="dashboard-heading" className="text-3xl font-bold text-foreground tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Real-time logistics overview and operations.</p>
        </div>
        <div className="flex gap-3">
          <Button data-testid="dashboard-refresh-button" variant="ghost" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button data-testid="dashboard-download-button" variant="secondary">Download Report</Button>
        </div>
      </div>

      <ErrorBoundary fallback={<InlineError message="Failed to load quick actions" />}>
        <QuickActions />
      </ErrorBoundary>

      <ErrorBoundary fallback={<InlineError message="Failed to load KPI data" />}>
        <KPIGrid />
      </ErrorBoundary>

      <ErrorBoundary fallback={<InlineError message="Failed to load charts" />}>
        <DashboardCharts />
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <ErrorBoundary fallback={<InlineError message="Failed to load recent activity" />}>
          <RecentActivity />
        </ErrorBoundary>
      </div>
    </div>
  );
};
