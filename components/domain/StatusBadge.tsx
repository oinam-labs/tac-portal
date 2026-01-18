import React from 'react'
import { cn } from '@/lib/utils'
import { ShipmentStatus, ManifestStatus, InvoiceStatus, ExceptionSeverity } from '@/types'

type StatusType = ShipmentStatus | ManifestStatus | InvoiceStatus | ExceptionSeverity | string

interface StatusBadgeProps {
  status: StatusType
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showDot?: boolean
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  // Shipment Statuses
  CREATED: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  PICKED_UP: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  RECEIVED_AT_ORIGIN_HUB: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  LOADED_FOR_LINEHAUL: { bg: 'bg-violet-500/20', text: 'text-violet-400', dot: 'bg-violet-400' },
  IN_TRANSIT_TO_DESTINATION: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  RECEIVED_AT_DEST_HUB: { bg: 'bg-teal-500/20', text: 'text-teal-400', dot: 'bg-teal-400' },
  OUT_FOR_DELIVERY: { bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
  DELIVERED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  RETURNED: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
  CANCELLED: { bg: 'bg-slate-600/20', text: 'text-slate-500', dot: 'bg-slate-500' },
  DAMAGED: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  EXCEPTION_RAISED: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  EXCEPTION_RESOLVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  
  // Manifest Statuses
  OPEN: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  CLOSED: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  DEPARTED: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400 animate-pulse' },
  ARRIVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  
  // Invoice Statuses
  DRAFT: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
  ISSUED: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  PAID: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  OVERDUE: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  
  // Exception Severities
  LOW: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
  MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  
  // Default
  DEFAULT: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function StatusBadge({ status, size = 'md', className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT
  const displayText = status.replace(/_/g, ' ')

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-medium",
      config.bg,
      config.text,
      SIZE_CLASSES[size],
      className
    )}>
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      )}
      <span className="capitalize">{displayText.toLowerCase()}</span>
    </span>
  )
}
