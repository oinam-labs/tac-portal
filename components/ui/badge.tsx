import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-cyber-accent/20 text-cyber-accent",
        secondary: "border-transparent bg-slate-700 text-slate-300",
        destructive: "border-transparent bg-red-500/20 text-red-400",
        success: "border-transparent bg-emerald-500/20 text-emerald-400",
        warning: "border-transparent bg-amber-500/20 text-amber-400",
        outline: "border-cyber-accent/30 text-cyber-accent",
        // Status-specific variants
        created: "border-transparent bg-blue-500/20 text-blue-400",
        transit: "border-transparent bg-cyan-500/20 text-cyan-400",
        delivered: "border-transparent bg-emerald-500/20 text-emerald-400",
        exception: "border-transparent bg-red-500/20 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  className?: string
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
