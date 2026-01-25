import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ChartSkeleton } from '../../ui/skeleton';
import { useShipments } from '../../../hooks/useShipments';
import { format, subDays, startOfDay } from 'date-fns';
import { CHART_COLORS } from '../../../lib/design-tokens';
import { DEFAULT_DASHBOARD_TIME_RANGE, type DashboardTimeRange } from '../../../lib/constants';

export const ShipmentTrendChart: React.FC<{ isLoading?: boolean }> = ({ isLoading: externalLoading }) => {
  const [timeRange, setTimeRange] = useState(DEFAULT_DASHBOARD_TIME_RANGE);
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments();

  const handleTimeRangeChange = (value: string) => {
    if (value === '7d' || value === '30d' || value === '90d') {
      setTimeRange(value as DashboardTimeRange);
      return;
    }

    setTimeRange(DEFAULT_DASHBOARD_TIME_RANGE);
  };

  const isLoading = externalLoading || shipmentsLoading;

  const trendChartData = useMemo(() => {
    if (!shipments.length) return [];

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dateMap = new Map<string, { inbound: number; outbound: number }>();

    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
      dateMap.set(date, { inbound: 0, outbound: 0 });
    }

    shipments.forEach((shipment) => {
      const createdDate = format(startOfDay(new Date(shipment.created_at)), 'yyyy-MM-dd');
      const existing = dateMap.get(createdDate);
      if (existing) {
        if (shipment.origin_hub?.code === 'IMF') {
          existing.outbound += 1;
        } else if (shipment.destination_hub?.code === 'IMF') {
          existing.inbound += 1;
        }
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shipments, timeRange]);

  if (isLoading) return <ChartSkeleton />;

  const filteredData = trendChartData;

  if (filteredData.length === 0) {
    return (
      <Card className="pt-0 h-full">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b border-cyber-border py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="flex items-center gap-2">
              <span className="w-1 h-6 bg-cyber-neon rounded-full shadow-neon"></span>
              Shipment Volume Trend
            </CardTitle>
            <CardDescription>Showing inbound vs outbound shipments</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No shipments for selected period</p>
              <p className="text-sm text-muted-foreground mt-1">Create shipments to see volume trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tooltip styles
  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    color: 'var(--popover-foreground)',
    borderRadius: '8px',
  };

  return (
    <Card className="pt-0 h-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-cyber-border py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="flex items-center gap-2">
            <span className="w-1 h-6 bg-cyber-neon rounded-full shadow-neon"></span>
            Shipment Volume Trend
          </CardTitle>
          <CardDescription>Showing inbound vs outbound shipments</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area
                dataKey="outbound"
                name="Outbound"
                type="monotone"
                fill="url(#fillOutbound)"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="inbound"
                name="Inbound"
                type="monotone"
                fill="url(#fillInbound)"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
