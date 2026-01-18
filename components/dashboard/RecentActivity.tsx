import React, { useState, useEffect } from 'react';
import { Card, Table, Th, Td, Badge, Button } from '../ui/CyberComponents';
import { Shipment } from '../../types';
import { STATUS_COLORS } from '../../lib/design-tokens';
import { HUBS } from '../../lib/constants';
import { db } from '../../lib/mock-db';
import { TableSkeleton } from '../ui/skeleton';

export const RecentActivity: React.FC = () => {
    const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = () => {
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const all = db.getShipments();
            const sorted = [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRecentShipments(sorted.slice(0, 5));
            setIsLoading(false);
        }, 300);
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(() => {
            const all = db.getShipments();
            const sorted = [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRecentShipments(sorted.slice(0, 5));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                            <Th>ETA</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentShipments.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-4 text-slate-500">No shipments found.</td></tr>
                        ) : (
                            recentShipments.map((shipment) => (
                                <tr key={shipment.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <Td>
                                        <div className="font-mono font-bold text-slate-900 dark:text-white">{shipment.id}</div>
                                        <div className="text-xs text-slate-500">{shipment.awb}</div>
                                    </Td>
                                    <Td>
                                        <div className="text-slate-700 dark:text-white">{HUBS[shipment.originHub]?.name || shipment.originHub}</div>
                                        <div className="text-xs text-slate-500">to {HUBS[shipment.destinationHub]?.name || shipment.destinationHub}</div>
                                    </Td>
                                    <Td>
                                        <Badge className={STATUS_COLORS[shipment.status as keyof typeof STATUS_COLORS] || ''}>
                                            {shipment.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </Td>
                                    <Td className="font-mono text-xs">{shipment.eta}</Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </Card>
    );
};
