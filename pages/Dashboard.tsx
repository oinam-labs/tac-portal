import React from 'react';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { DashboardCharts } from '../components/dashboard/Charts';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { RefreshCw } from 'lucide-react';
import { QuickActions } from '../components/dashboard/QuickActions';

import { RecentActivity } from '../components/dashboard/RecentActivity';
import { RecentBookings } from '../components/dashboard/RecentBookings';

import { ErrorBoundary, InlineError } from '../components/ui/error-boundary';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { useRealtimeDashboard } from '../hooks/useRealtime';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Enable realtime subscriptions for live dashboard updates
  useRealtimeDashboard();

  // Global refresh handler — invalidate all data powering dashboard components
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.manifests.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.exceptions.all });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  // Data for Report Generation
  // Removed top-level hooks to prevent fetching all data on mount (performance optimization)

  const handleDownloadReport = async () => {
    try {
      const { toast } = await import('sonner');
      const { supabase } = await import('../lib/supabase');
      toast.info('Generating report...');

      // Fetch all data on-demand
      const [shipmentsResult, invoicesResult] = await Promise.all([
        supabase
          .from('shipments')
          .select(
            `
            *,
            customer:customers(name, phone),
            origin_hub:hubs!origin_hub_id(code, name),
            destination_hub:hubs!destination_hub_id(code, name)
          `
          )
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select(
            `
            *,
            customer:customers(name, phone, email),
            shipment:shipments(awb_number)
          `
          )
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
      ]);

      if (shipmentsResult.error) throw shipmentsResult.error;
      if (invoicesResult.error) throw invoicesResult.error;

      const shipments = (shipmentsResult.data || []) as unknown as any[];
      const invoices = (invoicesResult.data || []) as unknown as any[];

      const { generateDashboardReport } = await import('../lib/dashboard-report-generator');

      // Calculate Inventory (Approximate logic from Inventory.tsx)
      const inventoryCount = shipments.filter((s: any) =>
        ['RECEIVED_AT_ORIGIN', 'RECEIVED_AT_DEST', 'EXCEPTION'].includes(s.status)
      ).length;

      generateDashboardReport({
        shipments,
        invoices,
        inventoryCount,
      });

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to generate report');
    }
  };

  return (
    <div data-testid="dashboard-page" className="space-y-8 animate-[fadeIn_0.2s_ease-out] pb-8">
      <PageHeader
        title="Mission Control"
        description="Real-time logistics overview and operations."
      >
        <Button data-testid="dashboard-refresh-button" variant="ghost" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button
          data-testid="dashboard-download-button"
          variant="secondary"
          onClick={handleDownloadReport}
        >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <ErrorBoundary fallback={<InlineError message="Failed to load recent activity" />}>
          <RecentActivity />
        </ErrorBoundary>

        {/* Recent Bookings */}
        <ErrorBoundary fallback={<InlineError message="Failed to load recent bookings" />}>
          <RecentBookings />
        </ErrorBoundary>
      </div>
    </div>
  );
};
