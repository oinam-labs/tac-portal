import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { useShipments } from '../hooks/useShipments';
import { Search, Warehouse, Package } from 'lucide-react';
import { HubLocation } from '../types';
import { HUBS } from '../lib/constants';
import { TableSkeleton } from '../components/ui/skeleton';

export const Inventory: React.FC = () => {
  const { data: shipments = [], isLoading } = useShipments();
  const [filterHub, setFilterHub] = useState<HubLocation | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  // Inventory Logic:
  // Shipments are "In Inventory" if they are at a hub and NOT in transit/delivered.
  const getInventoryLocation = (s: {
    status: string;
    origin_hub_id: string;
    destination_hub_id: string;
  }): HubLocation | null => {
    // Map hub IDs to hub names based on HUBS constant
    const getHubLocationFromId = (hubId: string): HubLocation | null => {
      const hubEntry = Object.entries(HUBS).find(([_, hub]) => hub.uuid === hubId);
      return hubEntry ? (hubEntry[0] as HubLocation) : null;
    };

    const originHubLocation = getHubLocationFromId(s.origin_hub_id);
    const destHubLocation = getHubLocationFromId(s.destination_hub_id);

    if (['CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN'].includes(s.status))
      return originHubLocation;
    if (['RECEIVED_AT_DEST', 'OUT_FOR_DELIVERY'].includes(s.status)) return destHubLocation;
    if (['EXCEPTION'].includes(s.status)) return originHubLocation;
    return null;
  };

  // Helper to determine bucket
  const getAgingBucket = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hours < 6) return '0-6h';
    if (hours < 12) return '6-12h';
    if (hours < 24) return '12-24h';
    return '24h+';
  };

  const bucketColor = (bucket: string) => {
    switch (bucket) {
      case '0-6h':
        return 'text-status-success';
      case '6-12h':
        return 'text-status-warning';
      case '12-24h':
        return 'text-status-warning';
      case '24h+':
        return 'text-status-error font-bold';
      default:
        return 'text-muted-foreground';
    }
  };

  const inventoryItems = shipments
    .filter((s) => getInventoryLocation(s) !== null)
    .filter((s) => filterHub === 'ALL' || getInventoryLocation(s) === filterHub)
    .filter(
      (s) =>
        s.awb_number.toLowerCase().includes(search.toLowerCase()) ||
        (s.customer?.name || '').toLowerCase().includes(search.toLowerCase())
    );

  // Stats
  const stats = {
    total: inventoryItems.length,
    critical: inventoryItems.filter((s) => getAgingBucket(s.created_at) === '24h+').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
        <PageHeader title="Inventory Management" description="Real-time stock view across hub network." />
        <Card>
          <TableSkeleton rows={5} columns={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader title="Inventory Management" description="Real-time stock view across hub network.">
        <div className="flex gap-1">
          <Button
            variant={filterHub === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterHub('ALL')}
          >
            All Hubs
          </Button>
          <Button
            variant={filterHub === 'IMPHAL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterHub('IMPHAL')}
          >
            Imphal
          </Button>
          <Button
            variant={filterHub === 'NEW_DELHI' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterHub('NEW_DELHI')}
          >
            New Delhi
          </Button>
        </div>
      </PageHeader>

      <Card className="grid grid-cols-2 divide-x divide-border">
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-none">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total In Stock</div>
            <div className="text-3xl font-bold text-foreground font-mono leading-none">{stats.total} <span className="text-sm font-normal text-muted-foreground ml-1">Pkgs</span></div>
          </div>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-status-error/10 text-status-error rounded-none">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Aging Critical (24h+)</div>
            <div className="text-3xl font-bold text-status-error font-mono leading-none">{stats.critical} <span className="text-sm font-normal text-muted-foreground ml-1">Pkgs</span></div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search AWB..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {inventoryItems.length} items
          </div>
        </div>

        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AWB</TableHead>
                <TableHead>Packages</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Location Hub</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aging</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No items currently in inventory matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                inventoryItems.map((s) => {
                  const location = getInventoryLocation(s);
                  const hubName = location ? HUBS[location].name : 'Unknown';
                  const bucket = getAgingBucket(s.created_at);

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <span className="font-mono text-foreground font-bold">{s.awb_number}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{s.package_count}</span>
                      </TableCell>
                      <TableCell className="font-mono">{s.total_weight} kg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-muted-foreground" />
                          {hubName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.status.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-bold ${bucketColor(bucket)}`}>{bucket}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
