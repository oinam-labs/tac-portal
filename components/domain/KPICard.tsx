import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function KPICard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  className,
  subtitle,
}: KPICardProps) {
  const trendColor = {
    up: 'text-[oklch(var(--status-delivered-fg))]',
    down: 'text-[oklch(var(--status-exception-fg))]',
    neutral: 'text-muted-foreground',
  }[trend];

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[trend];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 bg-cyber-card/80 backdrop-blur-sm p-6 transition-all hover:border-cyber-accent/30 hover:shadow-lg hover:shadow-cyber-accent/5',
        className
      )}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyber-accent/10 to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {icon && <div className="p-3 rounded-lg bg-cyber-accent/10 text-cyber-accent">{icon}</div>}
      </div>

      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-4 text-sm', trendColor)}>
          <TrendIcon className="w-4 h-4" />
          <span className="font-medium">
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          <span className="text-muted-foreground text-xs ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}
