
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../ui/CyberComponents';
import { HUBS, SHIPMENT_MODES, SERVICE_LEVELS } from '../../lib/constants';
import { useShipmentStore } from '../../store/shipmentStore';
import { Package, Truck, Plane, Zap, Clock, Box } from 'lucide-react';

const schema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    originHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    destinationHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    mode: z.enum(['AIR', 'TRUCK']),
    serviceLevel: z.enum(['STANDARD', 'EXPRESS']),
    packageCount: z.number().min(1),
    weightDead: z.number().min(0.1),
    dimL: z.number().min(1),
    dimW: z.number().min(1),
    dimH: z.number().min(1),
}).refine(data => data.originHub !== data.destinationHub, {
    message: "Origin and Destination cannot be the same",
    path: ["destinationHub"]
});

type FormData = z.infer<typeof schema>;

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateShipmentForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    const { customers, createShipment, isLoading } = useShipmentStore();
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            originHub: 'IMPHAL',
            destinationHub: 'NEW_DELHI',
            mode: 'AIR',
            serviceLevel: 'STANDARD',
            packageCount: 1,
            weightDead: 1.0,
            dimL: 10, dimW: 10, dimH: 10
        }
    });

    const selectedMode = watch('mode');
    const selectedService = watch('serviceLevel');

    const onSubmit = async (data: FormData) => {
        // Volumetric Calculation (Standard L*W*H / 5000 for Air)
        const divisor = data.mode === 'AIR' ? 5000 : 4000; // Mock standard
        const volWeight = (data.dimL * data.dimW * data.dimH) / divisor;
        const chargeable = Math.max(data.weightDead, volWeight);
        
        const customer = customers.find(c => c.id === data.customerId);

        await createShipment({
            customerId: data.customerId,
            customerName: customer?.companyName || customer?.name || 'Unknown',
            originHub: data.originHub,
            destinationHub: data.destinationHub,
            mode: data.mode,
            serviceLevel: data.serviceLevel,
            totalPackageCount: data.packageCount,
            totalWeight: {
                dead: data.weightDead,
                volumetric: parseFloat(volWeight.toFixed(2)),
                chargeable: parseFloat(chargeable.toFixed(2))
            }
        }, []); 
        
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Route Section */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">ORIGIN HUB</label>
                    <select 
                        {...register('originHub')}
                        className="w-full bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border rounded-lg px-4 py-2"
                    >
                        {Object.values(HUBS).map(hub => (
                            <option key={hub.id} value={hub.id}>{hub.name} ({hub.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">DESTINATION HUB</label>
                    <select 
                        {...register('destinationHub')}
                        className="w-full bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border rounded-lg px-4 py-2"
                    >
                        {Object.values(HUBS).map(hub => (
                            <option key={hub.id} value={hub.id}>{hub.name} ({hub.code})</option>
                        ))}
                    </select>
                    {errors.destinationHub && <span className="text-red-500 text-xs">{errors.destinationHub.message}</span>}
                </div>
            </div>

            {/* Customer */}
            <div>
                <label className="block text-xs font-mono text-slate-500 mb-1">CUSTOMER</label>
                <select 
                    {...register('customerId')}
                    className="w-full bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border rounded-lg px-4 py-2"
                >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                    ))}
                </select>
                {errors.customerId && <span className="text-red-500 text-xs">{errors.customerId.message}</span>}
            </div>

            {/* Mode & Service */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">TRANSPORT MODE</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SHIPMENT_MODES.map(mode => (
                            <label key={mode.id} className={`
                                cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center text-xs transition-all text-center
                                ${selectedMode === mode.id 
                                    ? 'bg-cyber-accent/10 border-cyber-neon text-cyber-accentHover dark:text-cyber-neon' 
                                    : 'border-cyber-border hover:bg-slate-50 dark:hover:bg-white/5'}
                            `}>
                                <input type="radio" value={mode.id} {...register('mode')} className="hidden" />
                                {mode.id === 'AIR' ? <Plane className="w-4 h-4 mb-1" /> : <Truck className="w-4 h-4 mb-1" />}
                                {mode.label}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">SERVICE LEVEL</label>
                    <div className="grid grid-cols-2 gap-2">
                         {SERVICE_LEVELS.map(level => (
                            <label key={level.id} className={`
                                cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center text-xs transition-all text-center
                                ${selectedService === level.id 
                                    ? 'bg-purple-500/10 border-purple-400 text-purple-600 dark:text-purple-400' 
                                    : 'border-cyber-border hover:bg-slate-50 dark:hover:bg-white/5'}
                            `}>
                                <input type="radio" value={level.id} {...register('serviceLevel')} className="hidden" />
                                {level.id === 'EXPRESS' ? <Zap className="w-4 h-4 mb-1" /> : <Clock className="w-4 h-4 mb-1" />}
                                <span className="text-[10px]">{level.label.split(' ')[0]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Package Details */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-cyber-border">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Package Details
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">COUNT</label>
                        <Input type="number" {...register('packageCount', { valueAsNumber: true })} />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">DEAD WEIGHT (KG)</label>
                        <Input type="number" step="0.1" {...register('weightDead', { valueAsNumber: true })} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">DIMENSIONS (L x W x H) cm</label>
                    <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="L" {...register('dimL', { valueAsNumber: true })} />
                        <Input type="number" placeholder="W" {...register('dimW', { valueAsNumber: true })} />
                        <Input type="number" placeholder="H" {...register('dimH', { valueAsNumber: true })} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Shipment'}
                </Button>
            </div>
        </form>
    );
};
