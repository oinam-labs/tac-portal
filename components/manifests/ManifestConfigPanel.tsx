"use client"

import type { UseFormReturn } from "react-hook-form"
import { motion, AnimatePresence } from "motion/react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox" // Fallback for Switch
import type { ManifestFormValues } from "@/lib/validators/manifest"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

export function ManifestConfigPanel({
    form,
}: {
    form: UseFormReturn<ManifestFormValues>
}) {
    const transportType = form.watch("transportType")
    const rules = form.watch("rules")

    return (
        <Card className="rounded-2xl h-full border-muted-foreground/20 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground font-semibold">
                    Route Settings
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Route */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Origin Hub</Label>
                        <Select
                            onValueChange={(val) => form.setValue("originHubId", val, { shouldValidate: true })}
                            defaultValue={form.watch("originHubId")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMPHAL">IMPHAL (IMF)</SelectItem>
                                <SelectItem value="NEW_DELHI">NEW DELHI (DEL)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Destination Hub</Label>
                        <Select
                            onValueChange={(val) => form.setValue("destinationHubId", val, { shouldValidate: true })}
                            defaultValue={form.watch("destinationHubId")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMPHAL">IMPHAL (IMF)</SelectItem>
                                <SelectItem value="NEW_DELHI">NEW DELHI (DEL)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                {/* Transport */}
                <div className="space-y-3">
                    <Label>Transport Type</Label>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                        <Button
                            type="button"
                            variant={transportType === "AIR" ? "default" : "ghost"}
                            className={`rounded-lg ${transportType === "AIR" ? "shadow-md" : "hover:bg-background/50"}`}
                            onClick={() => form.setValue("transportType", "AIR", { shouldValidate: true })}
                        >
                            ✈️ Air
                        </Button>
                        <Button
                            type="button"
                            variant={transportType === "TRUCK" ? "default" : "ghost"}
                            className={`rounded-lg ${transportType === "TRUCK" ? "shadow-md" : "hover:bg-background/50"}`}
                            onClick={() => form.setValue("transportType", "TRUCK", { shouldValidate: true })}
                        >
                            🚚 Truck
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {transportType === "AIR" ? (
                            <motion.div
                                key="air-fields"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                            >
                                <div className="space-y-2 pt-2">
                                    <Label>Flight No <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="bg-background"
                                        placeholder="Eg: 6E 6055"
                                        value={form.watch("flightNo") ?? ""}
                                        onChange={(e) => form.setValue("flightNo", e.target.value, { shouldValidate: true })}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="truck-fields"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                            >
                                <div className="space-y-3 pt-2">
                                    <div className="space-y-2">
                                        <Label>Vehicle No <span className="text-red-500">*</span></Label>
                                        <Input
                                            className="bg-background"
                                            placeholder="Eg: MN01AB1234"
                                            value={form.watch("vehicleNo") ?? ""}
                                            onChange={(e) => form.setValue("vehicleNo", e.target.value, { shouldValidate: true })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Driver Name</Label>
                                        <Input
                                            className="bg-background"
                                            placeholder="Driver name"
                                            value={form.watch("driverName") ?? ""}
                                            onChange={(e) => form.setValue("driverName", e.target.value, { shouldValidate: true })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Separator />

                {/* Rules - Using Checkbox as Switch fallback */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label className="text-sm font-medium">Only READY shipments</Label>
                            <p className="text-xs text-muted-foreground">Hide HOLD / ineligible shipments</p>
                        </div>
                        <Checkbox
                            checked={rules.onlyReady}
                            onCheckedChange={(v) => form.setValue("rules.onlyReady", !!v)}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label className="text-sm font-medium">Match destination</Label>
                            <p className="text-xs text-muted-foreground">Auto-filter shipments</p>
                        </div>
                        <Checkbox
                            checked={rules.matchDestination}
                            onCheckedChange={(v) => form.setValue("rules.matchDestination", !!v)}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label className="text-sm font-medium">Exclude COD shipments</Label>
                            <p className="text-xs text-muted-foreground">Optional operational rule</p>
                        </div>
                        <Checkbox
                            checked={rules.excludeCod}
                            onCheckedChange={(v) => form.setValue("rules.excludeCod", !!v)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
