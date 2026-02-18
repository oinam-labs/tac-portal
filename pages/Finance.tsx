/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, CreditCard, Plus, Check, Printer, Mail, MessageCircle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/page-header';

// CRUD Components
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog';

// Domain Components
import { CreateInvoiceForm } from '@/components/finance/CreateInvoiceForm';
import InvoiceDetails from '@/components/finance/InvoiceDetails';
import { LabelPreviewDialog } from '@/components/domain/LabelPreviewDialog';
import { generateLabelFromShipment } from '@/lib/utils/label-utils';
import { LabelData } from '@/components/domain/LabelGenerator';

// Hooks & Data
import {
  useInvoices,
  useUpdateInvoiceStatus,
  useHardDeleteInvoice,
  useInvoiceByAWB,
  InvoiceWithRelations,
} from '@/hooks/useInvoices';
import { getInvoicesColumns } from '@/components/finance/invoices.columns';
import { useAuthStore } from '@/store/authStore';

// Utils
import { formatCurrency } from '@/lib/utils';
import { sanitizeString } from '@/lib/utils/sanitize';
import { generateEnterpriseInvoice } from '@/lib/pdf-generator';
import { HUBS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { HubLocation, Invoice, Shipment, ShipmentMode, ServiceLevel, PaymentMode } from '@/types';
import { logger } from '@/lib/logger';

export const Finance: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Use Supabase hooks for invoices
  const { data: invoicesData = [], refetch: refetchInvoices } = useInvoices();
  const updateStatusMutation = useUpdateInvoiceStatus();

  // Support ?awb= URL parameter for direct navigation from scanned shipments
  const awbParam = searchParams.get('awb');
  const { data: invoiceByAWB, isLoading: isLoadingByAWB } = useInvoiceByAWB(awbParam);
  const hardDeleteMutation = useHardDeleteInvoice();

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithRelations | null>(null);
  const [successData, setSuccessData] = useState<{
    invoice: Invoice;
    shipment: Shipment | undefined;
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Invoice | null>(null);
  const [labelDownloading, setLabelDownloading] = useState(false);

  // View detail modal state
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [viewShipment, setViewShipment] = useState<Shipment | undefined>(undefined);

  // Label preview dialog state
  const [labelPreviewOpen, setLabelPreviewOpen] = useState(false);
  const [labelPreviewData, setLabelPreviewData] = useState<Partial<LabelData> | undefined>(
    undefined
  );

  // Helper to get shipment from Supabase (include hub + customer relations for label mapping)
  const getShipment = async (awb: string) => {
    const { data, error } = await supabase
      .from('shipments')
      .select(
        `
                *,
                customer:customers(name),
                origin_hub:hubs!shipments_origin_hub_id_fkey(code),
                destination_hub:hubs!shipments_destination_hub_id_fkey(code)
            `
      )
      .eq('awb_number', awb)
      .maybeSingle(); // Use maybeSingle to avoid error when no rows

    if (error) {
      console.warn('Shipment fetch error:', error);
      return null;
    }
    return data as any;
  };

  const formatAddress = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const { line1, line2, city, state, zip } = address as Record<string, string | undefined>;
    return [line1, line2, city, state, zip].filter(Boolean).join(', ');
  };

  const formatInvoiceDateTag = (dateInput?: string) => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    return safeDate.toISOString().slice(0, 10).replace(/-/g, '');
  };

  const buildInvoiceFilename = (inv: Invoice, consignor: any, consignee: any) => {
    const rawName = sanitizeString(
      inv.customerName || consignee?.name || consignor?.name || 'Customer'
    );
    const safeName = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const dateTag = formatInvoiceDateTag(inv.createdAt);
    return `INVOICE-${safeName || 'customer'}-${dateTag}.pdf`;
  };

  const resolveHubLocation = (row: any, type: 'origin' | 'destination'): HubLocation => {
    const hubId = type === 'origin' ? row.origin_hub_id : row.destination_hub_id;
    const hubCode = type === 'origin' ? row.origin_hub?.code : row.destination_hub?.code;

    const byUuid = Object.values(HUBS).find((hub) => hub.uuid === hubId)?.id;
    const byCode = Object.values(HUBS).find((hub) => hub.code === hubCode)?.id;

    return (byUuid || byCode || 'IMPHAL') as HubLocation;
  };

  const resolveMode = (value?: string | null): ShipmentMode => {
    if (!value) return 'TRUCK';
    return value.toUpperCase() === 'AIR' ? 'AIR' : 'TRUCK';
  };

  const resolveServiceLevel = (value?: string | null): ServiceLevel => {
    if (!value) return 'STANDARD';
    const upper = value.toUpperCase();
    if (upper === 'EXPRESS' || upper === 'PRIORITY' || upper === 'STANDARD') {
      return upper as ServiceLevel;
    }
    return 'STANDARD';
  };

  const mapShipmentForLabel = (row: any): Shipment => {
    const originHub = resolveHubLocation(row, 'origin');
    const destinationHub = resolveHubLocation(row, 'destination');
    const weight = Number(row.total_weight ?? 0);

    return {
      id: row.id,
      awb: row.awb_number || row.awb,
      customerId: row.customer_id,
      customerName: row.customer?.name || row.receiver_name || 'Unknown',
      originHub,
      destinationHub,
      mode: resolveMode(row.mode),
      serviceLevel: resolveServiceLevel(row.service_level),
      totalPackageCount: row.total_packages ?? 1,
      totalWeight: {
        dead: weight,
        volumetric: 0,
        chargeable: weight,
      },
      status: row.status ?? 'CREATED',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      eta: 'TBD',
      consignor: {
        name: row.sender_name || 'SENDER',
        phone: row.sender_phone || '',
        address: formatAddress(row.sender_address),
      },
      consignee: {
        name: row.receiver_name || 'RECIPIENT',
        phone: row.receiver_phone || '',
        address: formatAddress(row.receiver_address),
      },
      contentsDescription: row.contents || 'General Cargo',
      paymentMode: (row.payment_mode as PaymentMode) || 'TO_PAY',
    };
  };

  const handleDownloadInvoice = async (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    logger.debug('[Invoice] handleDownloadInvoice called', { id: inv.id, awb: inv.awb });
    try {
      toast.info('Generating invoice PDF...');
      const shipmentRow = inv.awb ? await getShipment(inv.awb) : null;
      logger.debug('[Invoice] Shipment row from DB', { found: !!shipmentRow });

      // Use DB shipment data or fall back to invoice line_items
      const lineItems = (inv as any).line_items || (inv as any).financials || {};
      logger.debug('[Invoice] Line items', { lineItems });

      const consignor = shipmentRow
        ? {
            name: shipmentRow.sender_name,
            phone: shipmentRow.sender_phone,
            address: formatAddress(shipmentRow.sender_address),
          }
        : lineItems.consignor || (inv as any).consignor || {};
      const consignee = shipmentRow
        ? {
            name: shipmentRow.receiver_name,
            phone: shipmentRow.receiver_phone,
            address: formatAddress(shipmentRow.receiver_address),
          }
        : lineItems.consignee || (inv as any).consignee || {};

      logger.debug('[Invoice] Parties', { consignor, consignee });

      const fullInvoice = { ...inv, consignor, consignee };
      logger.debug('[Invoice] Full invoice object', { invoiceId: fullInvoice.id });

      logger.debug('[Invoice] Calling generateEnterpriseInvoice');
      const url = await generateEnterpriseInvoice(fullInvoice as Invoice);
      logger.debug('[Invoice] PDF generated');

      // Direct download without opening new tab
      const link = document.createElement('a');
      link.href = url;
      link.download = buildInvoiceFilename(inv, consignor, consignee);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      logger.debug('[Invoice] Download triggered');

      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('[Invoice] Invoice generation error:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };

  // Build shipment data from invoice line_items when no DB shipment exists
  const buildShipmentFromInvoice = (inv: Invoice): Shipment => {
    logger.debug('[Label] Building shipment from invoice', { id: inv.id, awb: inv.awb });
    const lineItems = (inv as any).line_items || (inv as any).financials || {};
    logger.debug('[Label] Line items', { lineItems });
    const consignor = lineItems.consignor || (inv as any).consignor || {};
    const consignee = lineItems.consignee || (inv as any).consignee || {};
    logger.debug('[Label] Parties', { consignor, consignee });

    return {
      id: inv.id,
      awb: inv.awb || '',
      customerId: inv.customerId || '',
      customerName: consignee.name || inv.customerName || 'Unknown',
      originHub: 'NEW_DELHI' as HubLocation,
      destinationHub: 'IMPHAL' as HubLocation,
      mode: (lineItems.transportMode as ShipmentMode) || 'TRUCK',
      serviceLevel: 'STANDARD' as ServiceLevel,
      totalPackageCount: 1,
      totalWeight: { dead: 0, volumetric: 0, chargeable: 0 },
      status: 'CREATED',
      createdAt: inv.createdAt || new Date().toISOString(),
      updatedAt: inv.createdAt || new Date().toISOString(),
      eta: 'TBD',
      consignor: {
        name: consignor.name || 'SENDER',
        phone: consignor.phone || '',
        address: consignor.address || '',
        city: consignor.city,
        state: consignor.state,
      },
      consignee: {
        name: consignee.name || 'RECIPIENT',
        phone: consignee.phone || '',
        address: consignee.address || '',
        city: consignee.city,
        state: consignee.state,
      },
      contentsDescription: 'General Cargo',
      paymentMode: (inv.paymentMode as PaymentMode) || 'TO_PAY',
    };
  };

  const handleDownloadLabel = async (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (labelDownloading) {
      logger.debug('[Label] Skipping duplicate call');
      return;
    }
    setLabelDownloading(true);
    logger.debug('[Label] handleDownloadLabel called', { id: inv.id, awb: inv.awb });
    try {
      toast.info('Preparing label preview...');

      // Try to load shipment from DB if AWB exists
      let shipment: Shipment | null = null;
      if (inv.awb) {
        const shipmentRow = await getShipment(inv.awb);
        if (shipmentRow) {
          shipment = mapShipmentForLabel(shipmentRow);
        }
      }

      // If no DB shipment, build from invoice data (works without AWB)
      if (!shipment) {
        shipment = buildShipmentFromInvoice(inv);
      }

      logger.debug('[Label] Shipment object built', {
        awb: shipment.awb,
        consignee: shipment.consignee?.name,
      });

      // Generate label data and open inline preview dialog
      const labelData = generateLabelFromShipment(shipment, inv);
      setLabelPreviewData(labelData);
      setLabelPreviewOpen(true);

      logger.debug('[Label] Label preview dialog opened');
    } catch (error) {
      console.error('Label error:', error);
      toast.error('Failed to generate label');
    } finally {
      setTimeout(() => setLabelDownloading(false), 1000);
    }
  };

  const handleShareWhatsapp = async (inv: Invoice) => {
    const shipment = inv.awb ? await getShipment(inv.awb) : null;
    const phone = (inv as any).consignee?.phone || (shipment as any)?.consignee?.phone || '';
    if (!phone) {
      alert('No customer phone number found.');
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
    setEditingInvoice(null);
    // Show success dialog if invoice was created
    if (invoice) {
      setSuccessData({ invoice, shipment });
    }
    // Explicitly refetch to ensure table updates
    refetchInvoices();
  };

  const handleDelete = async () => {
    if (!rowToDelete) return;

    if (isSuperAdmin) {
      await hardDeleteMutation.mutateAsync(rowToDelete.id);
    } else {
      // Fallback: If delete button was somehow accessible (shouldn't be), just cancel
      await updateStatusMutation.mutateAsync({ id: rowToDelete.id, status: 'CANCELLED' });
    }

    setRowToDelete(null);
    setDeleteOpen(false);
  };

  // Helper to build Invoice object from DB row
  // AWB priority: shipment FK join → line_items JSONB → empty
  const buildInvoiceFromRow = (row: any): Invoice => {
    const lineItems = row.line_items || {};
    const awb = row.shipment?.awb_number || lineItems.awb || '';
    const tax = lineItems.tax ?? { cgst: 0, sgst: 0, igst: 0, total: row.tax_amount ?? 0 };

    return {
      id: row.id,
      invoiceNumber: row.invoice_no,
      customerId: row.customer_id,
      customerName: row.customer?.name || 'Unknown',
      shipmentId: row.shipment_id || '',
      awb,
      status: row.status,
      createdAt: row.created_at,
      dueDate: row.due_date || '',
      paymentMode: lineItems.paymentMode || 'PAID',
      financials: {
        ratePerKg: lineItems.ratePerKg ?? 0,
        baseFreight: lineItems.baseFreight ?? row.subtotal ?? 0,
        docketCharge: lineItems.docketCharge ?? 0,
        pickupCharge: lineItems.pickupCharge ?? 0,
        packingCharge: lineItems.packingCharge ?? 0,
        fuelSurcharge: lineItems.fuelSurcharge ?? 0,
        handlingFee: lineItems.handlingFee ?? 0,
        insurance: lineItems.insurance ?? 0,
        tax,
        discount: lineItems.discount ?? row.discount ?? 0,
        totalAmount: row.total ?? 0,
        advancePaid: lineItems.advancePaid ?? 0,
        balance: lineItems.balance ?? row.total ?? 0,
      },
      // Preserve line_items for downstream use (label gen, PDF)
      ...(Object.keys(lineItems).length > 0 ? { line_items: lineItems } : {}),
    } as Invoice;
  };

  // Open invoice detail view
  const handleViewInvoice = async (row: any) => {
    const inv = buildInvoiceFromRow(row);
    setViewInvoice(inv);
    // Try to load shipment data for route info
    if (inv.awb) {
      try {
        const shipmentRow = await getShipment(inv.awb);
        if (shipmentRow) {
          setViewShipment(mapShipmentForLabel(shipmentRow));
        } else {
          setViewShipment(undefined);
        }
      } catch {
        setViewShipment(undefined);
      }
    } else {
      setViewShipment(undefined);
    }
  };

  // Auto-open invoice when navigating with ?awb= parameter (from scanned shipment)
  useEffect(() => {
    if (awbParam && invoiceByAWB && !isLoadingByAWB) {
      // Found invoice for this AWB - open it
      handleViewInvoice(invoiceByAWB);
      // Clear the URL parameter to avoid re-triggering
      setSearchParams({});
    } else if (awbParam && !isLoadingByAWB && !invoiceByAWB) {
      // No invoice found for this AWB
      toast.error(`No invoice found for shipment ${awbParam}`);
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awbParam, invoiceByAWB, isLoadingByAWB]);

  const handleEditInvoice = (row: InvoiceWithRelations) => {
    setEditingInvoice(row);
    setIsCreateOpen(true);
  };

  // Table columns with callbacks
  const columns = useMemo(
    () =>
      getInvoicesColumns({
        onEdit: (row) => handleEditInvoice(row),
        onView: (row) => handleViewInvoice(row),
        onDownload: (row) => handleDownloadInvoice(buildInvoiceFromRow(row)),
        onDownloadLabel: (row) => handleDownloadLabel(buildInvoiceFromRow(row)),
        onMarkPaid: (row) => handleStatusUpdate(row.id, 'PAID'),
        onCancel: (row) => handleStatusUpdate(row.id, 'CANCELLED'),
        onShareWhatsapp: (row) => handleShareWhatsapp(buildInvoiceFromRow(row)),
        onShareEmail: (row) => handleShareEmail(buildInvoiceFromRow(row)),
        onDelete: isSuperAdmin
          ? (row) => {
              setRowToDelete(buildInvoiceFromRow(row));
              setDeleteOpen(true);
            }
          : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, isSuperAdmin]
  );

  // Use Supabase data directly - already in correct format
  const tableData = invoicesData;

  // Stats from Supabase data - use correct DB column names
  const totalRevenue = invoicesData.reduce(
    (acc: number, inv) => acc + (inv.status === 'PAID' ? inv.total || 0 : 0),
    0
  );
  const pendingAmount = invoicesData.reduce(
    (acc: number, inv) => acc + (inv.status === 'ISSUED' ? inv.total || 0 : 0),
    0
  );
  const overdueAmount = invoicesData.reduce(
    (acc: number, inv) => acc + (inv.status === 'OVERDUE' ? inv.total || 0 : 0),
    0
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader title="Invoices" description="Manage invoices, billing, and payment gateways." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Invoices
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-none">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground font-mono leading-none">
            {invoicesData.length}
          </div>
        </Card>

        <Card className="p-6 border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Revenue (Paid)
            </div>
            <div className="p-2 bg-status-success/10 text-status-success rounded-none">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-bold text-foreground font-mono leading-none truncate"
            title={formatCurrency(totalRevenue)}
          >
            {formatCurrency(totalRevenue)}
          </div>
        </Card>

        <Card className="p-6 border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending
            </div>
            <div className="p-2 bg-status-warning/10 text-status-warning rounded-none">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-bold text-foreground font-mono leading-none truncate"
            title={formatCurrency(pendingAmount)}
          >
            {formatCurrency(pendingAmount)}
          </div>
        </Card>

        <Card className="p-6 border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Overdue
            </div>
            <div className="p-2 bg-status-error/10 text-status-error rounded-none">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-bold text-foreground font-mono leading-none truncate"
            title={formatCurrency(overdueAmount)}
          >
            {formatCurrency(overdueAmount)}
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
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingInvoice(null);
        }}
        title={
          editingInvoice ? `Edit Invoice ${editingInvoice.invoice_no}` : 'Generate New Invoice'
        }
        size="4xl"
      >
        <CreateInvoiceForm
          onSuccess={onInvoiceCreated}
          onCancel={() => {
            setIsCreateOpen(false);
            setEditingInvoice(null);
          }}
          initialData={editingInvoice || undefined}
        />
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={!!successData}
        onClose={() => setSuccessData(null)}
        title="Invoice Created Successfully"
        size="md"
      >
        {successData && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-status-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ready for Dispatch</h3>
              <p className="text-muted-foreground text-sm">
                Invoice {successData.invoice.invoiceNumber} and AWB {successData.invoice.awb}{' '}
                generated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" onClick={(e) => handleDownloadInvoice(successData.invoice, e)}>
                <FileText className="w-5 h-5 mr-2" /> Download Invoice
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={(e) => handleDownloadLabel(successData.invoice, e)}
              >
                <Printer className="w-5 h-5 mr-2" /> Print Label
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3 uppercase font-bold tracking-wider">
                Share with Customer
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  className="text-status-success border border-status-success/30 hover:bg-status-success/10"
                  onClick={() => handleShareWhatsapp(successData.invoice)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  className="text-status-info border border-status-info/30 hover:bg-status-info/10"
                  onClick={() => handleShareEmail(successData.invoice)}
                >
                  <Mail className="w-5 h-5 mr-2" /> Email
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Detail View Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => {
          setViewInvoice(null);
          setViewShipment(undefined);
        }}
        title="Invoice Details"
        size="4xl"
      >
        {viewInvoice && (
          <InvoiceDetails
            invoice={viewInvoice}
            shipment={viewShipment}
            onClose={() => {
              setViewInvoice(null);
              setViewShipment(undefined);
            }}
            onDownloadInvoice={handleDownloadInvoice}
            onDownloadLabel={handleDownloadLabel}
            onMarkPaid={(id) => handleStatusUpdate(id, 'PAID')}
            onCancel={(id) => handleStatusUpdate(id, 'CANCELLED')}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <CrudDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={isSuperAdmin ? 'Permanently Delete Invoice?' : 'Cancel invoice?'}
        description={
          isSuperAdmin
            ? `This will PERMANENTLY delete invoice "${rowToDelete?.invoiceNumber ?? ''}". This action cannot be undone.`
            : `This will cancel invoice "${rowToDelete?.invoiceNumber ?? ''}".`
        }
        onConfirm={handleDelete}
        confirmLabel={isSuperAdmin ? 'Delete Permanently' : 'Cancel Invoice'}
      />

      {/* Inline Label Preview Dialog */}
      <LabelPreviewDialog
        shipmentData={labelPreviewData}
        open={labelPreviewOpen}
        onOpenChange={setLabelPreviewOpen}
      />
    </div>
  );
};
