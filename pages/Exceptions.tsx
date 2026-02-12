/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '../components/domain/StatusBadge';
import { KPICard } from '../components/domain/KPICard';
import { CrudTable } from '@/components/crud/CrudTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  useExceptions,
  useCreateException,
  useResolveException,
  ExceptionWithRelations,
} from '../hooks/useExceptions';
import { useRealtimeExceptions } from '../hooks/useRealtime';
import { AlertTriangle, AlertCircle, CheckCircle, Plus, ShieldAlert, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

const raiseSchema = z.object({
  awb: z.string().min(1, 'AWB Required'),
  type: z.enum([
    'DAMAGE',
    'SHORTAGE',
    'MISROUTE',
    'DELAY',
    'CUSTOMER_REFUSAL',
    'ADDRESS_ISSUE',
    'OTHER',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(5, 'Description required'),
});

const resolveSchema = z.object({
  note: z.string().min(5, 'Resolution note required'),
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

  const {
    register: registerRaise,
    handleSubmit: handleSubmitRaise,
    reset: resetRaise,
    control: controlRaise,
  } = useForm<RaiseFormData>({
    resolver: zodResolver(raiseSchema),
    defaultValues: {
      type: 'DAMAGE',
      severity: 'MEDIUM',
    },
  });

  const {
    register: registerResolve,
    handleSubmit: handleSubmitResolve,
    reset: resetResolve,
  } = useForm<ResolveFormData>({
    resolver: zodResolver(resolveSchema),
  });

  const columns: ColumnDef<ExceptionWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('id')}</span>,
      },
      {
        id: 'awb',
        header: 'AWB',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-primary">
            {row.original.shipment?.awb_number || 'N/A'}
          </span>
        ),
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
          <span className="text-xs text-muted-foreground">
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
              <Button variant="outline" size="sm" onClick={() => setSelectedException(ex)}>
                <CheckCircle className="w-4 h-4 mr-1" /> Resolve
              </Button>
            );
          }
          return null;
        },
      },
    ],
    []
  );

  const openCount = exceptions.filter((e) => e.status === 'OPEN').length;
  const criticalCount = exceptions.filter(
    (e) => e.severity === 'CRITICAL' && e.status === 'OPEN'
  ).length;

  const onRaiseSubmit = async (data: RaiseFormData) => {
    // Look up shipment by AWB
    const { data: shipmentData } = await (supabase.from('shipments') as any)
      .select('id')
      .eq('awb_number', data.awb)
      .single();

    if (!shipmentData) {
      toast.error('Shipment not found for the given AWB number.');
      return;
    }

    const shipment = shipmentData as { id: string };
    await createMutation.mutateAsync({
      shipment_id: shipment.id,
      awb_number: data.awb,
      type: data.type as ExceptionWithRelations['type'],
      severity: data.severity as ExceptionWithRelations['severity'],
      description: data.description,
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
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="Exceptions & Alerts"
        description="Track and resolve shipment exceptions."
        icon={<AlertTriangle className="text-destructive w-7 h-7" />}
      >
        <Button variant="destructive" onClick={() => setIsRaiseModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Raise Exception
        </Button>
      </PageHeader>

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

      <CrudTable
        columns={columns}
        data={exceptions}
        searchKey="awb"
        searchPlaceholder="Search by AWB..."
        isLoading={isLoading}
        emptyMessage="No exceptions found."
      />

      {/* Raise Modal */}
      <Modal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        title="Raise New Exception"
      >
        <form onSubmit={handleSubmitRaise(onRaiseSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              AWB Number
            </label>
            <Input {...registerRaise('awb')} placeholder="Scan or type AWB" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Type
              </label>
              <Controller
                control={controlRaise}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAMAGE">Damage</SelectItem>
                      <SelectItem value="SHORTAGE">Shortage</SelectItem>
                      <SelectItem value="MISROUTE">Misroute</SelectItem>
                      <SelectItem value="DELAY">Delay</SelectItem>
                      <SelectItem value="CUSTOMER_REFUSAL">Customer Refusal</SelectItem>
                      <SelectItem value="ADDRESS_ISSUE">Address Issue</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Severity
              </label>
              <Controller
                control={controlRaise}
                name="severity"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </label>
            <Input {...registerRaise('description')} placeholder="Details of the issue..." />
          </div>
          <Button type="submit" variant="destructive" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Reporting...' : 'Report Exception'}
          </Button>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={!!selectedException}
        onClose={() => setSelectedException(null)}
        title="Resolve Exception"
      >
        <form onSubmit={handleSubmitResolve(onResolveSubmit)} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm mb-4 border border-border">
            <div className="font-medium text-foreground">Exception: {selectedException?.type}</div>
            <div className="text-muted-foreground mt-1">{selectedException?.description}</div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Resolution Note
            </label>
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
