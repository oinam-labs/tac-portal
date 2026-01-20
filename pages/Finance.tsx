import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, Plus, Check, Printer, Mail, MessageCircle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/CyberComponents';
import { Modal } from '@/components/ui/Modal';

// CRUD Components
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog';

// Domain Components
import { CreateInvoiceForm } from '@/components/finance/CreateInvoiceForm';

// Hooks & Data
import { useInvoices, useUpdateInvoiceStatus } from '@/hooks/useInvoices';
import { getInvoicesColumns } from '@/components/finance/invoices.columns';

// Utils
import { formatCurrency } from '@/lib/utils';
import { generateEnterpriseInvoice } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invoice, Shipment } from '@/types';

export const Finance: React.FC = () => {
    const navigate = useNavigate();

    // Use Supabase hooks for invoices
    const { data: invoicesData = [] } = useInvoices();
    const updateStatusMutation = useUpdateInvoiceStatus();

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [successData, setSuccessData] = useState<{ invoice: Invoice; shipment: Shipment | undefined } | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<Invoice | null>(null);

    // Helper to get shipment from Supabase
    const getShipment = async (awb: string) => {
        const { data } = await supabase
            .from('shipments')
            .select('*')
            .eq('awb_number', awb)
            .single();
        return data;
    };

    const handleDownloadInvoice = async (inv: Invoice, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            toast.info('Generating invoice PDF...');
            const shipment = inv.awb ? await getShipment(inv.awb) : null;
            const fullInvoice = { ...inv, ...(shipment ? { consignor: (shipment as any).consignor, consignee: (shipment as any).consignee } : {}) };

            const url = await generateEnterpriseInvoice(fullInvoice as Invoice);
            const link = document.createElement('a');
            link.href = url;
            link.download = `INVOICE-${inv.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.open(url, '_blank');
            toast.success('Invoice downloaded!');
        } catch (error) {
            console.error('Invoice generation error:', error);
            toast.error('Failed to generate invoice PDF');
        }
    };

    const handleDownloadLabel = async (inv: Invoice, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const shipment = inv.awb ? await getShipment(inv.awb) : null;
            if (!shipment) {
                toast.error('No shipment data found');
                return;
            }

            localStorage.setItem('print_shipping_label', JSON.stringify(shipment));

            const width = 500;
            const height = 700;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;

            window.open(
                `#/print/label/${(shipment as any).awb_number || (shipment as any).awb}`,
                'PrintLabel',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );
        } catch (error) {
            console.error('Label error:', error);
            toast.error('Failed to open label');
        }
    };

    const handleShareWhatsapp = async (inv: Invoice) => {
        const shipment = inv.awb ? await getShipment(inv.awb) : null;
        const phone = (inv as any).consignee?.phone || (shipment as any)?.consignee?.phone || '';
        if (!phone) {
            alert("No customer phone number found.");
            return;
        }

        const text = `Hello, here is your invoice ${inv.invoiceNumber} for shipment AWB ${inv.awb}.
        
Amount: ${formatCurrency(inv.financials.totalAmount)}
Status: ${inv.status}
        
Track your shipment here: https://taccargo.com/track/${inv.awb}
        
Thank you for choosing TAC Cargo.`;

        const url = `https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareEmail = async (inv: Invoice) => {
        const shipment = inv.awb ? await getShipment(inv.awb) : null;
        const email = (shipment as any)?.customerEmail || '';

        const subject = `Invoice ${inv.invoiceNumber} - TAC Cargo`;
        const body = `Dear Customer,%0D%0A%0D%0APlease find details for invoice ${inv.invoiceNumber} related to shipment ${inv.awb}.%0D%0A%0D%0AAmount: ${formatCurrency(inv.financials.totalAmount)}%0D%0A%0D%0AThank you,%0D%0ATAC Cargo Team`;

        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    };

    const handleStatusUpdate = async (id: string, status: 'PAID' | 'CANCELLED') => {
        if (confirm(`Mark invoice as ${status}?`)) {
            await updateStatusMutation.mutateAsync({ id, status });
        }
    };

    const onInvoiceCreated = (invoice?: Invoice, shipment?: Shipment) => {
        setIsCreateOpen(false);
        // Show success dialog if invoice was created
        if (invoice) {
            setSuccessData({ invoice, shipment });
        }
        // React Query will auto-refetch
    };

    const handleDelete = async () => {
        if (!rowToDelete) return;
        await updateStatusMutation.mutateAsync({ id: rowToDelete.id, status: 'CANCELLED' });
        setRowToDelete(null);
        setDeleteOpen(false);
    };

    // Table columns with callbacks
    const columns = useMemo(
        () =>
            getInvoicesColumns({
                onView: (row) => navigate(`/tracking?awb=${(row as any).awb_number || (row as any).awb}`),
                onDownload: (row) => {
                    const inv: Invoice = {
                        id: row.id,
                        invoiceNumber: row.invoice_no, // DB column name
                        customerId: row.customer_id,
                        customerName: row.customer?.name || 'Unknown',
                        shipmentId: row.shipment_id || '',
                        awb: row.shipment?.awb_number || '', // Get from shipment relation
                        status: row.status,
                        createdAt: row.created_at,
                        dueDate: row.due_date || '',
                        paymentMode: 'PAID',
                        financials: {
                            ratePerKg: 0,
                            baseFreight: row.subtotal,
                            docketCharge: 0,
                            pickupCharge: 0,
                            packingCharge: 0,
                            fuelSurcharge: 0,
                            handlingFee: 0,
                            insurance: 0,
                            tax: { cgst: 0, sgst: 0, igst: 0, total: row.tax?.total ?? 0 },
                            discount: 0,
                            totalAmount: row.total, // DB column name
                            advancePaid: 0,
                            balance: row.total, // DB column name
                        },
                    };
                    handleDownloadInvoice(inv);
                },
                onMarkPaid: (row) => handleStatusUpdate(row.id, 'PAID'),
                onCancel: (row) => handleStatusUpdate(row.id, 'CANCELLED'),
                onDelete: (row) => {
                    const inv: Invoice = {
                        id: row.id,
                        invoiceNumber: row.invoice_no, // DB column name
                        customerId: row.customer_id,
                        customerName: row.customer?.name || 'Unknown',
                        shipmentId: row.shipment_id || '',
                        awb: row.shipment?.awb_number || '', // Get from shipment relation
                        status: row.status,
                        createdAt: row.created_at,
                        dueDate: row.due_date || '',
                        paymentMode: 'PAID',
                        financials: {
                            ratePerKg: 0,
                            baseFreight: row.subtotal,
                            docketCharge: 0,
                            pickupCharge: 0,
                            packingCharge: 0,
                            fuelSurcharge: 0,
                            handlingFee: 0,
                            insurance: 0,
                            tax: { cgst: 0, sgst: 0, igst: 0, total: row.tax?.total ?? 0 },
                            discount: 0,
                            totalAmount: row.total, // DB column name
                            advancePaid: 0,
                            balance: row.total, // DB column name
                        },
                    };
                    setRowToDelete(inv);
                    setDeleteOpen(true);
                },
            }),
        [navigate]
    );

    // Use Supabase data directly - already in correct format
    const tableData = invoicesData;

    // Stats from Supabase data - use correct DB column names
    const totalRevenue = invoicesData.reduce((acc: number, inv) => acc + (inv.status === 'PAID' ? (inv.total || 0) : 0), 0);
    const pendingAmount = invoicesData.reduce((acc: number, inv) => acc + (inv.status === 'ISSUED' ? (inv.total || 0) : 0), 0);
    const overdueAmount = invoicesData.reduce((acc: number, inv) => acc + (inv.status === 'OVERDUE' ? (inv.total || 0) : 0), 0);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage invoices, billing, and payment gateways.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-cyber-surface dark:to-cyber-card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Total Revenue (Paid)</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalRevenue)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-cyber-surface dark:to-cyber-card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Pending Invoices</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(pendingAmount)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-cyber-surface dark:to-cyber-card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Overdue</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(overdueAmount)}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Table with CRUD */}
            <CrudTable
                columns={columns}
                data={tableData}
                searchKey="invoice_no"
                searchPlaceholder="Search invoices..."
                isLoading={false}
                emptyMessage="No invoices found. Create your first invoice to get started."
                toolbar={
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Invoice
                    </Button>
                }
            />

            {/* Create Invoice Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Generate New Invoice" size="4xl">
                <CreateInvoiceForm
                    onSuccess={onInvoiceCreated}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={!!successData} onClose={() => setSuccessData(null)} title="Invoice Created Successfully" size="md">
                {successData && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready for Dispatch</h3>
                            <p className="text-slate-500 text-sm">Invoice {successData.invoice.invoiceNumber} and AWB {successData.invoice.awb} generated.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button size="lg" onClick={(e) => handleDownloadInvoice(successData.invoice, e)}>
                                <FileText className="w-5 h-5 mr-2" /> Download Invoice
                            </Button>
                            <Button size="lg" variant="secondary" onClick={(e) => handleDownloadLabel(successData.invoice, e)}>
                                <Printer className="w-5 h-5 mr-2" /> Print Label
                            </Button>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-wider">Share with Customer</p>
                            <div className="flex justify-center gap-4">
                                <Button variant="ghost" className="text-green-500 border border-green-500/30 hover:bg-green-500/10" onClick={() => handleShareWhatsapp(successData.invoice)}>
                                    <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                                </Button>
                                <Button variant="ghost" className="text-blue-500 border border-blue-500/30 hover:bg-blue-500/10" onClick={() => handleShareEmail(successData.invoice)}>
                                    <Mail className="w-5 h-5 mr-2" /> Email
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Dialog */}
            <CrudDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Cancel invoice?"
                description={`This will cancel invoice "${rowToDelete?.invoiceNumber ?? ''}". This action cannot be undone.`}
                onConfirm={handleDelete}
                confirmLabel="Cancel Invoice"
            />
        </div>
    );
};
