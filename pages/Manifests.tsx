/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useState, useMemo } from 'react';
import { Card, Button } from '../components/ui/CyberComponents';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/domain/StatusBadge';
import { KPICard } from '../components/domain/KPICard';
import { ColumnDef } from '@tanstack/react-table';
import { useManifests, useUpdateManifestStatus, ManifestWithRelations } from '../hooks/useManifests';
import { useRealtimeManifests } from '../hooks/useRealtime';
import { ManifestBuilder } from '../components/manifests/ManifestBuilder/ManifestBuilder';
import { Truck, Plane, Play, CheckCircle, Package, Weight, Scan } from 'lucide-react';

export const Manifests: React.FC = () => {
    const { data: manifests = [] } = useManifests();
    const updateStatusMutation = useUpdateManifestStatus();
    const [isEnterpriseOpen, setIsEnterpriseOpen] = useState(false);
    const [selectedManifestId, setSelectedManifestId] = useState<string | null>(null);

    // Enable realtime updates
    useRealtimeManifests();

    const handleStatusChange = async (id: string, newStatus: 'DEPARTED' | 'ARRIVED') => {
        await updateStatusMutation.mutateAsync({ id, status: newStatus });
    };

    const handleEditManifest = (id: string) => {
        setSelectedManifestId(id);
        setIsEnterpriseOpen(true);
    };

    const columns: ColumnDef<ManifestWithRelations>[] = useMemo(() => [
        {
            accessorKey: 'manifest_no',
            header: 'Reference',
            cell: ({ row }) => (
                <span className="font-mono font-bold text-white">{row.getValue('manifest_no')}</span>
            ),
        },
        {
            id: 'transport',
            header: 'Transport',
            cell: ({ row }) => {
                const meta = row.original.vehicle_meta as any;
                const flightLabel = row.original.flight_number ?? meta?.flight_no ?? meta?.flightNumber ?? 'N/A';
                const carrierLabel = row.original.airline_code ?? meta?.carrier ?? '';
                const vehicleLabel = row.original.vehicle_number ?? meta?.vehicle_no ?? meta?.vehicleId ?? 'N/A';
                const driverLabel = row.original.driver_name ?? meta?.driver_name ?? meta?.driverName ?? 'N/A';
                return (
                    <div className="flex items-center gap-2">
                        {row.original.type === 'AIR' ? (
                            <Plane className="w-4 h-4 text-cyan-400" />
                        ) : (
                            <Truck className="w-4 h-4 text-amber-400" />
                        )}
                        <div>
                            <span className="font-medium text-white">
                                {row.original.type === 'AIR'
                                    ? flightLabel
                                    : driverLabel}
                            </span>
                            <div className="text-xs text-muted-foreground">
                                {row.original.type === 'AIR'
                                    ? carrierLabel
                                    : vehicleLabel}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'route',
            header: 'Route',
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.from_hub?.code || '?'} → {row.original.to_hub?.code || '?'}
                </span>
            ),
        },
        {
            id: 'load',
            header: 'Load',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold">{row.original.total_shipments} shipments</div>
                    <div className="text-xs text-muted-foreground">{row.original.total_weight} kg</div>
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
                if (m.status === 'CLOSED') {
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
                return <Button size="sm" variant="ghost" onClick={() => handleEditManifest(m.id)}>View</Button>;
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    const openCount = manifests.filter(m => ['DRAFT', 'OPEN', 'BUILDING'].includes(m.status)).length;
    const transitCount = manifests.filter(m => m.status === 'DEPARTED').length;
    const transitWeight = manifests.filter(m => m.status === 'DEPARTED').reduce((acc, m) => acc + (m.total_weight || 0), 0);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Fleet Manifests</h1>
                    <p className="text-muted-foreground text-sm">Manage linehaul movements between hubs.</p>
                </div>
                <Button onClick={() => { setSelectedManifestId(null); setIsEnterpriseOpen(true); }} variant="primary">
                    <Scan className="w-4 h-4 mr-2" /> Build Manifest
                </Button>
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
                    searchKey="manifest_no"
                    searchPlaceholder="Search manifests..."
                    pageSize={10}
                />
            </Card>

            <ManifestBuilder
                open={isEnterpriseOpen}
                onOpenChange={setIsEnterpriseOpen}
                initialManifestId={selectedManifestId}
                onComplete={(manifestId: string) => {
                    console.log('Manifest created:', manifestId);
                    setIsEnterpriseOpen(false);
                }}
            />
        </div>
    );
};
