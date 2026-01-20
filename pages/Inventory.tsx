import React, { useState } from 'react';
import { Card, Table, Th, Td, Badge, Input, Button } from '../components/ui/CyberComponents';
import { useShipments } from '../hooks/useShipments';
import { Search, Warehouse } from 'lucide-react';
import { HubLocation } from '../types';
import { HUBS } from '../lib/constants';
import { TableSkeleton } from '../components/ui/skeleton';

export const Inventory: React.FC = () => {
    const { data: shipments = [], isLoading } = useShipments();
    const [filterHub, setFilterHub] = useState<HubLocation | 'ALL'>('ALL');
    const [search, setSearch] = useState('');

    // Inventory Logic:
    // Shipments are "In Inventory" if they are at a hub and NOT in transit/delivered.
    const getInventoryLocation = (s: { status: string; origin_hub_id: string; destination_hub_id: string }): HubLocation | null => {
        // Map hub IDs to hub names based on HUBS constant
        const getHubLocationFromId = (hubId: string): HubLocation | null => {
            const hubEntry = Object.entries(HUBS).find(([_, hub]) => hub.uuid === hubId);
            return hubEntry ? hubEntry[0] as HubLocation : null;
        };

        const originHubLocation = getHubLocationFromId(s.origin_hub_id);
        const destHubLocation = getHubLocationFromId(s.destination_hub_id);

        if (['CREATED', 'RECEIVED_AT_ORIGIN', 'LOADED_FOR_LINEHAUL'].includes(s.status)) return originHubLocation;
        if (['RECEIVED_AT_DEST_HUB', 'OUT_FOR_DELIVERY'].includes(s.status)) return destHubLocation;
        if (['EXCEPTION'].includes(s.status)) return originHubLocation;
        return null;
    };

    // Helper to determine bucket
    const getAgingBucket = (createdAt: string) => {
        const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
        if (hours < 6) return '0-6h';
        if (hours < 12) return '6-12h';
        if (hours < 24) return '12-24h';
        return '24h+';
    };

    const bucketColor = (bucket: string) => {
        switch (bucket) {
            case '0-6h': return 'text-green-500';
            case '6-12h': return 'text-yellow-500';
            case '12-24h': return 'text-orange-500';
            case '24h+': return 'text-red-500 font-bold';
            default: return 'text-slate-500';
        }
    };

    const inventoryItems = shipments
        .filter(s => getInventoryLocation(s) !== null)
        .filter(s => filterHub === 'ALL' || getInventoryLocation(s) === filterHub)
        .filter(s => s.awb_number.toLowerCase().includes(search.toLowerCase()) || (s.customer?.name || '').toLowerCase().includes(search.toLowerCase()));

    // Stats
    const stats = {
        total: inventoryItems.length,
        critical: inventoryItems.filter(s => getAgingBucket(s.created_at) === '24h+').length
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time stock view across hub network.</p>
                    </div>
                </div>
                <Card>
                    <TableSkeleton rows={5} columns={6} />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time stock view across hub network.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={filterHub === 'ALL' ? 'primary' : 'secondary'} onClick={() => setFilterHub('ALL')}>All Hubs</Button>
                    <Button variant={filterHub === 'IMPHAL' ? 'primary' : 'secondary'} onClick={() => setFilterHub('IMPHAL')}>Imphal</Button>
                    <Button variant={filterHub === 'NEW_DELHI' ? 'primary' : 'secondary'} onClick={() => setFilterHub('NEW_DELHI')}>New Delhi</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
                <Card className="p-4 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total In Stock</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.total} Pkgs</span>
                </Card>
                <Card className="p-4 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Aging Critical (24h+)</span>
                    <span className="text-xl font-bold text-red-500">{stats.critical} Pkgs</span>
                </Card>
            </div>

            <Card>
                <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search AWB..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <thead>
                        <tr>
                            <Th>AWB</Th>
                            <Th>Packages</Th>
                            <Th>Weight</Th>
                            <Th>Location Hub</Th>
                            <Th>Status</Th>
                            <Th>Aging</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-500">No items currently in inventory matching filters.</td></tr>
                        ) : (
                            inventoryItems.map((s) => {
                                const location = getInventoryLocation(s);
                                const hubName = location ? HUBS[location].name : 'Unknown';
                                const bucket = getAgingBucket(s.created_at);

                                return (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <Td><span className="font-mono text-slate-900 dark:text-white font-bold">{s.awb_number}</span></Td>
                                        <Td><span className="font-mono">{s.package_count}</span></Td>
                                        <Td>{s.total_weight} kg</Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <Warehouse className="w-4 h-4 text-slate-500" />
                                                {hubName}
                                            </div>
                                        </Td>
                                        <Td>
                                            <Badge variant="outline">{s.status.replace(/_/g, ' ')}</Badge>
                                        </Td>
                                        <Td>
                                            <span className={`font-mono font-bold ${bucketColor(bucket)}`}>
                                                {bucket}
                                            </span>
                                        </Td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};
