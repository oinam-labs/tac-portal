
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { manifestFormSchema, type ManifestFormValues } from "@/lib/validators/manifest"
import { ManifestConfigPanel } from "./ManifestConfigPanel"
import { ManifestShipmentPanel } from "./ManifestShipmentPanel"
import { ManifestActionFooter } from "./ManifestActionFooter"
import { createManifest } from "@/lib/supabase/manifest"
import { toast } from "sonner"

export function CreateManifestModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const form = useForm<ManifestFormValues>({
        resolver: zodResolver(manifestFormSchema),
        defaultValues: {
            originHubId: "",
            destinationHubId: "",
            transportType: "AIR",
            flightNo: "",
            vehicleNo: "",
            driverName: "",
            rules: {
                onlyReady: true,
                matchDestination: true,
                excludeCod: false,
            },
            selectedShipmentIds: [],
        },
        mode: "onChange",
    })

    const [isSubmitting, setIsSubmitting] = React.useState(false)

    async function onSubmit(values: ManifestFormValues) {
        try {
            setIsSubmitting(true)

            await createManifest({
                originHubId: values.originHubId,
                destinationHubId: values.destinationHubId,
                transportType: values.transportType,
                flightNo: values.flightNo,
                flightDate: values.flightDate,
                vehicleNo: values.vehicleNo,
                driverName: values.driverName,
                shipmentIds: values.selectedShipmentIds,
            })

            toast.success("Manifest generated successfully")
            onOpenChange(false)
            form.reset()

            // Redirect or show success
            // window.location.href = `/manifests/${manifest.id}` 
            // Better to return or invoke callback if provided. 
            // For now we just close.

        } catch (e: any) {
            toast.error(e?.message ?? "Failed to generate manifest")
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                <div className="p-6 border-b shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">Create Manifest</DialogTitle>
                        <DialogDescription>
                            Generate an AIR or TRUCK manifest from available shipments.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 bg-muted/10">

                        {/* Left Panel: Configuration */}
                        <div className="lg:col-span-4 p-6 border-r overflow-y-auto">
                            <ManifestConfigPanel form={form} />
                        </div>

                        {/* Right Panel: Shipments */}
                        <div className="lg:col-span-8 p-6 overflow-hidden h-full">
                            <ManifestShipmentPanel form={form} />
                        </div>
                    </div>

                    <ManifestActionFooter form={form} isSubmitting={isSubmitting} />
                </form>
            </DialogContent>
        </Dialog>
    )
}
