import React, { useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import { KPICard } from '../components/domain/KPICard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useShipments } from '../hooks/useShipments';
import { useExceptions } from '../hooks/useExceptions';
import { format, subMonths, isSameMonth } from 'date-fns';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { CHART_COLORS } from '../lib/design-tokens';

export const Analytics: React.FC = () => {
  // Use Supabase hooks instead of mock-db
  const { data: shipments = [] } = useShipments();
  const { data: exceptions = [] } = useExceptions();

  // Calculate Dynamic Data
  const { volumeData, efficiencyData } = useMemo(() => {
    // 1. Volume Data (Last 6 Months)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { date: d, label: format(d, 'MMM') };
    });

    const vData = last6Months.map((month) => {
      const monthShipments = shipments.filter((s) =>
        isSameMonth(new Date(s.created_at), month.date)
      );
      const outbound = monthShipments.length;
      const inbound = monthShipments.filter((s) => ['DELIVERED', 'RECEIVED_AT_DEST_HUB'].includes(s.status)).length;

      return {
        month: month.label,
        outbound,
        inbound,
      };
    });

    // 2. Efficiency / Performance Status
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
    const delayed = shipments.filter((s) => {
      if (s.status === 'DELIVERED') return false;
      // Check if shipment is overdue (created more than 7 days ago and not delivered)
      const createdDate = new Date(s.created_at);
      return new Date().getTime() - createdDate.getTime() > 7 * 24 * 60 * 60 * 1000;
    }).length;
    const withException = exceptions.length;

    const eData = [
      { name: 'Delivered', value: delivered, key: 'delivered' },
      { name: 'Delayed', value: delayed, key: 'delayed' },
      { name: 'Exceptions', value: withException, key: 'exceptions' },
      {
        name: 'On Track',
        value: Math.max(0, total - delivered - delayed - withException),
        key: 'onTrack',
      },
    ];

    return { volumeData: vData, efficiencyData: eData };
  }, [shipments, exceptions]);

  // Tooltip styles
  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    color: 'var(--popover-foreground)',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-2xl font-bold text-foreground mb-6">Operations Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart with Legend - Shipment Volume (In/Out) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-1 h-6 bg-cyber-neon rounded-full shadow-neon"></span>
              Shipment Volume (In/Out)
            </CardTitle>
            <CardDescription>Showing total shipments for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ left: 12, right: 12 }}>
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area
                    dataKey="inbound"
                    name="Inbound (Arrived)"
                    type="monotone"
                    fill="url(#colorInbound)"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="outbound"
                    name="Outbound (Created)"
                    type="monotone"
                    fill="url(#colorOutbound)"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    stackId="a"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  {format(subMonths(new Date(), 5), 'MMMM')} - {format(new Date(), 'MMMM yyyy')}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Bar Chart - Current Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-1 h-6 bg-cyber-purple rounded-full shadow-neon-purple"></span>
              Current Fleet Status
            </CardTitle>
            <CardDescription>Shipment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="value"
                    name="Shipments"
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">Comparing to previous period</div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Volume (6M)"
          value={volumeData.reduce((a, b) => a + b.outbound, 0)}
          icon={<Package className="w-5 h-5" />}
        />
        <KPICard
          title="Delivery Rate"
          value={shipments.length > 0 ? `${((shipments.filter((s) => s.status === 'DELIVERED').length / shipments.length) * 100).toFixed(1)}%` : '0.0%'}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          title="Delivered"
          value={efficiencyData.find((d) => d.name === 'Delivered')?.value || 0}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <KPICard
          title="Active Exceptions"
          value={efficiencyData.find((d) => d.name === 'Exceptions')?.value || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};
