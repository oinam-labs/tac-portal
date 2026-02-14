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
          .select(`
            *,
            customer:customers(name, phone),
            origin_hub:hubs!origin_hub_id(code, name),
            destination_hub:hubs!destination_hub_id(code, name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select(`
            *,
            customer:customers(name, phone, email),
            shipment:shipments(awb_number)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
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
        inventoryCount
      });

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to generate report');
    }
  };

  return (
<<<<<<< HEAD
    <div data-testid="dashboard-page" className="space-y-8 animate-[fadeIn_0.2s_ease-out] pb-8">
      <PageHeader
        title="Mission Control"
        description="Real-time logistics overview and operations."
      >
        <Button data-testid="dashboard-refresh-button" variant="ghost" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button data-testid="dashboard-download-button" variant="secondary" onClick={handleDownloadReport}>
          <span className="hidden sm:inline">Download Report</span>
          <span className="sm:hidden">Report</span>
        </Button>
      </PageHeader>
=======
    <div data-testid="dashboard-page" className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 data-testid="dashboard-heading" className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Real-time logistics overview and operations.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button data-testid="dashboard-refresh-button" variant="ghost" onClick={refreshData} className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button data-testid="dashboard-download-button" variant="secondary" className="flex-1 sm:flex-none" onClick={() => { import('sonner').then(({ toast }) => toast.info('Report download coming soon — export is planned for the next release.')); }}>
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Report</span>
          </Button>
        </div>
      </div>
>>>>>>> origin/chore/full-project-review-feb-2026

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
