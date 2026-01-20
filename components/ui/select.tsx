import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error("Select components must be used within a Select")
    }
    return context
}

interface SelectProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    children,
}) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

    const handleValueChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setUncontrolledValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <SelectContext.Provider
            value={{ value, onValueChange: handleValueChange, open, setOpen }}
        >
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelectContext()

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
            </button>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
    placeholder?: string
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    const { value } = useSelectContext()
    return <span>{value || placeholder}</span>
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelectContext()
        const contentRef = React.useRef<HTMLDivElement>(null)

        // Merge forwarded ref with internal ref
        const mergedRef = React.useCallback(
            (node: HTMLDivElement | null) => {
                contentRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            },
            [ref]
        )

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                    setOpen(false)
                }
            }

            if (open) {
                document.addEventListener("mousedown", handleClickOutside)
            }

            return () => {
                document.removeEventListener("mousedown", handleClickOutside)
            }
        }, [open, setOpen])

        if (!open) return null

        return (
            <div
                ref={mergedRef}
                className={cn(
                    "absolute top-full left-0 z-50 mt-1 min-w-[8rem] w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                    className
                )}
                {...props}
            >
                <div className="p-1">{children}</div>
            </div>
        )
    }
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
    children: React.ReactNode
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, ...props }, ref) => {
        const { value: selectedValue, onValueChange, setOpen } = useSelectContext()
        const isSelected = selectedValue === value

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                    onValueChange(value)
                    setOpen(false)
                }}
                className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground",
                    className
                )}
                {...props}
            >
                <span className="flex-1">{children}</span>
                {isSelected && <Check className="h-4 w-4 text-foreground" />}
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
