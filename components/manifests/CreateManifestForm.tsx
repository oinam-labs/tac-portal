import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../ui/CyberComponents';
import { HUBS, SHIPMENT_MODES } from '../../lib/constants';
import { useManifestStore } from '../../store/manifestStore';
import { Truck, Plane, CheckSquare, Square } from 'lucide-react';

const schema = z.object({
    originHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    destinationHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    type: z.enum(['AIR', 'TRUCK']),
    driverName: z.string().optional(),
    vehicleId: z.string().optional(),
    carrier: z.string().optional(),
    flightNumber: z.string().optional(),
    selectedShipments: z.array(z.string())
}).refine(data => data.originHub !== data.destinationHub, {
    message: "Origin and Destination cannot be the same",
    path: ["destinationHub"]
});

type FormData = z.infer<typeof schema>;

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateManifestForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    const { createManifest, addShipmentsToManifest, fetchAvailableShipments, availableShipments, isLoading } = useManifestStore();

    const { register, handleSubmit, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            originHub: 'IMPHAL',
            destinationHub: 'NEW_DELHI',
            type: 'TRUCK',
            selectedShipments: []
        }
    });

    const origin = watch('originHub');
    const dest = watch('destinationHub');
    const type = watch('type');
    const selected = watch('selectedShipments');

    useEffect(() => {
        fetchAvailableShipments(origin, dest);
        setValue('selectedShipments', []); // Reset selection on route change
    }, [origin, dest]);

    const toggleSelection = (id: string) => {
        const current = selected || [];
        if (current.includes(id)) {
            setValue('selectedShipments', current.filter(i => i !== id));
        } else {
            setValue('selectedShipments', [...current, id]);
        }
    };

    const onSubmit = async (data: FormData) => {
        // 1. Create Manifest
        const vehicleMeta = data.type === 'TRUCK'
            ? { driverName: data.driverName, vehicleId: data.vehicleId }
            : { carrier: data.carrier, flightNumber: data.flightNumber };

        await createManifest({
            originHub: data.originHub,
            destinationHub: data.destinationHub,
            type: data.type,
            vehicleMeta
        });

        // 2. Add Shipments (Wait for store refresh or grab ID - in mock we grab latest from DB or rely on internal logic. 
        // For simplicity in this mock, createManifest pushes to top of list, so we grab [0]. 
        // In real app, createManifest returns the ID.)

        // However, in our mock store, we don't get ID back easily without refactor. 
        // Let's assume we can fetch the latest one created matching ref. 
        // Or better, let's just make createManifest handle shipmentIds if we passed them.

        // Refactor: We'll do it in two steps by finding the latest one created.
        // A robust way in a mock:
        // We will assume the store's "manifests[0]" is the new one after creation.

        const latestManifest = useManifestStore.getState().manifests[0];
        if (data.selectedShipments.length > 0 && latestManifest) {
            await addShipmentsToManifest(latestManifest.id, data.selectedShipments);
        }

        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">ORIGIN</label>
                    <select {...register('originHub')} className="w-full bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border rounded-lg px-4 py-2">
                        {Object.values(HUBS).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">DESTINATION</label>
                    <select {...register('destinationHub')} className="w-full bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border rounded-lg px-4 py-2">
                        {Object.values(HUBS).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-mono text-slate-500 mb-1">TRANSPORT MODE</label>
                <div className="grid grid-cols-2 gap-2">
                    {SHIPMENT_MODES.map(mode => (
                        <label key={mode.id} className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center text-xs transition-all ${type === mode.id ? 'bg-cyber-accent/10 border-cyber-neon text-cyber-neon' : 'border-cyber-border'}`}>
                            <input type="radio" value={mode.id} {...register('type')} className="hidden" />
                            {mode.id === 'AIR' ? <Plane className="w-4 h-4 mb-1" /> : <Truck className="w-4 h-4 mb-1" />}
                            {mode.label}
                        </label>
                    ))}
                </div>
            </div>

            {type === 'TRUCK' ? (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">DRIVER NAME</label>
                        <Input {...register('driverName')} placeholder="e.g. John Doe" />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">VEHICLE ID</label>
                        <Input {...register('vehicleId')} placeholder="e.g. WB-02-1234" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">CARRIER</label>
                        <Input {...register('carrier')} placeholder="e.g. Air India" />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">FLIGHT NO</label>
                        <Input {...register('flightNumber')} placeholder="e.g. AI-882" />
                    </div>
                </div>
            )}

            <div className="border rounded-lg border-cyber-border overflow-hidden">
                <div className="bg-slate-100 dark:bg-white/5 p-2 text-xs font-bold border-b border-cyber-border flex justify-between">
                    <span>AVAILABLE SHIPMENTS FOR ROUTE</span>
                    <span>{selected.length} Selected</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                    {availableShipments.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No eligible shipments found for this route.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-xs text-slate-500 border-b border-cyber-border/50">
                                    <th className="p-2 w-10"></th>
                                    <th className="p-2">AWB</th>
                                    <th className="p-2">Weight</th>
                                    <th className="p-2">Svc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableShipments.map(s => (
                                    <tr key={s.id} onClick={() => toggleSelection(s.id)} className="hover:bg-cyber-accent/5 cursor-pointer border-b border-cyber-border/30 last:border-0">
                                        <td className="p-2 text-center">
                                            {selected.includes(s.id)
                                                ? <CheckSquare className="w-4 h-4 text-cyber-neon" />
                                                : <Square className="w-4 h-4 text-slate-400" />}
                                        </td>
                                        <td className="p-2 font-mono">{s.awb}</td>
                                        <td className="p-2">{s.totalWeight.chargeable}kg</td>
                                        <td className="p-2 text-xs">{s.serviceLevel.substring(0, 3)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Manifest'}
                </Button>
            </div>
        </form>
    );
};
