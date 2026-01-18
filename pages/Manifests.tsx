import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button } from '../components/ui/CyberComponents';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/domain/StatusBadge';
import { KPICard } from '../components/domain/KPICard';
import { ColumnDef } from '@tanstack/react-table';
import { useManifestStore } from '../store/manifestStore';
import { Modal } from '../components/ui/Modal';
import { CreateManifestForm } from '../components/manifests/CreateManifestForm';
import { FileText, Truck, Plane, Play, CheckCircle, Package, Weight } from 'lucide-react';
import { HUBS } from '../lib/constants';
import { Manifest } from '../types';

export const Manifests: React.FC = () => {
    const { manifests, fetchManifests, updateManifestStatus } = useManifestStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        fetchManifests();
    }, []);

    const handleStatusChange = async (id: string, newStatus: 'DEPARTED' | 'ARRIVED') => {
        await updateManifestStatus(id, newStatus);
    };

    const columns: ColumnDef<Manifest>[] = useMemo(() => [
        {
            accessorKey: 'reference',
            header: 'Reference',
            cell: ({ row }) => (
                <span className="font-mono font-bold text-white">{row.getValue('reference')}</span>
            ),
        },
        {
            id: 'transport',
            header: 'Transport',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.type === 'AIR' ? (
                        <Plane className="w-4 h-4 text-cyan-400" />
                    ) : (
                        <Truck className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                        <span className="font-medium text-white">
                            {row.original.type === 'AIR'
                                ? row.original.vehicleMeta?.flightNumber
                                : row.original.vehicleMeta?.driverName}
                        </span>
                        <div className="text-xs text-slate-500">
                            {row.original.type === 'AIR'
                                ? row.original.vehicleMeta?.carrier
                                : row.original.vehicleMeta?.vehicleId}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'route',
            header: 'Route',
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {HUBS[row.original.originHub]?.code} → {HUBS[row.original.destinationHub]?.code}
                </span>
            ),
        },
        {
            id: 'load',
            header: 'Load',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold">{row.original.shipmentCount} shipments</div>
                    <div className="text-xs text-slate-500">{row.original.totalWeight} kg</div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const m = row.original;
                if (m.status === 'OPEN') {
                    return (
                        <Button size="sm" onClick={() => handleStatusChange(m.id, 'DEPARTED')}>
                            <Play className="w-3 h-3 mr-1" /> Depart
                        </Button>
                    );
                }
                if (m.status === 'DEPARTED') {
                    return (
                        <Button size="sm" variant="secondary" onClick={() => handleStatusChange(m.id, 'ARRIVED')}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Arrive
                        </Button>
                    );
                }
                return <Button size="sm" variant="ghost">View</Button>;
            },
        },
    ], []);

    const openCount = manifests.filter(m => m.status === 'OPEN').length;
    const transitCount = manifests.filter(m => m.status === 'DEPARTED').length;
    const transitWeight = manifests.filter(m => m.status === 'DEPARTED').reduce((acc, m) => acc + m.totalWeight, 0);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fleet Manifests</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage linehaul movements between hubs.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}><FileText className="w-4 h-4 mr-2" /> Create Manifest</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Open Manifests"
                    value={openCount}
                    icon={<Package className="w-5 h-5" />}
                    trend="neutral"
                />
                <KPICard
                    title="In Transit"
                    value={transitCount}
                    icon={<Truck className="w-5 h-5" />}
                    trend="up"
                />
                <KPICard
                    title="Transit Weight"
                    value={`${transitWeight} kg`}
                    icon={<Weight className="w-5 h-5" />}
                />
            </div>

            <Card className="p-6">
                <DataTable
                    columns={columns}
                    data={manifests}
                    searchKey="reference"
                    searchPlaceholder="Search manifests..."
                    pageSize={10}
                />
            </Card>

            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Manifest">
                <CreateManifestForm
                    onSuccess={() => setIsCreateOpen(false)}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Modal>
        </div>
    );
};
