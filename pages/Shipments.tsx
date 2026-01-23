/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useState, useMemo } from 'react';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';

// CRUD Components
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog';

// Domain Components
import { CreateShipmentForm } from '@/components/shipments/CreateShipmentForm';
import { ShipmentDetails } from '@/components/shipments/ShipmentDetails';

// Hooks & Data
import { useShipments, useDeleteShipment, ShipmentWithRelations } from '@/hooks/useShipments';
import { getShipmentsColumns } from '@/components/shipments/shipments.columns';

// Types
import { Shipment } from '@/types';

// Adapter: Convert ShipmentWithRelations to Shipment type for ShipmentDetails
function adaptToShipment(s: ShipmentWithRelations): Shipment {
  return {
    id: s.id,
    awb: s.awb_number,
    customerId: s.customer_id,
    customerName: s.customer?.name || 'Unknown',
    originHub: (s.origin_hub?.code as any) || (s.origin_hub_id as any),
    destinationHub: (s.destination_hub?.code as any) || (s.destination_hub_id as any),
    mode: s.mode,
    serviceLevel: s.service_level,
    status: s.status as any,
    totalPackageCount: s.package_count,
    totalWeight: {
      dead: s.total_weight,
      volumetric: 0,
      chargeable: s.total_weight,
    },
    eta: 'TBD',
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    lastUpdate: 'Synced from DB',
    contentsDescription: 'General Cargo',
    paymentMode: 'PAID',
  };
}

export const Shipments: React.FC = () => {
  // Data fetching
  const { data: shipments = [], isLoading } = useShipments();
  const deleteMutation = useDeleteShipment();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithRelations | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ShipmentWithRelations | null>(null);

  // Table columns with callbacks
  const columns = useMemo(
    () =>
      getShipmentsColumns({
        onView: (row) => setSelectedShipment(row),
        onEdit: (row) => {
          // For now, open view modal - edit form could be added later
          setSelectedShipment(row);
        },
        onDelete: (row) => {
          setRowToDelete(row);
          setDeleteOpen(true);
        },
      }),
    []
  );

  // Handlers
  const handleDelete = async () => {
    if (!rowToDelete) return;
    await deleteMutation.mutateAsync(rowToDelete.id);
    setRowToDelete(null);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
          <p className="text-muted-foreground text-sm">Manage and track all logistics orders.</p>
        </div>
      </div>

      {/* Table with CRUD */}
      <CrudTable
        columns={columns}
        data={shipments}
        searchKey="awb_number"
        searchPlaceholder="Search by AWB..."
        isLoading={isLoading}
        emptyMessage="No shipments found. Create your first shipment to get started."
        toolbar={
          <div className="flex gap-3">
            <Button variant="ghost">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="new-shipment-button"
            >
              <Plus className="w-4 h-4 mr-2" /> New Shipment
            </Button>
          </div>
        }
      />

      {/* Create Wizard Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Shipment"
        data-testid="create-shipment-modal"
      >
        <CreateShipmentForm
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        title="Shipment Details"
      >
        {selectedShipment && (
          <ShipmentDetails
            shipment={adaptToShipment(selectedShipment)}
            onClose={() => setSelectedShipment(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <CrudDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete shipment?"
        description={`This will remove shipment "${rowToDelete?.awb_number ?? ''}" from your records. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};
