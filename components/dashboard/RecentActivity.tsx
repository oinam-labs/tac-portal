import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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
                    <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                </div>
                <TableSkeleton rows={5} columns={4} />
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-2 h-full border-border/50 shadow-sm">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground">Live shipment updates</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.hash = '#/shipments'}>View All</Button>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID / Tracking</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentShipments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No shipments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentShipments.map((shipment) => (
                                <TableRow key={shipment.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-foreground">{shipment.awb_number}</div>
                                        <div className="text-xs text-muted-foreground font-mono">ID: {shipment.id.slice(0, 8)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{shipment.origin_hub?.name || 'Origin'}</div>
                                        <div className="text-xs text-muted-foreground">to {shipment.destination_hub?.name || 'Destination'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium ${STATUS_COLORS[shipment.status as keyof typeof STATUS_COLORS] || ''}`}>
                                            {shipment.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(shipment.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};
