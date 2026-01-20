import React from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { TrackingEvent, HubLocation } from '@/types'
import {
  Package, Truck, MapPin, CheckCircle, AlertTriangle,
  ArrowRight, Clock, Building2
} from 'lucide-react'

interface TrackingTimelineProps {
  events: TrackingEvent[]
  className?: string
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: Package,
  PICKED_UP: Truck,
  RECEIVED_AT_ORIGIN_HUB: Building2,
  LOADED_FOR_LINEHAUL: ArrowRight,
  IN_TRANSIT_TO_DESTINATION: Truck,
  RECEIVED_AT_DEST_HUB: Building2,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
  EXCEPTION_RAISED: AlertTriangle,
  EXCEPTION_RESOLVED: CheckCircle,
  DEFAULT: Clock,
}

/**
 * Event colors using semantic status tokens from globals.css
 * These reference CSS custom properties for consistent theming
 */
const EVENT_COLORS: Record<string, string> = {
  CREATED: 'bg-[oklch(var(--status-created-bg))]',
  PICKED_UP: 'bg-[oklch(var(--status-manifested-bg))]',
  RECEIVED_AT_ORIGIN_HUB: 'bg-[oklch(var(--status-manifested-bg))]',
  LOADED_FOR_LINEHAUL: 'bg-[oklch(var(--status-in-transit-bg))]',
  IN_TRANSIT_TO_DESTINATION: 'bg-[oklch(var(--status-in-transit-bg))]',
  RECEIVED_AT_DEST_HUB: 'bg-[oklch(var(--status-arrived-bg))]',
  OUT_FOR_DELIVERY: 'bg-[oklch(var(--status-in-transit-bg))]',
  DELIVERED: 'bg-[oklch(var(--status-delivered-bg))]',
  EXCEPTION_RAISED: 'bg-[oklch(var(--status-exception-bg))]',
  EXCEPTION_RESOLVED: 'bg-[oklch(var(--status-delivered-bg))]',
  DEFAULT: 'bg-muted',
}

const HUB_NAMES: Record<HubLocation, string> = {
  IMPHAL: 'Imphal Hub',
  NEW_DELHI: 'New Delhi Hub',
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className={cn("space-y-0", className)}>
      {sortedEvents.map((event, index) => {
        const Icon = EVENT_ICONS[event.eventCode] || EVENT_ICONS.DEFAULT
        const color = EVENT_COLORS[event.eventCode] || EVENT_COLORS.DEFAULT
        const isFirst = index === 0
        const isLast = index === sortedEvents.length - 1

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 border-cyber-bg",
                color,
                isFirst && "ring-4 ring-opacity-30",
                isFirst && color.replace('bg-', 'ring-')
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-muted min-h-[40px]" />
              )}
            </div>

            {/* Event content */}
            <div className={cn(
              "flex-1 pb-8",
              isFirst && "pt-0",
              !isFirst && "pt-1"
            )}>
              <div className={cn(
                "rounded-lg p-4 transition-all",
                isFirst ? "bg-cyber-card border border-white/10" : "bg-transparent"
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={cn(
                      "font-semibold",
                      isFirst ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {event.description || event.eventCode.replace(/_/g, ' ')}
                    </p>
                    {event.hubId && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {HUB_NAMES[event.hubId]}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'dd MMM yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {format(new Date(event.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </div>

                {event.meta && Object.keys(event.meta).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-muted-foreground">
                      {JSON.stringify(event.meta)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
