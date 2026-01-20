"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CrudRowActions } from "@/components/crud/CrudRowActions";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Plane, Truck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HUBS } from "@/lib/constants";
import { ShipmentWithRelations } from "@/hooks/useShipments";

export interface ShipmentsColumnsParams {
    onView: (row: ShipmentWithRelations) => void;
    onEdit: (row: ShipmentWithRelations) => void;
    onDelete: (row: ShipmentWithRelations) => void;
}

/**
 * Generate column definitions for the shipments table.
 * Includes callbacks for view, edit, and delete actions.
 */
export function getShipmentsColumns(
    params: ShipmentsColumnsParams
): ColumnDef<ShipmentWithRelations>[] {
    return [
        {
            accessorKey: "awb_number",
            header: "AWB",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.mode === "AIR" ? (
                        <Plane className="w-4 h-4 text-cyan-400" />
                    ) : (
                        <Truck className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-mono font-bold text-cyber-accent">
                        {row.original.awb_number}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "customer",
            header: "Customer",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-foreground">
                        {row.original.customer?.name || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.customer?.phone || ""}
                    </div>
                </div>
            ),
        },
        {
            id: "route",
            header: "Route",
            cell: ({ row }) => {
                const originCode = row.original.origin_hub?.code ||
                    (HUBS as Record<string, { code: string }>)[row.original.origin_hub_id]?.code ||
                    row.original.origin_hub_id;
                const destCode = row.original.destination_hub?.code ||
                    (HUBS as Record<string, { code: string }>)[row.original.destination_hub_id]?.code ||
                    row.original.destination_hub_id;

                return (
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-semibold">{originCode}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold">{destCode}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "service_level",
            header: "Service",
            cell: ({ row }) => (
                <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${row.original.service_level === "EXPRESS"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-muted text-muted-foreground"
                        }`}
                >
                    {row.original.service_level?.substring(0, 3) || "STD"}
                </span>
            ),
        },
        {
            accessorKey: "package_count",
            header: "Pkgs",
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.package_count}</span>
            ),
        },
        {
            accessorKey: "total_weight",
            header: "Weight",
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.total_weight?.toFixed(1)} kg
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => params.onView(row.original)}
                    >
                        <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <CrudRowActions
                        onEdit={() => params.onEdit(row.original)}
                        onDelete={() => params.onDelete(row.original)}
                    />
                </div>
            ),
        },
    ];
}
