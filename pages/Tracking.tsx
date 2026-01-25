/* eslint-disable @typescript-eslint/no-explicit-any -- Data mapping between Supabase and UI types */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Input, Button } from '../components/ui/CyberComponents';
import { TrackingTimeline } from '../components/domain/TrackingTimeline';
import { StatusBadge } from '../components/domain/StatusBadge';
import { ShipmentCard } from '../components/domain/ShipmentCard';
import { Search, MapPin, Truck, Package, Plane } from 'lucide-react';
import { useShipmentByAWB } from '../hooks/useShipments';
import { useTrackingEvents } from '../hooks/useTrackingEvents';
import { useRealtimeTracking } from '../hooks/useRealtime';
import { Shipment, TrackingEvent } from '../types';
import { HUBS } from '../lib/constants';

export const Tracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackId, setTrackId] = useState('');
  const [searchAwb, setSearchAwb] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Supabase queries
  const {
    data: shipmentData,
    isLoading: shipmentLoading,
    error: shipmentError,
  } = useShipmentByAWB(searchAwb);
  const { data: eventsData, isLoading: eventsLoading } = useTrackingEvents(searchAwb);

  // Enable realtime updates for this AWB
  useRealtimeTracking(searchAwb ?? undefined);

  // Map Supabase data to legacy format for existing components
  const result = shipmentData
    ? {
        shipment: {
          id: shipmentData.id,
          awb: shipmentData.awb_number,
          status: shipmentData.status,
          mode: shipmentData.mode,
          originHub: shipmentData.origin_hub?.code || 'ORIGIN',
          destinationHub: shipmentData.destination_hub?.code || 'DEST',
          eta: 'TBD',
          consigneeName: shipmentData.receiver_name,
          consigneePhone: shipmentData.receiver_phone,
          weight: shipmentData.total_weight,
          pieces: shipmentData.package_count,
        } as unknown as Shipment,
        events: (eventsData || []).map((e) => ({
          id: e.id,
          shipmentId: e.shipment_id,
          awb: shipmentData?.awb_number || '',
          timestamp: e.event_time || e.created_at,
          status: e.event_code,
          eventCode: e.event_code,
          location: (e as any).hub?.name || (e as any).location || '',
          description: (e as any).notes || `Status: ${e.event_code}`,
          actorId: (e as any).actor_staff_id || '',
        })) as unknown as TrackingEvent[],
      }
    : null;

  const handleTrack = () => {
    if (trackId.trim()) {
      setError('');
      setSearchAwb(trackId.trim().toUpperCase());
    }
  };

  useEffect(() => {
    if (shipmentError) {
      setError('Shipment not found. Please check the AWB.');
    }
  }, [shipmentError]);

  useEffect(() => {
    const awbParam = searchParams.get('awb');
    if (awbParam) {
      setTrackId(awbParam);
      setSearchAwb(awbParam.toUpperCase());
    }
  }, [searchParams]);

  const isLoading = shipmentLoading || eventsLoading;
  void isLoading; // Used in UI below

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>

      {/* Search Area */}
      <Card className="max-w-3xl mx-auto p-8 border-cyber-accent/30 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Enter AWB (e.g., TAC...)"
              className="pl-10 h-12 text-lg"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
            />
          </div>
          <Button size="lg" className="px-8" onClick={handleTrack}>
            Track
          </Button>
        </div>
        {error && <div className="text-status-error mt-2 text-center text-sm">{error}</div>}
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-1 p-6">
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-2">Current Status</div>
              <StatusBadge status={result.shipment.status} size="lg" />
            </div>

            <h3 className="text-lg font-bold text-white mb-6">Shipment Journey</h3>
            <TrackingTimeline events={result.events} />
          </Card>

          {/* Map & Shipment Details */}
          <Card className="lg:col-span-2 relative overflow-hidden min-h-[400px] bg-background">
            <div className="absolute inset-0 opacity-20 tracking-map-pattern"></div>

            {/* Route Visualization */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-center">
                <div className="w-6 h-6 rounded-full bg-status-info mx-auto mb-2 flex items-center justify-center">
                  <Package className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  {HUBS[result.shipment.originHub]?.code || 'ORIGIN'}
                </span>
              </div>

              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 text-center">
                <div className="w-6 h-6 rounded-full bg-status-success mx-auto mb-2 flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  {HUBS[result.shipment.destinationHub]?.code || 'DEST'}
                </span>
              </div>

              {/* Route line */}
              <div className="absolute top-1/2 left-[28%] right-[28%] h-1 rounded-full tracking-route-gradient"></div>

              {/* Moving vehicle indicator */}
              {result.shipment.status === 'IN_TRANSIT' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyber-card border-2 border-cyber-accent p-3 rounded-xl shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    {result.shipment.mode === 'AIR' ? (
                      <Plane className="w-5 h-5 text-status-info" />
                    ) : (
                      <Truck className="w-5 h-5 text-status-warning" />
                    )}
                    <div>
                      <span className="text-sm font-bold text-white font-mono">
                        {result.shipment.awb}
                      </span>
                      <div className="text-xs text-muted-foreground">In Transit</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ETA Badge */}
            <div className="absolute top-4 right-4 text-right">
              <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-lg">
                <div className="text-xs text-muted-foreground">Estimated Arrival</div>
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
