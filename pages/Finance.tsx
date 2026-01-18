
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Th, Td, Badge, Button } from '../components/ui/CyberComponents';
import { useInvoiceStore } from '../store/invoiceStore';
import { useShipmentStore } from '../store/shipmentStore'; // Needed to fetch linked shipment
import { FileText, CreditCard, Plus, Check, X, Printer, Mail, MessageCircle, Map } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { generateEnterpriseInvoice } from '../lib/pdf-generator';
import { Invoice, Shipment } from '../types';
import { Modal } from '../components/ui/Modal';
import { CreateInvoiceForm } from '../components/finance/CreateInvoiceForm';
import { db } from '../lib/mock-db'; // Direct access for efficiency in this mock
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = {
    'PAID': 'text-green-600 dark:text-green-400 border-green-400/30 bg-green-400/10',
    'ISSUED': 'text-yellow-600 dark:text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    'OVERDUE': 'text-red-600 dark:text-red-400 border-red-400/30 bg-red-400/10',
    'DRAFT': 'text-slate-600 dark:text-slate-400 border-slate-400/30 bg-slate-400/10',
    'CANCELLED': 'text-gray-600 dark:text-gray-400 border-gray-400/30 bg-gray-400/10',
};

export const Finance: React.FC = () => {
    const navigate = useNavigate();
    const { invoices, fetchInvoices, updateInvoiceStatus } = useInvoiceStore();
    const { fetchShipments } = useShipmentStore(); // Ensure shipments are loaded
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [successData, setSuccessData] = useState<{ invoice: Invoice, shipment: Shipment | undefined } | null>(null);

    useEffect(() => {
        fetchInvoices();
        fetchShipments(); // Pre-load shipments to allow label generation
    }, []);

    const getShipment = (inv: Invoice) => {
        return db.getShipmentByAWB(inv.awb);
    };

    const handleDownloadInvoice = async (inv: Invoice, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            toast.info('Generating invoice PDF...');
            const shipment = getShipment(inv);
            // Enrich invoice with shipment data for PDF if needed
            const fullInvoice = { ...inv, ...(shipment ? { consignor: shipment.consignor, consignee: shipment.consignee } : {}) };

            const url = await generateEnterpriseInvoice(fullInvoice as Invoice);
            const link = document.createElement('a');
            link.href = url;
            link.download = `INVOICE-${inv.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Also open in new tab for viewing
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
            const shipment = getShipment(inv);
            if (!shipment) {
                toast.error('No shipment data found');
                return;
            }

            // Save to LS for the print page
            localStorage.setItem('print_shipping_label', JSON.stringify(shipment));

            // Open print page in a popup
            const width = 500;
            const height = 700;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;

            window.open(
                `#/print/label/${shipment.awb}`,
                'PrintLabel',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );
        } catch (error) {
            console.error('Label error:', error);
            toast.error('Failed to open label');
        }
    };

    const handleShareWhatsapp = (inv: Invoice) => {
        const shipment = getShipment(inv);
        const phone = (inv as any).consignee?.phone || shipment?.consignee?.phone || '';
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

    const handleShareEmail = (inv: Invoice) => {
        const shipment = getShipment(inv);
        const email = (shipment as any)?.customerEmail || ''; // Assuming we might store it, or ask user

        const subject = `Invoice ${inv.invoiceNumber} - TAC Cargo`;
        const body = `Dear Customer,%0D%0A%0D%0APlease find details for invoice ${inv.invoiceNumber} related to shipment ${inv.awb}.%0D%0A%0D%0AAmount: ${formatCurrency(inv.financials.totalAmount)}%0D%0A%0D%0AThank you,%0D%0ATAC Cargo Team`;

        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    };

    const handleStatusUpdate = async (id: string, status: 'PAID' | 'CANCELLED') => {
        if (confirm(`Mark invoice as ${status}?`)) {
            await updateInvoiceStatus(id, status);
        }
    };

    // Callback when new invoice is created
    const onInvoiceCreated = () => {
        setIsCreateOpen(false);
        fetchInvoices();
        // Automatically find the latest invoice to show success modal
        setTimeout(() => {
            const latest = useInvoiceStore.getState().invoices[0];
            if (latest) {
                setSuccessData({
                    invoice: latest,
                    shipment: getShipment(latest)
                });
            }
        }, 500);
    };

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.financials.totalAmount : 0), 0);
    const pendingAmount = invoices.reduce((acc, inv) => acc + (inv.status === 'ISSUED' ? inv.financials.totalAmount : 0), 0);
    const overdueAmount = invoices.reduce((acc, inv) => acc + (inv.status === 'OVERDUE' ? inv.financials.totalAmount : 0), 0);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage invoices, billing, and payment gateways.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Invoice
                    </Button>
                </div>
            </div>

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

            <Card>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <Th>Invoice #</Th>
                            <Th>Customer</Th>
                            <Th>Date</Th>
                            <Th>Amount</Th>
                            <Th>Status</Th>
                            <Th>Documents</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-slate-500">No invoices found.</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <Td><span className="font-mono text-slate-900 dark:text-white">{inv.invoiceNumber}</span></Td>
                                    <Td>{inv.customerName}</Td>
                                    <Td className="text-slate-500 dark:text-slate-400 text-xs">{inv.createdAt.split('T')[0]}</Td>
                                    <Td><span className="font-mono text-slate-900 dark:text-white font-bold">{formatCurrency(inv.financials.totalAmount)}</span></Td>
                                    <Td>
                                        <Badge className={STATUS_STYLES[inv.status] || ''}>{inv.status}</Badge>
                                    </Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={(e) => handleDownloadInvoice(inv, e)} title="PDF Invoice">
                                                <FileText className="w-4 h-4 mr-1" /> Invoice
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={(e) => handleDownloadLabel(inv, e)} title="Shipping Label">
                                                <Printer className="w-4 h-4 mr-1" /> Label
                                            </Button>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking?awb=${inv.awb}`)} title="Track Shipment">
                                                <Map className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleShareWhatsapp(inv)} title="Share WhatsApp" className="text-green-500 hover:bg-green-500/10">
                                                <MessageCircle className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleShareEmail(inv)} title="Share Email">
                                                <Mail className="w-4 h-4" />
                                            </Button>

                                            {inv.status === 'ISSUED' && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(inv.id, 'PAID')} title="Mark Paid">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(inv.id, 'CANCELLED')} title="Cancel">
                                                        <X className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

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

                        <div className="border-t border-cyber-border pt-4">
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
        </div>
    );
};
