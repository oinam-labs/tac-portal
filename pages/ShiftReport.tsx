/**
 * Shift Handover Report Page
 * Comprehensive dashboard for shift handover operations
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { useLastNHoursReport, useExportShiftReport } from '@/hooks/useShiftReport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Package,
    Truck,
    AlertTriangle,
    ScanLine,
    Download,
    Clock,
    ArrowRight,
    XCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

type ShiftDuration = '4' | '8' | '12' | '24';

export default function ShiftReport() {
    const [shiftHours, setShiftHours] = useState<ShiftDuration>('8');
    const [selectedHub] = useState<string | undefined>(undefined);

    const { data: report, isLoading, refetch, isFetching } = useLastNHoursReport(
        parseInt(shiftHours),
        selectedHub,
        true
    );

    const exportMutation = useExportShiftReport();

    const handleExport = () => {
        if (report) {
            exportMutation.mutate(report);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Shift Handover Report</h1>
                    <p className="text-muted-foreground">
                        Operations summary for shift handover
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={shiftHours} onValueChange={(v) => setShiftHours(v as ShiftDuration)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Shift duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="4">Last 4 hours</SelectItem>
                            <SelectItem value="8">Last 8 hours</SelectItem>
                            <SelectItem value="12">Last 12 hours</SelectItem>
                            <SelectItem value="24">Last 24 hours</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button onClick={handleExport} disabled={!report || exportMutation.isPending}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Shift Period Info */}
            {report && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Shift Period:</span>
                            <span className="font-medium">
                                {format(new Date(report.shiftPeriod.start), 'PPp')}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                {format(new Date(report.shiftPeriod.end), 'PPp')}
                            </span>
                            <Badge variant="secondary">
                                {report.shiftPeriod.durationHours} hours
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : report ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Shipments</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{report.shipments.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {report.shipments.created} created, {report.shipments.delivered} delivered
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Manifests</CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{report.manifests.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {report.manifests.closed} closed, {report.manifests.departed} departed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{report.exceptions.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {report.exceptions.resolved} resolved, {report.exceptions.pending} pending
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Scans</CardTitle>
                                <ScanLine className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{report.scans.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {report.scans.uniqueShipments} unique shipments
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipments by Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipments by Status</CardTitle>
                                <CardDescription>Distribution of shipment statuses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(report.shipments.byStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="min-w-[120px] justify-center">
                                                    {status.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(report.shipments.byStatus).length === 0 && (
                                        <p className="text-sm text-muted-foreground">No shipment activity</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Actions</CardTitle>
                                <CardDescription>Items requiring attention for next shift</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                            <span>Open Manifests</span>
                                        </div>
                                        <Badge variant={report.pendingActions.openManifests > 0 ? 'destructive' : 'secondary'}>
                                            {report.pendingActions.openManifests}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <span>Unresolved Exceptions</span>
                                        </div>
                                        <Badge variant={report.pendingActions.unresolvedExceptions > 0 ? 'destructive' : 'secondary'}>
                                            {report.pendingActions.unresolvedExceptions}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-blue-500" />
                                            <span>Awaiting Pickup</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {report.pendingActions.shipmentsAwaitingPickup}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exception Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exception Breakdown</CardTitle>
                                <CardDescription>Exceptions by severity and type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">By Severity</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(report.exceptions.bySeverity).map(([severity, count]) => (
                                                <Badge
                                                    key={severity}
                                                    variant={severity === 'CRITICAL' ? 'destructive' : 'outline'}
                                                >
                                                    {severity}: {count}
                                                </Badge>
                                            ))}
                                            {Object.keys(report.exceptions.bySeverity).length === 0 && (
                                                <span className="text-sm text-muted-foreground">No exceptions</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">By Type</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(report.exceptions.byType).map(([type, count]) => (
                                                <Badge key={type} variant="secondary">
                                                    {type.replace(/_/g, ' ')}: {count}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest operations during shift</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {report.recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm">
                                            <span className="text-muted-foreground whitespace-nowrap">
                                                {format(new Date(activity.time), 'HH:mm')}
                                            </span>
                                            <div className="flex-1">
                                                <p>{activity.description}</p>
                                                {activity.actor && (
                                                    <p className="text-xs text-muted-foreground">
                                                        by {activity.actor}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {report.recentActivity.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No recent activity</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Scan Sources */}
                    {Object.keys(report.scans.bySource).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Scan Sources</CardTitle>
                                <CardDescription>Breakdown of scan event sources</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(report.scans.bySource).map(([source, count]) => (
                                        <div key={source} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                            <ScanLine className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{source}</span>
                                            <Badge variant="secondary">{count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No report data available. Try refreshing.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
