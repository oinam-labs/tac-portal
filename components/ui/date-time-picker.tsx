"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    minDate?: Date
    maxDate?: Date
    className?: string
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Pick a date",
    disabled = false,
    minDate,
    maxDate,
    className,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    disabled={(date) => {
                        if (minDate && date < minDate) return true
                        if (maxDate && date > maxDate) return true
                        return false
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

interface TimePickerProps {
    value?: string
    onChange?: (time: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    disabled = false,
    className,
}: TimePickerProps) {
    return (
        <div className={cn("relative", className)}>
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="time"
                value={value || ""}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="pl-9 font-mono"
            />
        </div>
    )
}

interface DateTimePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    minDate?: Date
    maxDate?: Date
    showTime?: boolean
    className?: string
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Pick date and time",
    disabled = false,
    minDate,
    maxDate,
    showTime = true,
    className,
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange?.(undefined)
            return
        }
        // Preserve existing time if value exists
        if (value) {
            date.setHours(value.getHours(), value.getMinutes(), 0, 0)
        }
        onChange?.(date)
    }

    const handleTimeChange = (timeStr: string) => {
        if (!timeStr) return
        const [hours, minutes] = timeStr.split(':').map(Number)
        const newDate = value ? new Date(value) : new Date()
        newDate.setHours(hours, minutes, 0, 0)
        onChange?.(newDate)
    }

    const timeValue = value
        ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`
        : ""

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? (
                        showTime ? format(value, "PPP 'at' p") : format(value, "PPP")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                        if (minDate && date < minDate) return true
                        if (maxDate && date > maxDate) return true
                        return false
                    }}
                    initialFocus
                />
                {showTime && (
                    <div className="border-t p-3 space-y-2">
                        <Label className="text-xs text-muted-foreground">Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="time"
                                value={timeValue}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="pl-9 font-mono"
                            />
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

interface DateRangePickerProps {
    startDate?: Date
    endDate?: Date
    onStartDateChange?: (date: Date | undefined) => void
    onEndDateChange?: (date: Date | undefined) => void
    startPlaceholder?: string
    endPlaceholder?: string
    disabled?: boolean
    className?: string
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    startPlaceholder = "Start date",
    endPlaceholder = "End date",
    disabled = false,
    className,
}: DateRangePickerProps) {
    return (
        <div className={cn("flex gap-2", className)}>
            <DatePicker
                value={startDate}
                onChange={onStartDateChange}
                placeholder={startPlaceholder}
                disabled={disabled}
                maxDate={endDate}
                className="flex-1"
            />
            <DatePicker
                value={endDate}
                onChange={onEndDateChange}
                placeholder={endPlaceholder}
                disabled={disabled}
                minDate={startDate}
                className="flex-1"
            />
        </div>
    )
}

export default DateTimePicker
