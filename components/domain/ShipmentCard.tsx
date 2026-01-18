import { cn } from '@/lib/utils'
import { Shipment } from '@/types'
import { StatusBadge } from './StatusBadge'
import { format } from 'date-fns'
import {
  Package, Plane, Truck, Clock,
  ArrowRight, Weight, ChevronRight
} from 'lucide-react'

interface ShipmentCardProps {
  shipment: Shipment
  onClick?: () => void
  className?: string
  compact?: boolean
}

const MODE_ICONS = {
  AIR: Plane,
  TRUCK: Truck,
}

const HUB_DISPLAY = {
  IMPHAL: { code: 'IXB', name: 'Imphal' },
  NEW_DELHI: { code: 'DEL', name: 'New Delhi' },
}

export function ShipmentCard({ shipment, onClick, className, compact = false }: ShipmentCardProps) {
  const ModeIcon = MODE_ICONS[shipment.mode]
  const origin = HUB_DISPLAY[shipment.originHub]
  const dest = HUB_DISPLAY[shipment.destinationHub]

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-cyber-surface/50 hover:bg-cyber-surface hover:border-cyber-accent/30 transition-all cursor-pointer group",
          className
        )}
      >
        <div className="p-2 rounded-lg bg-cyber-accent/10">
          <Package className="w-4 h-4 text-cyber-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-sm">{shipment.awb}</span>
            <StatusBadge status={shipment.status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 truncate">{shipment.customerName}</p>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="font-medium">{origin.code}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-medium">{dest.code}</span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-accent transition-colors" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-cyber-card/80 backdrop-blur-sm p-5 transition-all hover:border-cyber-accent/30 hover:shadow-lg hover:shadow-cyber-accent/5 cursor-pointer group",
        className
      )}
    >
      {/* Mode indicator strip */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        shipment.mode === 'AIR' ? 'bg-cyan-500' : 'bg-amber-500'
      )} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-lg",
            shipment.mode === 'AIR' ? 'bg-cyan-500/10' : 'bg-amber-500/10'
          )}>
            <ModeIcon className={cn(
              "w-5 h-5",
              shipment.mode === 'AIR' ? 'text-cyan-400' : 'text-amber-400'
            )} />
          </div>
          <div>
            <h3 className="font-mono font-bold text-white text-lg tracking-wide">
              {shipment.awb}
            </h3>
            <p className="text-sm text-slate-400">{shipment.customerName}</p>
          </div>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Route */}
      <div className="flex items-center justify-between bg-cyber-surface/50 rounded-lg p-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{origin.code}</p>
          <p className="text-xs text-slate-500">{origin.name}</p>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-slate-600 to-transparent" />
          <ModeIcon className="w-4 h-4 text-slate-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-slate-600 to-transparent" />
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">{dest.code}</p>
          <p className="text-xs text-slate-500">{dest.name}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">
            {shipment.totalPackageCount} {shipment.totalPackageCount === 1 ? 'pkg' : 'pkgs'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Weight className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">{shipment.totalWeight.chargeable} kg</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">
            {format(new Date(shipment.createdAt), 'dd MMM')}
          </span>
        </div>
      </div>

      {/* Service Level Badge */}
      <div className="absolute top-4 right-4">
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded",
          shipment.serviceLevel === 'EXPRESS'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-slate-500/20 text-slate-400'
        )}>
          {shipment.serviceLevel}
        </span>
      </div>
    </div>
  )
}
