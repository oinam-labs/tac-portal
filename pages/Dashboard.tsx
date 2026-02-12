import React from 'react';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { DashboardCharts } from '../components/dashboard/Charts';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
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
    <div data-testid="dashboard-page" className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="Mission Control"
        description="Real-time logistics overview and operations."
      >
        <Button data-testid="dashboard-refresh-button" variant="ghost" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button data-testid="dashboard-download-button" variant="secondary" onClick={() => { import('sonner').then(({ toast }) => toast.info('Report download coming soon — export is planned for the next release.')); }}>
          <span className="hidden sm:inline">Download Report</span>
          <span className="sm:hidden">Report</span>
        </Button>
      </PageHeader>

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
