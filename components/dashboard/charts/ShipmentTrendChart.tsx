import React, { useState, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../ui/chart';
import { ChartSkeleton } from '../../ui/skeleton';
import { useShipments } from '../../../hooks/useShipments';
import { format, subDays, startOfDay } from 'date-fns';
import { DEFAULT_DASHBOARD_TIME_RANGE, type DashboardTimeRange } from '../../../lib/constants';

const chartConfig = {
  inbound: {
    label: 'Inbound',
    color: 'var(--chart-1)',
  },
  outbound: {
    label: 'Outbound',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export const ShipmentTrendChart: React.FC<{ isLoading?: boolean }> = ({
  isLoading: externalLoading,
}) => {
  const [timeRange, setTimeRange] = useState(DEFAULT_DASHBOARD_TIME_RANGE);
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments({ limit: 1000 });

  const handleTimeRangeChange = (value: string) => {
    if (value === '7d' || value === '30d' || value === '90d') {
      setTimeRange(value as DashboardTimeRange);
      return;
    }
    setTimeRange(DEFAULT_DASHBOARD_TIME_RANGE);
  };

  const isLoading = externalLoading || shipmentsLoading;

  const trendChartData = useMemo(() => {
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
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shipments, timeRange]);

  if (isLoading) return <ChartSkeleton />;

  const header = (
    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
      <div className="grid flex-1 gap-1">
        <CardTitle className="flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full shadow-neon"></span>
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
          <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
          <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
          <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
  );

  if (trendChartData.every((d) => d.inbound === 0 && d.outbound === 0)) {
    return (
      <Card className="pt-0 h-full">
        {header}
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No shipments for selected period</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create shipments to see volume trends
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0 h-full">
      {header}
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={trendChartData}>
            <defs>
              <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-inbound)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-inbound)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-outbound)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-outbound)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="outbound"
              type="natural"
              fill="url(#fillOutbound)"
              stroke="var(--color-outbound)"
              stackId="a"
            />
            <Area
              dataKey="inbound"
              type="natural"
              fill="url(#fillInbound)"
              stroke="var(--color-inbound)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
