import React, { useEffect } from 'react';
import { Shipment } from '../../types';
import { useShipmentStore } from '../../store/shipmentStore';
import { Button, Card, Badge } from '../ui/CyberComponents';
import { STATUS_COLORS } from '../../lib/design-tokens';
import { generateShipmentLabel } from '../../lib/pdf-generator';
import { Printer, X, Box, ArrowRight, Clock } from 'lucide-react';
import { HUBS } from '../../lib/constants';

interface Props {
    shipment: Shipment;
    onClose: () => void;
}

export const ShipmentDetails: React.FC<Props> = ({ shipment, onClose }) => {
    const { fetchShipmentEvents, currentShipmentEvents } = useShipmentStore();

    useEffect(() => {
        fetchShipmentEvents(shipment.id);
    }, [shipment.id]);

    const handlePrintLabel = async () => {
        const url = await generateShipmentLabel(shipment);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LABEL-${shipment.awb}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const origin = HUBS[shipment.originHub];
    const dest = HUBS[shipment.destinationHub];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{shipment.awb}</h2>
                        <Badge className={STATUS_COLORS[shipment.status]}>{shipment.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Ref: {shipment.id} • Created {shipment.createdAt.split('T')[0]}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrintLabel} variant="secondary">
                        <Printer className="w-4 h-4 mr-2" /> Label
                    </Button>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Route & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{origin.code}</div>
                            <div className="text-xs text-slate-500">{origin.name}</div>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="w-full h-0.5 bg-cyber-border relative">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-cyber-neon"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyber-surface px-2 text-xs text-slate-500">
                                    {shipment.mode}
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyber-neon">{dest.code}</div>
                            <div className="text-xs text-slate-500">{dest.name}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-cyber-border pt-4">
                        <div>
                            <div className="text-xs text-slate-500">Service</div>
                            <div className="font-bold text-sm">{shipment.serviceLevel}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Weight</div>
                            <div className="font-bold text-sm">{shipment.totalWeight.chargeable} kg</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Packages</div>
                            <div className="font-bold text-sm">{shipment.totalPackageCount}</div>
                        </div>
                    </div>
                </Card>
                
                <Card>
                    <h3 className="text-sm font-bold mb-3">Customer</h3>
                    <div className="text-sm font-medium">{shipment.customerName}</div>
                    <div className="text-xs text-slate-500 mt-1">ID: {shipment.customerId}</div>
                    
                    <h3 className="text-sm font-bold mt-4 mb-2">ETA</h3>
                    <div className="text-lg font-mono text-green-500">{shipment.eta}</div>
                </Card>
            </div>

            {/* Tracking History */}
            <Card>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Tracking History
                </h3>
                <div className="space-y-6 pl-2">
                    {currentShipmentEvents.map((evt, idx) => (
                        <div key={evt.id} className="relative pl-6 border-l border-cyber-border last:border-0 pb-1">
                            <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-cyber-neon shadow-neon' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{evt.eventCode.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">{evt.description}</div>
                            <div className="text-xs text-slate-500 mt-1">
                                {new Date(evt.timestamp).toLocaleString()} • {evt.hubId || 'Transit'}
                            </div>
                        </div>
                    ))}
                    {currentShipmentEvents.length === 0 && (
                        <div className="text-sm text-slate-500">No events recorded.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};
