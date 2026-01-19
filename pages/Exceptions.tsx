import React, { useState, useMemo } from 'react';
import { Card, Button, Input } from '../components/ui/CyberComponents';
import { DataTable } from '../components/ui/data-table';
import { StatusBadge } from '../components/domain/StatusBadge';
import { KPICard } from '../components/domain/KPICard';
import { ColumnDef } from '@tanstack/react-table';
import { useExceptions, useCreateException, useResolveException, ExceptionWithRelations } from '../hooks/useExceptions';
import { useRealtimeExceptions } from '../hooks/useRealtime';
import { AlertTriangle, AlertCircle, CheckCircle, Plus, ShieldAlert, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const raiseSchema = z.object({
    awb: z.string().min(1, "AWB Required"),
    type: z.enum(['DAMAGE', 'SHORTAGE', 'MISROUTE', 'DELAY', 'CUSTOMER_REFUSAL', 'ADDRESS_ISSUE', 'OTHER']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    description: z.string().min(5, "Description required")
});

const resolveSchema = z.object({
    note: z.string().min(5, "Resolution note required")
});

type RaiseFormData = z.infer<typeof raiseSchema>;
type ResolveFormData = z.infer<typeof resolveSchema>;

export const Exceptions: React.FC = () => {
    const { data: exceptions = [], isLoading } = useExceptions();
    const createMutation = useCreateException();
    const resolveMutation = useResolveException();
    const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
    const [selectedException, setSelectedException] = useState<ExceptionWithRelations | null>(null);

    // Enable realtime updates
    useRealtimeExceptions();

    const { register: registerRaise, handleSubmit: handleSubmitRaise, reset: resetRaise } = useForm<RaiseFormData>({
        resolver: zodResolver(raiseSchema)
    });

    const { register: registerResolve, handleSubmit: handleSubmitResolve, reset: resetResolve } = useForm<ResolveFormData>({
        resolver: zodResolver(resolveSchema)
    });

    const columns: ColumnDef<ExceptionWithRelations>[] = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('id')}</span>,
        },
        {
            id: 'awb',
            header: 'AWB',
            cell: ({ row }) => <span className="font-mono font-bold text-cyber-accent">{row.original.shipment?.awb_number || 'N/A'}</span>,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="font-medium">{row.getValue('type')}</span>,
        },
        {
            accessorKey: 'severity',
            header: 'Severity',
            cell: ({ row }) => <StatusBadge status={row.getValue('severity')} />,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <span className="max-w-xs truncate block">{row.getValue('description')}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Reported',
            cell: ({ row }) => (
                <span className="text-xs text-slate-400">
                    {format(new Date(row.getValue('created_at')), 'dd MMM HH:mm')}
                </span>
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
                const ex = row.original;
                if (ex.status === 'OPEN') {
                    return (
                        <Button variant="secondary" size="sm" onClick={() => setSelectedException(ex)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                        </Button>
                    );
                }
                return null;
            },
        },
    ], []);

    const openCount = exceptions.filter(e => e.status === 'OPEN').length;
    const criticalCount = exceptions.filter(e => e.severity === 'CRITICAL' && e.status === 'OPEN').length;

    const onRaiseSubmit = async (data: RaiseFormData) => {
        // Look up shipment by AWB
        const { data: shipmentData } = await (supabase
            .from('shipments') as any)
            .select('id')
            .eq('awb_number', data.awb)
            .single();

        if (!shipmentData) {
            alert('Shipment not found');
            return;
        }

        const shipment = shipmentData as { id: string };
        await createMutation.mutateAsync({
            shipment_id: shipment.id,
            awb_number: data.awb,
            type: data.type as ExceptionWithRelations['type'],
            severity: data.severity as ExceptionWithRelations['severity'],
            description: data.description
        });
        setIsRaiseModalOpen(false);
        resetRaise();
    };

    const onResolveSubmit = async (data: ResolveFormData) => {
        if (selectedException) {
            await resolveMutation.mutateAsync({ id: selectedException.id, resolution: data.note });
            setSelectedException(null);
            resetResolve();
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                    Exceptions & Alerts
                </h1>
                <Button onClick={() => setIsRaiseModalOpen(true)} variant="danger">
                    <Plus className="w-4 h-4 mr-2" /> Raise Exception
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Open Exceptions"
                    value={openCount}
                    icon={<AlertCircle className="w-5 h-5" />}
                    trend={openCount > 0 ? 'down' : 'neutral'}
                />
                <KPICard
                    title="Critical Issues"
                    value={criticalCount}
                    icon={<ShieldAlert className="w-5 h-5" />}
                    trend={criticalCount > 0 ? 'down' : 'neutral'}
                />
                <KPICard
                    title="Total Exceptions"
                    value={exceptions.length}
                    icon={<Clock className="w-5 h-5" />}
                />
            </div>

            <Card className="p-6">
                <DataTable
                    columns={columns}
                    data={exceptions}
                    searchKey="awb"
                    searchPlaceholder="Search by AWB..."
                    pageSize={10}
                />
            </Card>

            {/* Raise Modal */}
            <Modal isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)} title="Raise New Exception">
                <form onSubmit={handleSubmitRaise(onRaiseSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">AWB NUMBER</label>
                        <Input {...registerRaise('awb')} placeholder="Scan or type AWB" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">TYPE</label>
                            <select {...registerRaise('type')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="DAMAGED">Damaged</option>
                                <option value="LOST">Lost</option>
                                <option value="DELAYED">Delayed</option>
                                <option value="CUSTOMS">Customs</option>
                                <option value="MISROUTED">Misrouted</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">SEVERITY</label>
                            <select {...registerRaise('severity')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">DESCRIPTION</label>
                        <Input {...registerRaise('description')} placeholder="Details of the issue..." />
                    </div>
                    <Button type="submit" variant="danger" className="w-full mt-4" disabled={isLoading}>
                        {isLoading ? 'Reporting...' : 'Report Exception'}
                    </Button>
                </form>
            </Modal>

            {/* Resolve Modal */}
            <Modal isOpen={!!selectedException} onClose={() => setSelectedException(null)} title="Resolve Exception">
                <form onSubmit={handleSubmitResolve(onResolveSubmit)} className="space-y-4">
                    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded text-sm mb-4">
                        <div className="font-bold">Exception: {selectedException?.type}</div>
                        <div>{selectedException?.description}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">RESOLUTION NOTE</label>
                        <Input {...registerResolve('note')} placeholder="How was this resolved?" />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                        {isLoading ? 'Resolving...' : 'Confirm Resolution'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};
