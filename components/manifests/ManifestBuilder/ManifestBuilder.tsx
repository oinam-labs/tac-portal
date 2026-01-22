"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useManifestBuilder } from "@/hooks/useManifestBuilder"
import { useStaff } from "@/hooks/useStaff"
import type { CreateManifestParams, ManifestStatus } from "@/lib/services/manifestService"
import type { HubOption, ManifestBuilderPhase, ManifestRules } from "./manifest-builder.types"
import { ManifestSettingsForm } from "./ManifestSettingsForm"
import { ManifestScanPanel } from "./ManifestScanPanel"
import { ManifestShipmentsTable } from "./ManifestShipmentsTable"
import { ManifestSummaryBar } from "./ManifestSummaryBar"

interface ManifestBuilderProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete?: (manifestId: string) => void
    initialManifestId?: string | null
}

/**
 * Fetches the list of active hubs (id, code, name) ordered by name.
 *
 * @returns The React Query result whose `data` is an array of hub options (`id`, `code`, `name`) for hubs where `is_active` is true.
 */
function useHubs() {
    return useQuery({
        queryKey: ['hubs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('hubs')
                .select('id, code, name')
                .eq('is_active', true)
                .order('name')
            if (error) throw error
            return (data ?? []) as HubOption[]
        },
    })
}

/**
 * Renders a modal dialog that guides creating and building a shipment manifest through a settings phase and a scan/build phase.
 *
 * The component manages manifest creation, scanning/adding shipments, removal, and final closure; it fetches hubs and staff, applies validation rules, and shows a summary bar when building.
 *
 * @param open - Whether the dialog is visible
 * @param onOpenChange - Called when the dialog visibility should change; receives the new open state
 * @param onComplete - Optional callback invoked with the manifest ID after a manifest is successfully closed
 * @param initialManifestId - Optional manifest ID to start the component in the build (scan) phase for an existing manifest
 * @returns The rendered manifest builder dialog element
 */
export function ManifestBuilder({ open, onOpenChange, onComplete, initialManifestId }: ManifestBuilderProps) {
    const navigate = useNavigate()
    const [phase, setPhase] = React.useState<ManifestBuilderPhase>(initialManifestId ? 'build' : 'settings')
    const [manifestId, setManifestId] = React.useState<string | null>(initialManifestId || null)
    const [rules, setRules] = React.useState<ManifestRules>({
        onlyReady: true,
        matchDestination: true,
        excludeCod: false,
    })

    const { data: hubs = [] } = useHubs()
    const { data: staffList = [] } = useStaff()

    const currentStaff = staffList.find((s) => s.is_active) || null

    const builder = useManifestBuilder({
        manifestId: manifestId || undefined,
        validateDestination: rules.matchDestination,
        validateStatus: rules.onlyReady,
        onManifestCreated: (manifest) => {
            setManifestId(manifest.id)
            setPhase('build')
        },
    })

    React.useEffect(() => {
        if (!open) {
            setPhase('settings')
            setManifestId(null)
        }
    }, [open])

    const handleCreate = async (params: CreateManifestParams & { rules: ManifestRules }) => {
        setRules(params.rules)
        await builder.createManifest({
            ...params,
            status: 'BUILDING' as ManifestStatus,
            createdByStaffId: currentStaff?.id,
        })
    }

    const handleClose = async () => {
        if (!manifestId) return
        await builder.closeManifest(currentStaff?.id)
        onComplete?.(manifestId)
        onOpenChange(false)
    }

    const handleRemove = async (shipmentId: string) => {
        await builder.removeShipment(shipmentId, currentStaff?.id)
    }

    const handleViewShipment = (shipmentId: string) => {
        navigate(`/shipments/${shipmentId}`)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && phase === 'build' && builder.items.length > 0) {
            if (window.confirm('You have items in this manifest. Are you sure you want to close?')) {
                onOpenChange(false)
            }
        } else {
            onOpenChange(newOpen)
        }
    }

    const summaryTotals = {
        shipments: builder.totals.shipments,
        packages: builder.totals.packages,
        weight: builder.totals.weight,
        codAmount: builder.totals.codAmount,
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                <div className="p-6 border-b shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {phase === 'build' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPhase('settings')}
                                        className="h-8 w-8"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                                        {phase === 'settings' ? 'Build Manifest' : 'Scan Manifest'}
                                        {builder.manifest && (
                                            <Badge variant="outline" className="font-mono text-sm">
                                                {builder.manifest.manifest_no}
                                            </Badge>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {phase === 'settings'
                                            ? 'Configure manifest settings and transport details'
                                            : 'Scan AWB barcodes to add shipments to this manifest'}
                                    </DialogDescription>
                                </div>
                            </div>
                            {builder.isUpdatingStatus && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden">
                    {phase === 'settings' ? (
                        <div className="h-full flex items-start justify-center p-8 overflow-y-auto">
                            <div className="w-full max-w-2xl">
                                <ManifestSettingsForm
                                    hubs={hubs}
                                    onSubmit={handleCreate}
                                    isSubmitting={builder.isCreating}
                                    className="h-auto"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
                            <div className="lg:col-span-4 p-6 border-r overflow-y-auto space-y-6">
                                <ManifestScanPanel
                                    manifestId={manifestId!}
                                    staffId={currentStaff?.id}
                                    validateDestination={rules.matchDestination}
                                    validateStatus={rules.onlyReady}
                                    disabled={!builder.isEditable}
                                    onItemsChanged={builder.refetch}
                                />

                                {builder.manifest && (
                                    <div className="rounded-xl border p-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                                            Manifest Details
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Route:</span>
                                                <span className="font-medium">
                                                    {builder.manifest.from_hub?.code} → {builder.manifest.to_hub?.code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="font-medium">{builder.manifest.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Badge variant="secondary">{builder.manifest.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-xl border p-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Active Rules</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {rules.onlyReady && (
                                            <Badge variant="outline" className="text-xs">
                                                Only READY
                                            </Badge>
                                        )}
                                        {rules.matchDestination && (
                                            <Badge variant="outline" className="text-xs">
                                                Match Destination
                                            </Badge>
                                        )}
                                        {rules.excludeCod && (
                                            <Badge variant="outline" className="text-xs">
                                                Exclude COD
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 p-6 overflow-hidden h-full flex flex-col">
                                <ManifestShipmentsTable
                                    items={builder.items}
                                    isLoading={builder.isLoading}
                                    isEditable={builder.isEditable}
                                    onRemove={handleRemove}
                                    onViewShipment={handleViewShipment}
                                    showSummary={false}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {phase === 'build' && (
                    <ManifestSummaryBar
                        totals={summaryTotals}
                        status={builder.manifest?.status}
                        disableClose={builder.items.length === 0 || builder.isUpdatingStatus}
                        isClosing={builder.isUpdatingStatus}
                        onClose={handleClose}
                        className="sticky bottom-0"
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ManifestBuilder