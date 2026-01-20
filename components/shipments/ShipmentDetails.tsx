import React from 'react';
import { Shipment } from '../../types';
import { useTrackingEvents } from '../../hooks/useTrackingEvents';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Badge } from '../ui/CyberComponents';
import { STATUS_COLORS } from '../../lib/design-tokens';
import { Printer, X, Clock } from 'lucide-react';
import { HUBS } from '../../lib/constants';
import { toast } from 'sonner';
import { NotesPanel } from '../domain/NotesPanel';

interface Props {
    shipment: Shipment;
    onClose: () => void;
}

export const ShipmentDetails: React.FC<Props> = ({ shipment, onClose }) => {
    // Use Supabase hook for tracking events (queries by AWB number)
    const { data: trackingEvents = [] } = useTrackingEvents(shipment.awb);
    const { user } = useAuthStore();

    const handlePrintLabel = () => {
        try {
            // Save shipment to localStorage with per-AWB key to prevent overwrites
            const storageKey = `print_shipping_label_${shipment.awb}`;
            localStorage.setItem(storageKey, JSON.stringify(shipment));

            // Open print page in a popup (consistent with Invoice section)
            const width = 500;
            const height = 700;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;

            const popup = window.open(
                `#/print/label/${shipment.awb}`,
                'PrintLabel',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            // Check if popup was blocked
            if (!popup) {
                toast.error('Popup blocked. Please allow popups and try again.');
                return;
            }

            // Clean up localStorage after a delay
            setTimeout(() => {
                localStorage.removeItem(storageKey);
            }, 30000); // Remove after 30 seconds
        } catch (error) {
            console.error('Label error:', error);
            toast.error('Failed to open label');
        }
    };

    const origin = HUBS[shipment.originHub] || { code: shipment.originHub || 'N/A', name: 'Unknown Hub' };
    const dest = HUBS[shipment.destinationHub] || { code: shipment.destinationHub || 'N/A', name: 'Unknown Hub' };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-mono text-foreground">{shipment.awb}</h2>
                        <Badge className={STATUS_COLORS[shipment.status]}>{shipment.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Ref: {shipment.id} • Created {shipment.createdAt.split('T')[0]}</p>
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
                            <div className="text-2xl font-bold text-foreground">{origin.code}</div>
                            <div className="text-xs text-muted-foreground">{origin.name}</div>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center">
                            <div className="w-full h-0.5 bg-cyber-border relative">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground"></div>
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-cyber-neon"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyber-surface px-2 text-xs text-muted-foreground">
                                    {shipment.mode}
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{dest.code}</div>
                            <div className="text-xs text-muted-foreground">{dest.name}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-cyber-border pt-4">
                        <div>
                            <div className="text-xs text-muted-foreground">Service</div>
                            <div className="font-bold text-sm">{shipment.serviceLevel}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Weight</div>
                            <div className="font-bold text-sm">{shipment.totalWeight.chargeable} kg</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Packages</div>
                            <div className="font-bold text-sm">{shipment.totalPackageCount}</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-bold mb-3">Customer</h3>
                    <div className="text-sm font-medium">{shipment.customerName}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {shipment.customerId}</div>

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
                    {trackingEvents.map((evt, idx) => (
                        <div key={evt.id} className="relative pl-6 border-l border-cyber-border last:border-0 pb-1">
                            <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-cyber-neon shadow-neon' : 'bg-muted-foreground'}`}></div>
                            <div className="text-sm font-bold text-foreground">{evt.event_code.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-muted-foreground">{evt.meta?.description || 'Event recorded'}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {new Date(evt.event_time).toLocaleString()} • {evt.hub?.name || 'Transit'}
                            </div>
                        </div>
                    ))}
                    {trackingEvents.length === 0 && (
                        <div className="text-sm text-muted-foreground">No events recorded.</div>
                    )}
                </div>
            </Card>

            {/* Notes & Comments */}
            <NotesPanel
                entityType="SHIPMENT"
                entityId={shipment.id}
                title="Shipment Notes"
                currentUserId={user?.id || 'System'}
                maxHeight="300px"
            />
        </div>
    );
};
