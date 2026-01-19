
"use client"

import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import type { ManifestFormValues } from "@/lib/validators/manifest"

export function ManifestActionFooter({
    form,
    isSubmitting,
}: {
    form: UseFormReturn<ManifestFormValues>
    isSubmitting: boolean
}) {
    const selectedIds = form.watch("selectedShipmentIds")
    const values = form.watch()

    const canGenerate =
        !!values.originHubId &&
        !!values.destinationHubId &&
        selectedIds.length > 0 &&
        (values.transportType === "AIR" ? !!values.flightNo?.trim() : !!values.vehicleNo?.trim())

    return (
        <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur-md z-10">
            <div className="px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground mr-1">Summary:</span>
                            <Badge variant="outline" className="px-3 py-1">
                                {selectedIds.length} Shipments
                            </Badge>
                            {/* 
                   In a real app, we'd pass the full shipment objects or a calculated total 
                   prop to this component to show weight/pkg sum here.
                   For now, we just show count.
                */}
                        </div>

                        {!canGenerate ? (
                            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">
                                Select origin, destination, transport details & at least 1 shipment.
                            </span>
                        ) : null}
                    </div>

                    <div className="flex gap-2 justify-end w-full lg:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isSubmitting}
                        >
                            Reset
                        </Button>

                        <Button
                            type="submit"
                            disabled={!canGenerate || isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-semibold px-6"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : "Generate Manifest"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
