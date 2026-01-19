"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CrudRowActions } from "@/components/crud/CrudRowActions";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceWithRelations } from "@/hooks/useInvoices";

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
    PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
    ISSUED: "bg-blue-500/20 text-blue-400 border-blue-400/30",
    OVERDUE: "bg-red-500/20 text-red-400 border-red-400/30",
    DRAFT: "bg-slate-500/20 text-slate-400 border-slate-400/30",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-400/30",
};

export interface InvoicesColumnsParams {
    onView: (row: InvoiceWithRelations) => void;
    onDownload: (row: InvoiceWithRelations) => void;
    onMarkPaid: (row: InvoiceWithRelations) => void;
    onCancel: (row: InvoiceWithRelations) => void;
    onDelete: (row: InvoiceWithRelations) => void;
}

/**
 * Generate column definitions for the invoices table.
 * Includes callbacks for view, download, status updates, and delete actions.
 */
export function getInvoicesColumns(
    params: InvoicesColumnsParams
): ColumnDef<InvoiceWithRelations>[] {
    return [
        {
            accessorKey: "invoice_number",
            header: "Invoice",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyber-accent" />
                    <span className="font-mono font-bold text-cyber-accent">
                        {row.original.invoice_number}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "customer",
            header: "Customer",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                        {row.original.customer?.name || "—"}
                    </div>
                    {row.original.awb_number && (
                        <div className="text-xs text-slate-500 font-mono">
                            AWB: {row.original.awb_number}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "total_amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-bold text-lg">
                        ₹{row.original.total_amount?.toLocaleString("en-IN") ?? "0"}
                    </div>
                    <div className="text-xs text-slate-500">
                        Tax: ₹{row.original.tax_amount?.toLocaleString("en-IN") ?? "0"}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "due_date",
            header: "Due Date",
            cell: ({ row }) => (
                <span className="font-mono text-sm text-slate-400">
                    {row.original.due_date
                        ? new Date(row.original.due_date).toLocaleDateString("en-IN")
                        : "—"}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    className={`${STATUS_COLORS[row.original.status] || STATUS_COLORS.DRAFT}`}
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => params.onDownload(row.original)}
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    <CrudRowActions
                        onEdit={() => params.onView(row.original)}
                        onDelete={() => params.onDelete(row.original)}
                        extraItems={[
                            ...(row.original.status === "ISSUED"
                                ? [
                                    {
                                        label: "Mark as Paid",
                                        icon: <CheckCircle className="w-4 h-4" />,
                                        onClick: () => params.onMarkPaid(row.original),
                                    },
                                    {
                                        label: "Cancel",
                                        icon: <XCircle className="w-4 h-4" />,
                                        onClick: () => params.onCancel(row.original),
                                    },
                                ]
                                : []),
                        ]}
                    />
                </div>
            ),
        },
    ];
}
