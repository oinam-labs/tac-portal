import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, Input, Button } from '../components/ui/CyberComponents';
import { StatusBadge } from '../components/domain/StatusBadge';
import { Package, Search, MapPin, Truck, Plane, Clock, ArrowRight } from 'lucide-react';

interface ShipmentRecord {
  awb_number: string;
  status: string;
  service_type: string;
  total_packages: number;
  total_weight: number;
  receiver_name: string;
  receiver_phone: string;
  origin_hub?: { code: string; name: string } | null;
  destination_hub?: { code: string; name: string } | null;
}

interface TrackingEventRecord {
  id: string;
  event_code: string;
  event_time: string | null;
  hub?: { code: string; name: string } | null;
}

interface TrackingData {
  shipment: ShipmentRecord;
  events: TrackingEventRecord[];
}

export function PublicTracking() {
  const { awb } = useParams<{ awb?: string }>();
  const navigate = useNavigate();
  const [searchAwb, setSearchAwb] = useState(awb || '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-tracking', awb],
    queryFn: async (): Promise<TrackingData | null> => {
      if (!awb) return null;

      // Fetch shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select(
          `
          *,
          origin_hub:hubs!shipments_origin_hub_id_fkey(code, name),
          destination_hub:hubs!shipments_destination_hub_id_fkey(code, name)
        `
        )
        .eq('awb_number', awb)
        .single();

      if (shipmentError) throw shipmentError;

      // Fetch tracking events
      const { data: events, error: eventsError } = await supabase
        .from('tracking_events')
        .select(
          `
          *,
          hub:hubs(code, name)
        `
        )
        .eq('awb_number', awb)
        .order('event_time', { ascending: false });

      if (eventsError) throw eventsError;

      return {
        shipment: shipment as unknown as ShipmentRecord,
        events: (events || []) as unknown as TrackingEventRecord[],
      };
    },
    enabled: !!awb,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAwb.trim()) {
      navigate(`/track/${searchAwb.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background dark">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TAC Cargo</h1>
              <p className="text-xs text-muted-foreground">Track Your Shipment</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="p-6 mb-8 bg-card/50 border-border">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchAwb}
                onChange={(e) => setSearchAwb(e.target.value)}
                placeholder="Enter AWB Number (e.g., TAC2026000001)"
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              Track
            </Button>
          </form>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8 text-center bg-card/50 border-border">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tracking information...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center bg-card/50 border-border">
            <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Shipment Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't find a shipment with AWB:{' '}
              <span className="font-mono text-primary">{awb}</span>
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Please check the AWB number and try again.
            </p>
          </Card>
        )}

        {/* No AWB State */}
        {!awb && !isLoading && (
          <Card className="p-8 text-center bg-card/50 border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Shipment</h3>
            <p className="text-muted-foreground">
              Enter your AWB number above to track your shipment in real-time.
            </p>
          </Card>
        )}

        {/* Tracking Results */}
        {data?.shipment && (
          <div className="space-y-6">
            {/* Shipment Overview */}
            <Card className="p-6 bg-card/80 border-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    AWB Number
                  </p>
                  <h2 className="text-2xl font-mono font-bold text-cyan-400">
                    {data.shipment.awb_number}
                  </h2>
                </div>
                <StatusBadge status={data.shipment.status} />
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 mb-6">
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">
                    {data.shipment.origin_hub?.code || 'IMPHAL'}
                  </p>
                  <p className="text-xs text-muted-foreground">Origin</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-0.5 flex-1 bg-border" />
                  {data.shipment.service_type === 'EXPRESS' ? (
                    <Plane className="w-6 h-6 text-cyan-400 mx-2" />
                  ) : (
                    <Truck className="w-6 h-6 text-cyan-400 mx-2" />
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="h-0.5 flex-1 bg-border" />
                </div>
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">
                    {data.shipment.destination_hub?.code || 'NEW_DELHI'}
                  </p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Packages</p>
                  <p className="text-lg font-semibold text-white">{data.shipment.total_packages}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Weight</p>
                  <p className="text-lg font-semibold text-white">
                    {data.shipment.total_weight} kg
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Mode</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {data.shipment.service_type}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Service</p>
                  <p className="text-lg font-semibold text-white">{data.shipment.service_type}</p>
                </div>
              </div>
            </Card>

            {/* Tracking Timeline */}
            <Card className="p-6 bg-card/80 border-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                Tracking History
              </h3>

              {data.events.length > 0 ? (
                <div className="space-y-4">
                  {data.events.map((e, idx) => (
                    <div key={e.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}
                        />
                        {idx < data.events.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-white">
                          {e.event_code.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">{e.hub?.name || 'System'}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {e.event_time ? new Date(e.event_time).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No tracking events recorded yet.
                </p>
              )}
            </Card>

            {/* Consignee Info (partial) */}
            <Card className="p-6 bg-card/80 border-border">
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Consignee Name</p>
                  <p className="text-white font-medium">{data.shipment.receiver_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact</p>
                  <p className="text-white font-medium">
                    {data.shipment.receiver_phone?.replace(/(\d{2})(\d+)(\d{2})/, '$1****$3')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 TAC Cargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
