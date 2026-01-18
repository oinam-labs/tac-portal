'use client';

import React from 'react';
import { Invoice, Shipment } from '@/types';
import { Button, Card, Badge } from '@/components/ui/CyberComponents';
import { formatCurrency } from '@/lib/utils';
import { NotesPanel } from '@/components/domain/NotesPanel';
import {
    FileText,
    Printer,
    X,
    CreditCard,
    Calendar,
    User,
    Truck,
    Plane,
    MapPin,
} from 'lucide-react';
import { HUBS } from '@/lib/constants';

const STATUS_STYLES: Record<string, string> = {
    PAID: 'text-green-600 dark:text-green-400 border-green-400/30 bg-green-400/10',
    ISSUED: 'text-yellow-600 dark:text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    OVERDUE: 'text-red-600 dark:text-red-400 border-red-400/30 bg-red-400/10',
    DRAFT: 'text-slate-600 dark:text-slate-400 border-slate-400/30 bg-slate-400/10',
    CANCELLED: 'text-gray-600 dark:text-gray-400 border-gray-400/30 bg-gray-400/10',
};

interface InvoiceDetailsProps {
    invoice: Invoice;
    shipment?: Shipment;
    onClose: () => void;
    onDownloadInvoice: (inv: Invoice) => void;
    onDownloadLabel: (inv: Invoice) => void;
    onMarkPaid?: (id: string) => void;
    onCancel?: (id: string) => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
    invoice,
    shipment,
    onClose,
    onDownloadInvoice,
    onDownloadLabel,
    onMarkPaid,
    onCancel,
}) => {
    const origin = shipment ? HUBS[shipment.originHub] : null;
    const dest = shipment ? HUBS[shipment.destinationHub] : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                            {invoice.invoiceNumber}
                        </h2>
                        <Badge className={STATUS_STYLES[invoice.status]}>{invoice.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        AWB: {invoice.awb} • Created {invoice.createdAt.split('T')[0]}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onDownloadInvoice(invoice)} variant="secondary">
                        <FileText className="w-4 h-4 mr-2" /> Invoice PDF
                    </Button>
                    <Button onClick={() => onDownloadLabel(invoice)} variant="secondary">
                        <Printer className="w-4 h-4 mr-2" /> Label
                    </Button>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Invoice Details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Customer & Shipment Info */}
                    <Card>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Customer
                                </h3>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {invoice.customerName}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">ID: {invoice.customerId}</div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Payment
                                </h3>
                                <div className="text-sm font-medium">{invoice.paymentMode}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Due: {invoice.dueDate.split('T')[0]}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Route Info */}
                    {shipment && origin && dest && (
                        <Card>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Route
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        {origin.code}
                                    </div>
                                    <div className="text-xs text-slate-500">{origin.name}</div>
                                </div>
                                <div className="flex-1 px-4 flex flex-col items-center">
                                    <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative">
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400" />
                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-card px-2">
                                            {shipment.mode === 'AIR' ? (
                                                <Plane className="w-4 h-4 text-slate-500" />
                                            ) : (
                                                <Truck className="w-4 h-4 text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-primary">{dest.code}</div>
                                    <div className="text-xs text-slate-500">{dest.name}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-border mt-4 pt-4">
                                <div>
                                    <div className="text-xs text-slate-500">Service</div>
                                    <div className="font-bold text-sm">{shipment.serviceLevel}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Weight</div>
                                    <div className="font-bold text-sm">{shipment.totalWeight.chargeable} kg</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Packages</div>
                                    <div className="font-bold text-sm">{shipment.totalPackageCount}</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Financial Breakdown */}
                    <Card>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Financial Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Base Freight</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.baseFreight)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Docket Charge</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.docketCharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pickup Charge</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.pickupCharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Packing Charge</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.packingCharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Fuel Surcharge</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.fuelSurcharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Handling Fee</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.handlingFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Insurance</span>
                                <span className="font-mono">{formatCurrency(invoice.financials.insurance)}</span>
                            </div>
                            {invoice.financials.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-mono">-{formatCurrency(invoice.financials.discount)}</span>
                                </div>
                            )}
                            <div className="border-t border-border pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tax (GST)</span>
                                    <span className="font-mono">{formatCurrency(invoice.financials.tax.total)}</span>
                                </div>
                            </div>
                            <div className="border-t border-border pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="font-mono text-primary">
                                        {formatCurrency(invoice.financials.totalAmount)}
                                    </span>
                                </div>
                                {invoice.financials.advancePaid > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-slate-500">Advance Paid</span>
                                            <span className="font-mono text-green-600">
                                                -{formatCurrency(invoice.financials.advancePaid)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-bold mt-1">
                                            <span>Balance Due</span>
                                            <span className="font-mono">
                                                {formatCurrency(invoice.financials.balance)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Notes */}
                <div className="space-y-4">
                    <NotesPanel
                        entityType="INVOICE"
                        entityId={invoice.id}
                        title="Invoice Notes"
                        currentUserId="System"
                        maxHeight="400px"
                    />

                    {/* Quick Actions */}
                    {invoice.status === 'ISSUED' && (
                        <Card>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                {onMarkPaid && (
                                    <Button
                                        className="w-full"
                                        variant="primary"
                                        onClick={() => onMarkPaid(invoice.id)}
                                    >
                                        Mark as Paid
                                    </Button>
                                )}
                                {onCancel && (
                                    <Button
                                        className="w-full"
                                        variant="danger"
                                        onClick={() => onCancel(invoice.id)}
                                    >
                                        Cancel Invoice
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;
