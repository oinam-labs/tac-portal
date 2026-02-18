import React, { useMemo } from 'react';
import { RadialBar, RadialBarChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../ui/chart';
import { ChartSkeleton } from '../../ui/skeleton';
import { useShipments } from '../../../hooks/useShipments';

const chartConfig = {
  count: {
    label: 'Shipments',
  },
  inTransit: {
    label: 'In Transit',
    color: 'var(--chart-1)',
  },
  delivered: {
    label: 'Delivered',
    color: 'var(--chart-2)',
  },
  pending: {
    label: 'Pending',
    color: 'var(--chart-3)',
  },
  exception: {
    label: 'Exception',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

export const StatusDistributionChart: React.FC<{ isLoading?: boolean }> = ({
  isLoading: externalLoading,
}) => {
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments({ limit: 1000 });
  const isLoading = externalLoading || shipmentsLoading;

  const statusChartData = useMemo(() => {
    const inTransit = shipments.filter((s) =>
      ['RECEIVED_AT_ORIGIN', 'IN_TRANSIT', 'RECEIVED_AT_DEST'].includes(s.status)
    ).length;
    const delivered = shipments.filter((s) => s.status === 'DELIVERED').length;
    const pending = shipments.filter((s) =>
      ['CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP'].includes(s.status)
    ).length;
    const exception = shipments.filter((s) => s.status === 'EXCEPTION').length;

    return [
      { status: 'inTransit', count: inTransit, fill: 'var(--color-inTransit)' },
      { status: 'delivered', count: delivered, fill: 'var(--color-delivered)' },
      { status: 'pending', count: pending, fill: 'var(--color-pending)' },
      { status: 'exception', count: exception, fill: 'var(--color-exception)' },
    ].filter((item) => item.count > 0);
  }, [shipments]);

  if (isLoading) return <ChartSkeleton />;

  const totalShipments = statusChartData.reduce((acc, curr) => acc + curr.count, 0);

  if (totalShipments === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <span className="w-1 h-6 bg-chart-5 rounded-full shadow-neon-purple"></span>
            Status Distribution
          </CardTitle>
          <CardDescription>Current shipment status breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No shipments yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first shipment to see status distribution
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <span className="w-1 h-6 bg-chart-5 rounded-full shadow-neon-purple"></span>
          Status Distribution
        </CardTitle>
        <CardDescription>Current shipment status breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart data={statusChartData} innerRadius={30} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="status" />}
            />
            <RadialBar dataKey="count" background />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-wrap justify-center gap-3">
          {statusChartData.map((item) => (
            <div key={item.status} className="flex items-center text-xs text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: item.fill }}
              />
              {item.status === 'inTransit'
                ? 'In Transit'
                : item.status === 'delivered'
                  ? 'Delivered'
                  : item.status === 'pending'
                    ? 'Pending'
                    : 'Exception'}
              <span className="ml-1 font-medium text-foreground">({item.count})</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 leading-none font-medium text-foreground mt-2">
          <TrendingUp className="h-4 w-4 text-status-success" /> Real-time status overview
        </div>
      </CardFooter>
    </Card>
  );
};
