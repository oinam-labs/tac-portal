/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/page-header';

// CRUD Components
import { CrudTable } from '@/components/crud/CrudTable';
import { CrudDeleteDialog } from '@/components/crud/CrudDeleteDialog';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/TableSkeleton';

// Domain Components
import { CreateShipmentForm } from '@/components/shipments/CreateShipmentForm';
import { ShipmentDetails } from '@/components/shipments/ShipmentDetails';

// Hooks & Data
import { useShipments, useHardDeleteShipment, ShipmentWithRelations } from '@/hooks/useShipments';
import { getShipmentsColumns } from '@/components/shipments/shipments.columns';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';

// Types
import { Shipment } from '@/types';

// Adapter: Convert ShipmentWithRelations to Shipment type for ShipmentDetails
function adaptToShipment(s: ShipmentWithRelations): Shipment {
  return {
    id: s.id,
    awb: s.awb_number,
    customerId: s.customer_id,
    customerName: s.customer?.name || '',
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
    eta: '',
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    consignor: {
      name: s.sender_name || '',
      phone: s.sender_phone || '',
      address: typeof s.sender_address === 'string' ? s.sender_address : '',
    },
    consignee: {
      name: s.receiver_name || '',
      phone: s.receiver_phone || '',
      address: typeof s.receiver_address === 'string' ? s.receiver_address : '',
    },
    declaredValue: s.declared_value ?? undefined,
    contentsDescription: s.special_instructions || 'General Cargo',
    bookingDate: s.created_at,
  };
}

export const Shipments: React.FC = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Search state
  // Search state synced with URL
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync URL -> State (External navigation)
  useEffect(() => {
    if (querySearch !== searchTerm) {
      setSearchTerm(querySearch);
    }
  }, [querySearch]);

  // Sync State -> URL (User typing)
  useEffect(() => {
    if (debouncedSearch !== querySearch) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (debouncedSearch) newParams.set('search', debouncedSearch);
        else newParams.delete('search');
        return newParams;
      }, { replace: true });
    }
  }, [debouncedSearch]);

  // Data fetching
  const {
    data: shipments,
    isLoading,
    error,
    refetch,
  } = useShipments({ search: debouncedSearch }); // Pass search term

  // Only Super Admin can delete
  const hardDeleteMutation = useHardDeleteShipment();

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
        onDelete: isSuperAdmin ? (row) => {
          setRowToDelete(row);
          setDeleteOpen(true);
        } : undefined,
      }),
    [isSuperAdmin]
  );

  // Handlers
  const handleDelete = async () => {
    if (!rowToDelete) return;

    if (isSuperAdmin) {
      await hardDeleteMutation.mutateAsync(rowToDelete.id);
    }
    // No fallback call for regular users as they shouldn't reach here

    setRowToDelete(null);
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader title="Shipments" description="Manage and track all logistics orders." />

      {/* Table with CRUD */}
      <CrudTable
        columns={columns}
        data={shipments ?? []}
        searchKey="awb_number" // Keep for prop requirement, but onSearch overrides behavior

        searchPlaceholder="Search by AWB, Invoice, Name, Phone..."
        onSearch={setSearchTerm} // Pass handleSearch
        searchValue={searchTerm} // Sync input value
        isLoading={isLoading}
        loadingState={<TableSkeleton />}
        emptyState={({ isFiltered }) =>
          error ? (
            <ErrorState
              title="Unable to load shipments"
              description="The system could not retrieve shipment data. Please retry."
              onRetry={() => refetch()}
            />
          ) : (
            <EmptyState
              title="No shipments found"
              description={
                isFiltered || debouncedSearch
                  ? 'No shipments match the selected filters.'
                  : 'Shipments will appear here once created or imported.'
              }
              actionLabel={isFiltered || debouncedSearch ? undefined : 'Create shipment'}
              onAction={isFiltered || debouncedSearch ? undefined : () => setIsCreateModalOpen(true)}
            />
          )
        }
        toolbar={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                if (shipments) {
                  import('@/lib/export').then(({ exportToCSV }) => {
                    // Flatten data for export
                    const dataToExport = shipments.map((s) => ({
                      AWB: s.awb_number,
                      Customer: s.customer?.name,
                      Origin: s.origin_hub?.code || s.origin_hub_id,
                      Destination: s.destination_hub?.code || s.destination_hub_id,
                      Status: s.status,
                      Mode: s.mode,
                      Packages: s.package_count,
                      Weight: s.total_weight,
                      Created: new Date(s.created_at).toLocaleDateString(),
                    }));
                    exportToCSV(dataToExport, `shipments-${new Date().toISOString().split('T')[0]}`);
                  });
                }
              }}
              disabled={!shipments || shipments.length === 0}
            >
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
        title={isSuperAdmin ? "Permanently Delete Shipment?" : "Archive Shipment?"}
        description={isSuperAdmin
          ? `This will PERMANENTLY delete shipment "${rowToDelete?.awb_number ?? ''}" and all related data. This action cannot be undone.`
          : `This will remove shipment "${rowToDelete?.awb_number ?? ''}" from your view.`}
        onConfirm={handleDelete}
        confirmLabel={isSuperAdmin ? "Delete Permanently" : "Archive"}
      />
    </div>
  );
};
