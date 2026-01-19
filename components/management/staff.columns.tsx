"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CrudRowActions } from "@/components/crud/CrudRowActions";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Staff } from "@/hooks/useStaff";

// Role color mapping
const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-cyber-accent text-black",
    MANAGER: "bg-purple-500/20 text-purple-400 border-purple-400/30",
    OPS: "bg-blue-500/20 text-blue-400 border-blue-400/30",
    WAREHOUSE_IMPHAL: "bg-amber-500/20 text-amber-400 border-amber-400/30",
    WAREHOUSE_DELHI: "bg-amber-500/20 text-amber-400 border-amber-400/30",
    INVOICE: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
    SUPPORT: "bg-slate-500/20 text-slate-400 border-slate-400/30",
};

export interface StaffColumnsParams {
    onEdit: (row: Staff) => void;
    onToggleStatus: (row: Staff) => void;
    onDelete: (row: Staff) => void;
}

/**
 * Generate column definitions for the staff table.
 * Includes callbacks for edit, status toggle, and delete actions.
 */
export function getStaffColumns(
    params: StaffColumnsParams
): ColumnDef<Staff>[] {
    return [
        {
            accessorKey: "full_name",
            header: "Staff Member",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-white/10">
                        <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                            {row.original.full_name}
                        </div>
                        <div className="text-xs text-slate-500">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge className={ROLE_COLORS[row.original.role] || ROLE_COLORS.SUPPORT}>
                    {row.original.role.replace(/_/g, " ")}
                </Badge>
            ),
        },
        {
            accessorKey: "hub",
            header: "Hub",
            cell: ({ row }) =>
                row.original.hub ? (
                    <span className="text-xs font-mono">{row.original.hub.code}</span>
                ) : (
                    <span className="text-xs text-slate-400">HQ / Global</span>
                ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={`flex items-center gap-1.5 text-xs ${row.original.is_active
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${row.original.is_active
                                ? "bg-green-500 dark:bg-green-400"
                                : "bg-slate-400 dark:bg-slate-600"
                            }`}
                    />
                    {row.original.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant={row.original.is_active ? "ghost" : "secondary"}
                        size="sm"
                        onClick={() => params.onToggleStatus(row.original)}
                        className={row.original.is_active ? "text-red-500 hover:text-red-600" : ""}
                    >
                        {row.original.is_active ? (
                            <>
                                <X className="w-3 h-3 mr-1" /> Deactivate
                            </>
                        ) : (
                            <>
                                <Check className="w-3 h-3 mr-1" /> Activate
                            </>
                        )}
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
