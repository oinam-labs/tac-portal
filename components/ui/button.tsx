import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-cyber-accent text-slate-900 hover:bg-cyber-accent/90 shadow-md shadow-cyber-accent/20",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
        outline: "border border-cyber-accent/50 bg-transparent text-cyber-accent hover:bg-cyber-accent/10",
        secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600",
        ghost: "text-slate-400 hover:text-cyber-accent hover:bg-cyber-accent/10",
        link: "text-cyber-accent underline-offset-4 hover:underline",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
