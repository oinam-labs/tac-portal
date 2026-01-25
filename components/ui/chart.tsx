import * as React from 'react';
import { cn } from '@/lib/utils';

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          'flex aspect-video justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border",
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-muted-foreground',
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-layer]:outline-none',
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          '[&_.recharts-radial-bar-background-sector]:fill-muted',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-sector]:outline-none',
          '[&_.recharts-surface]:outline-none',
          "dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border",
          'dark:[&_.recharts-radial-bar-background-sector]:fill-muted',
          'dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          "dark:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          className
        )}
        style={
          {
            '--color-desktop': config.desktop?.color || 'var(--chart-1)',
            '--color-mobile': config.mobile?.color || 'var(--chart-2)',
            '--color-inbound': config.inbound?.color || 'var(--chart-1)',
            '--color-outbound': config.outbound?.color || 'var(--chart-2)',
            '--color-delivered': config.delivered?.color || 'var(--chart-1)',
            '--color-delayed': config.delayed?.color || 'var(--chart-2)',
            '--color-exceptions': config.exceptions?.color || 'var(--chart-3)',
            '--color-onTrack': config.onTrack?.color || 'var(--chart-4)',
            '--color-chrome': config.chrome?.color || 'var(--chart-1)',
            '--color-safari': config.safari?.color || 'var(--chart-2)',
            '--color-firefox': config.firefox?.color || 'var(--chart-3)',
            '--color-edge': config.edge?.color || 'var(--chart-4)',
            '--color-other': config.other?.color || 'var(--chart-5)',
            '--color-inTransit': config.inTransit?.color || 'var(--chart-1)',
            '--color-pending': config.pending?.color || 'var(--chart-3)',
            '--color-exception': config.exception?.color || 'var(--chart-4)',
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'ChartContainer';

const ChartTooltip = ({
  cursor = true,
  content,
  ...props
}: React.ComponentProps<typeof import('recharts').Tooltip> & { content?: React.ReactNode }) => {
  const Tooltip = require('recharts').Tooltip;
  return <Tooltip cursor={cursor} content={content} {...props} />;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      dataKey: string;
      payload: Record<string, unknown>;
      color?: string;
      fill?: string;
    }>;
    label?: string;
    labelFormatter?: (label: string) => React.ReactNode;
    indicator?: 'line' | 'dot' | 'dashed';
    hideLabel?: boolean;
    nameKey?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      label,
      labelFormatter,
      nameKey,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!hideLabel && (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(label || '') : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = nameKey || item.dataKey || item.name;
            const itemConfig = config[key as keyof typeof config];
            const indicatorColor = item.fill || item.color || itemConfig?.color;

            return (
              <div key={index} className="flex w-full flex-wrap items-center gap-2">
                {indicator === 'dot' && (
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                {indicator === 'line' && (
                  <div className="h-0.5 w-4 shrink-0" style={{ backgroundColor: indicatorColor }} />
                )}
                {indicator === 'dashed' && (
                  <div
                    className="h-0.5 w-4 shrink-0 border-t-2 border-dashed"
                    style={{ borderColor: indicatorColor }}
                  />
                )}
                <div className="flex flex-1 justify-between gap-2 leading-none">
                  <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                  <span className="font-mono font-medium text-foreground">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegend = ({
  content,
  ...props
}: React.ComponentProps<typeof import('recharts').Legend> & { content?: React.ReactNode }) => {
  const Legend = require('recharts').Legend;
  return <Legend content={content} {...props} />;
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    payload?: Array<{
      value: string;
      dataKey?: string;
      color?: string;
    }>;
  }
>(({ className, payload }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-4 pt-3', className)}>
      {payload.map((item) => {
        const key = item.dataKey || item.value;
        const itemConfig = config[key as keyof typeof config];

        return (
          <div key={item.value} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color || itemConfig?.color }}
            />
            <span className="text-muted-foreground">{itemConfig?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = 'ChartLegendContent';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
};
