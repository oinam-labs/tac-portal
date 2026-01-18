import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Input, Button } from '../components/ui/CyberComponents';
import { TrackingTimeline } from '../components/domain/TrackingTimeline';
import { StatusBadge } from '../components/domain/StatusBadge';
import { ShipmentCard } from '../components/domain/ShipmentCard';
import { Search, MapPin, Truck, CheckCircle, Package, AlertCircle, Plane } from 'lucide-react';
import { db } from '../lib/mock-db';
import { Shipment, TrackingEvent } from '../types';
import { HUBS } from '../lib/constants';

export const Tracking: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [trackId, setTrackId] = useState('');
    const [result, setResult] = useState<{ shipment: Shipment, events: TrackingEvent[] } | null>(null);
    const [error, setError] = useState('');

    const performSearch = (awb: string) => {
        setError('');
        setResult(null);
        
        const shipment = db.getShipmentByAWB(awb);
        if (shipment) {
            const events = db.getEvents(shipment.id);
            setResult({ shipment, events });
        } else {
            setError('Shipment not found. Please check the AWB.');
        }
    };

    const handleTrack = () => {
        performSearch(trackId);
    };

    useEffect(() => {
        const awbParam = searchParams.get('awb');
        if (awbParam) {
            setTrackId(awbParam);
            performSearch(awbParam);
        }
    }, [searchParams]);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Tracking</h1>
            
            {/* Search Area */}
            <Card className="max-w-3xl mx-auto p-8 border-cyber-accent/30 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                        <Input 
                            placeholder="Enter AWB (e.g., TAC...)" 
                            className="pl-10 h-12 text-lg"
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="px-8" onClick={handleTrack}>Track</Button>
                </div>
                {error && <div className="text-red-500 mt-2 text-center text-sm">{error}</div>}
            </Card>

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <Card className="lg:col-span-1 p-6">
                        <div className="mb-6">
                            <div className="text-sm text-slate-500 mb-2">Current Status</div>
                            <StatusBadge status={result.shipment.status} size="lg" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-6">Shipment Journey</h3>
                        <TrackingTimeline events={result.events} />
                    </Card>

                    {/* Map & Shipment Details */}
                    <Card className="lg:col-span-2 relative overflow-hidden min-h-[400px] bg-slate-900">
                        <div className="absolute inset-0 opacity-20" style={{ 
                            backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)', 
                            backgroundSize: '20px 20px' 
                        }}></div>
                        
                        {/* Route Visualization */}
                        <div className="absolute inset-0">
                            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-center">
                                <div className="w-6 h-6 rounded-full bg-cyan-500 mx-auto mb-2 flex items-center justify-center">
                                    <Package className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                    {HUBS[result.shipment.originHub]?.code || 'ORIGIN'}
                                </span>
                            </div>
                             
                            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 text-center">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 mx-auto mb-2 flex items-center justify-center">
                                    <MapPin className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                    {HUBS[result.shipment.destinationHub]?.code || 'DEST'}
                                </span>
                            </div>

                            {/* Route line */}
                            <div className="absolute top-1/2 left-[28%] right-[28%] h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 rounded-full"></div>
                             
                            {/* Moving vehicle indicator */}
                            {(result.shipment.status === 'IN_TRANSIT_TO_DESTINATION' || result.shipment.status === 'LOADED_FOR_LINEHAUL') && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyber-card border-2 border-cyber-accent p-3 rounded-xl shadow-lg animate-pulse">
                                    <div className="flex items-center gap-2">
                                        {result.shipment.mode === 'AIR' ? (
                                            <Plane className="w-5 h-5 text-cyan-400" />
                                        ) : (
                                            <Truck className="w-5 h-5 text-amber-400" />
                                        )}
                                        <div>
                                            <span className="text-sm font-bold text-white font-mono">{result.shipment.awb}</span>
                                            <div className="text-xs text-slate-400">In Transit</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ETA Badge */}
                        <div className="absolute top-4 right-4 text-right">
                            <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-lg">
                                <div className="text-xs text-slate-400">Estimated Arrival</div>
                                <div className="text-lg font-bold text-white font-mono">{result.shipment.eta}</div>
                            </div>
                        </div>

                        {/* Shipment Summary */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <ShipmentCard shipment={result.shipment} compact />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
