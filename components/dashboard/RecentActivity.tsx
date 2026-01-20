import React from 'react';
import { Card, Table, Th, Td, Badge, Button } from '../ui/CyberComponents';
import { STATUS_COLORS } from '../../lib/design-tokens';
import { useShipments } from '../../hooks/useShipments';
import { TableSkeleton } from '../ui/skeleton';

export const RecentActivity: React.FC = () => {
    // Use Supabase hook instead of mock-db
    const { data: shipments = [], isLoading } = useShipments();

    // Get 5 most recent shipments
    const recentShipments = [...shipments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    if (isLoading && recentShipments.length === 0) {
        return (
            <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                </div>
                <TableSkeleton rows={5} columns={4} />
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-2 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <p className="text-xs text-slate-500">Live shipment updates</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/shipments'}>View All</Button>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <thead>
                        <tr>
                            <Th>ID / Tracking</Th>
                            <Th>Route</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentShipments.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-4 text-slate-500">No shipments found.</td></tr>
                        ) : (
                            recentShipments.map((shipment) => (
                                <tr key={shipment.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <Td>
                                        <div className="font-mono font-bold text-slate-900 dark:text-white">{shipment.awb_number}</div>
                                        <div className="text-xs text-slate-500">ID: {shipment.id.slice(0, 8)}</div>
                                    </Td>
                                    <Td>
                                        <div className="text-slate-700 dark:text-white">{shipment.origin_hub?.name || 'Origin'}</div>
                                        <div className="text-xs text-slate-500">to {shipment.destination_hub?.name || 'Destination'}</div>
                                    </Td>
                                    <Td>
                                        <Badge className={STATUS_COLORS[shipment.status as keyof typeof STATUS_COLORS] || ''}>
                                            {shipment.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </Td>
                                    <Td className="font-mono text-xs">{new Date(shipment.created_at).toLocaleDateString()}</Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </Card>
    );
};
