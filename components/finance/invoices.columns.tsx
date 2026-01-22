"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CrudRowActions } from "@/components/crud/CrudRowActions";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceWithRelations } from "@/hooks/useInvoices";

// Status color mapping using semantic badge classes
const STATUS_COLORS: Record<string, string> = {
    PAID: "badge--delivered",
    ISSUED: "badge--manifested",
    OVERDUE: "badge--exception",
    DRAFT: "badge--cancelled",
    CANCELLED: "badge--cancelled",
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
            accessorKey: "invoice_no",
            header: "Invoice",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyber-accent" />
                    <span className="font-mono font-bold text-cyber-accent">
                        {row.original.invoice_no}
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
                    {row.original.shipment?.awb_number && (
                        <div className="text-xs text-muted-foreground font-mono">
                            AWB: {row.original.shipment.awb_number}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "total",
            header: "Amount",
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-bold text-lg">
                        ₹{row.original.total?.toLocaleString("en-IN") ?? "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Tax: ₹{(row.original.tax_amount ?? 0).toLocaleString("en-IN")}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "due_date",
            header: "Due Date",
            cell: ({ row }) => (
                <span className="font-mono text-sm text-muted-foreground">
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
