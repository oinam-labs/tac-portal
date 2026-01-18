import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input } from '../components/ui/CyberComponents';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/domain/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { Filter, Download, Plus, Search, Eye, MoreHorizontal, Plane, Truck } from 'lucide-react';
import { useShipmentStore } from '../store/shipmentStore';
import { Modal } from '../components/ui/Modal';
import { CreateShipmentForm } from '../components/shipments/CreateShipmentForm';
import { ShipmentDetails } from '../components/shipments/ShipmentDetails';
import { HUBS } from '../lib/constants';
import { Shipment } from '../types';
import { format } from 'date-fns';

export const Shipments: React.FC = () => {
    const { shipments, fetchShipments, fetchCustomers } = useShipmentStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

    useEffect(() => {
        fetchShipments();
        fetchCustomers();
    }, []);

    const columns: ColumnDef<Shipment>[] = useMemo(() => [
        {
            accessorKey: 'awb',
            header: 'AWB',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.mode === 'AIR' ? (
                        <Plane className="w-4 h-4 text-cyan-400" />
                    ) : (
                        <Truck className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-mono font-bold text-cyber-accent">{row.getValue('awb')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'customerName',
            header: 'Customer',
        },
        {
            id: 'route',
            header: 'Route',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-semibold">{HUBS[row.original.originHub]?.code || row.original.originHub}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-semibold">{HUBS[row.original.destinationHub]?.code || row.original.destinationHub}</span>
                </div>
            ),
        },
        {
            accessorKey: 'serviceLevel',
            header: 'Service',
            cell: ({ row }) => (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    row.getValue('serviceLevel') === 'EXPRESS' 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-slate-500/20 text-slate-400'
                }`}>
                    {(row.getValue('serviceLevel') as string)?.substring(0, 3)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        },
        {
            accessorKey: 'eta',
            header: 'ETA',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-slate-400">{row.getValue('eta')}</span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedShipment(row.original)}
                >
                    <Eye className="w-4 h-4 mr-1" /> View
                </Button>
            ),
        },
    ], []);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shipments</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and track all logistics orders.</p>
                </div>
                <div className="flex gap-3">
                     <Button variant="ghost"><Download className="w-4 h-4 mr-2" /> Export</Button>
                     <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Shipment
                     </Button>
                </div>
            </div>

            <Card className="p-6">
                <DataTable 
                    columns={columns}
                    data={shipments}
                    searchKey="awb"
                    searchPlaceholder="Search by AWB..."
                    pageSize={10}
                />
            </Card>

            {/* Create Wizard Modal */}
            <Modal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Shipment"
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
                        shipment={selectedShipment} 
                        onClose={() => setSelectedShipment(null)} 
                    />
                )}
            </Modal>
        </div>
    );
};
