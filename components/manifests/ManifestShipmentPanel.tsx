
"use client"
/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping requires any */

import * as React from "react"
import type { UseFormReturn } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ManifestFormValues } from "@/lib/validators/manifest"
import { fetchAvailableShipments } from "@/lib/supabase/manifest"
// import { toast } from "sonner" 
// Or use: import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Search, Truck, Package } from "lucide-react"

export function ManifestShipmentPanel({
    form,
}: {
    form: UseFormReturn<ManifestFormValues>
}) {
    const originHubId = form.watch("originHubId")
    const destinationHubId = form.watch("destinationHubId")
    const rules = form.watch("rules")
    const selectedIds = form.watch("selectedShipmentIds")

    const [shipments, setShipments] = React.useState<any[]>([]) // Using any for now to match API return
    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState("")

    async function loadShipments() {
        if (!originHubId) {
            setShipments([])
            return
        }
        try {
            setLoading(true)
            const data = await fetchAvailableShipments({
                originHubId,
                destinationHubId,
                onlyReady: rules.onlyReady,
                matchDestination: rules.matchDestination,
                excludeCod: rules.excludeCod,
            })
            setShipments(data || [])
        } catch (e: any) {
            //   toast.error(e?.message ?? "Failed to load shipments")
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadShipments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originHubId, destinationHubId, rules.onlyReady, rules.matchDestination, rules.excludeCod])

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return shipments
        return shipments.filter((s) => {
            return (
                s.awb_number.toLowerCase().includes(q) ||
                (s.consignee_name ?? "").toLowerCase().includes(q)
            )
        })
    }, [shipments, search])

    function toggleShipment(id: string) {
        const next = selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id]
        form.setValue("selectedShipmentIds", next, { shouldValidate: true })
    }

    function toggleAll() {
        const currentIds = filtered.map((s) => s.id)
        const allSelected = currentIds.every((id) => selectedIds.includes(id))
        const next = allSelected
            ? selectedIds.filter((id) => !currentIds.includes(id))
            : Array.from(new Set([...selectedIds, ...currentIds]))
        form.setValue("selectedShipmentIds", next, { shouldValidate: true })
    }

    const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id))

    return (
        <Card className="rounded-2xl h-full border-muted-foreground/20 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-4 py-4 px-6 border-b">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        Available Shipments
                        {originHubId && !loading && (
                            <Badge variant="secondary" className="text-xs font-normal">
                                {shipments.length} found
                            </Badge>
                        )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        {originHubId ? `Items at ${originHubId}` : "Select origin to view items"}
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="relative w-64 hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9 h-9 bg-background"
                            placeholder="Search AWB / Consignee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button size="icon" variant="ghost" onClick={loadShipments} disabled={!originHubId || loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                {originHubId && (
                    <div className="grid grid-cols-[40px_1.5fr_1fr_80px_80px_100px] items-center px-6 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 border-b">
                        <div className="flex justify-center">
                            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                        </div>
                        <div>AWB</div>
                        <div>Consignee</div>
                        <div className="text-right">Pkg</div>
                        <div className="text-right">Weight</div>
                        <div className="text-center">Status</div>
                    </div>
                )}

                <div className="overflow-y-auto flex-1">
                    {(!originHubId) ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                            <Truck className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select an Origin Hub to load available shipments.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                            <Package className="h-12 w-12 mb-4 opacity-20" />
                            <p>No shipments found matching your criteria.</p>
                        </div>
                    ) : (
                        filtered.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => toggleShipment(s.id)}
                                className={`grid grid-cols-[40px_1.5fr_1fr_80px_80px_100px] items-center px-6 py-3 border-b hover:bg-muted/40 transition cursor-pointer ${selectedIds.includes(s.id) ? "bg-primary/5" : ""}`}
                            >
                                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.includes(s.id)}
                                        onCheckedChange={() => toggleShipment(s.id)}
                                    />
                                </div>

                                <div className="space-y-0.5">
                                    <div className="font-medium text-sm font-mono">{s.awb_number}</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="text-xs truncate pr-2" title={s.consignee_name}>
                                    {s.consignee_name}
                                </div>

                                <div className="text-sm text-right font-mono">{s.package_count}</div>
                                <div className="text-sm text-right font-mono">{s.total_weight} <span className="text-[10px] text-muted-foreground">kg</span></div>

                                <div className="flex justify-center">
                                    <Badge variant={s.status === "RECEIVED" ? "default" : "secondary"} className="text-[10px] h-5">
                                        {s.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
