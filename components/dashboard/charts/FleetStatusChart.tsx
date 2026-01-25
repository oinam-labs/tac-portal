import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/card';
import { ChartSkeleton } from '../../ui/skeleton';
import { useManifests } from '../../../hooks/useManifests';
import { CHART_COLORS } from '../../../lib/design-tokens';

export const FleetStatusChart: React.FC<{ isLoading?: boolean }> = ({ isLoading: externalLoading }) => {
  const { data: manifests = [], isLoading: manifestsLoading } = useManifests();
  const isLoading = externalLoading || manifestsLoading;

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
      .map(([route, counts]) => ({
        route,
        ...counts,
      }))
      .sort((a, b) => (b.active + b.idle) - (a.active + a.idle))
      .slice(0, 5);
  }, [manifests]);

  if (isLoading) return <ChartSkeleton height={200} />;

  if (fleetChartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-1 h-6 bg-cyber-success rounded-full"></span>
            Current Fleet Status
          </CardTitle>
          <CardDescription>Active vs idle fleet by route</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No manifests created</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first manifest to track fleet status</p>
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-1 h-6 bg-cyber-success rounded-full"></span>
          Current Fleet Status
        </CardTitle>
        <CardDescription>Active vs idle fleet by route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetChartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="route"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="active" name="Active" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="idle" name="Idle" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing top {fleetChartData.length} routes by manifest count
        </div>
      </CardFooter>
    </Card>
  );
};
