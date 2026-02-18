import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../ui/chart';
import { ChartSkeleton } from '../../ui/skeleton';
import { useManifests } from '../../../hooks/useManifests';

const chartConfig = {
  active: {
    label: 'Active',
    color: 'var(--chart-1)',
  },
  idle: {
    label: 'Idle',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export const FleetStatusChart: React.FC<{ isLoading?: boolean }> = ({
  isLoading: externalLoading,
}) => {
  const { data: manifests = [], isLoading: manifestsLoading } = useManifests();
  const isLoading = externalLoading || manifestsLoading;
  const [activeKey, setActiveKey] = useState<'active' | 'idle'>('active');

  const fleetChartData = useMemo(() => {
    const routeMap = new Map<string, { active: number; idle: number }>();

    manifests.forEach((manifest) => {
      const route = `${manifest.from_hub?.code || 'UNK'}-${manifest.to_hub?.code || 'UNK'}`;
      const existing = routeMap.get(route) || { active: 0, idle: 0 };

      if (manifest.status === 'CLOSED') {
        existing.idle += 1;
      } else {
        existing.active += 1;
      }

      routeMap.set(route, existing);
    });

    return Array.from(routeMap.entries())
      .map(([route, counts]) => ({ route, ...counts }))
      .sort((a, b) => b.active + b.idle - (a.active + a.idle))
      .slice(0, 5);
  }, [manifests]);

  const totals = useMemo(
    () => ({
      active: fleetChartData.reduce((acc, d) => acc + d.active, 0),
      idle: fleetChartData.reduce((acc, d) => acc + d.idle, 0),
    }),
    [fleetChartData]
  );

  if (isLoading) return <ChartSkeleton height={200} />;

  if (fleetChartData.length === 0) {
    return (
      <Card className="py-0 h-full">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <CardTitle className="flex items-center gap-2">
              <span className="w-1 h-6 bg-status-success rounded-full"></span>
              Current Fleet Status
            </CardTitle>
            <CardDescription>Active vs idle fleet by route</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No manifests created</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first manifest to track fleet status
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0 h-full">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="flex items-center gap-2">
            <span className="w-1 h-6 bg-status-success rounded-full"></span>
            Current Fleet Status
          </CardTitle>
          <CardDescription>Active vs idle fleet by route</CardDescription>
        </div>
        <div className="flex">
          {(['active', 'idle'] as const).map((key) => (
            <button
              key={key}
              data-active={activeKey === key}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveKey(key)}
            >
              <span className="text-muted-foreground text-xs">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {totals[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={fleetChartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="route"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="route"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Bar
              dataKey={activeKey}
              fill={`var(--color-${activeKey})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
