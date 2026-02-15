import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useShipments } from '../hooks/useShipments';
import { Search, Warehouse, Package } from 'lucide-react';
import { HubLocation } from '../types';
import { HUBS } from '../lib/constants';
import { TableSkeleton } from '../components/ui/skeleton';

export const Inventory: React.FC = () => {
  const [filterHub, setFilterHub] = useState<HubLocation | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Determine orgId for filtering
  const selectedOrgId = filterHub === 'ALL' ? undefined : HUBS[filterHub]?.uuid;

  const { data: shipments = [], isLoading } = useShipments({
    page,
    pageSize,
    search: search || undefined,
    orgId: selectedOrgId,
    // We might need to filter by status to only show inventory items (not delivered/in-transit if strictly inventory)
    // But original code filtered by "getInventoryLocation !== null", which implies complex status logic.
    // For now, we fetch all and let the status column show.
    // Ideally, we'd have a server-side filter for "inventory_only".
  });

  // Calculate stats (Note: Total stats would need a separate query if we want accurate global counts with pagination)
  // For now, we'll display counts of *loaded* items or maybe we should fetch stats separately.
  // We'll keep the UI for stats but maybe hide values or show "Showing X items" if we don't have total count.
  const stats = {
    total: shipments.length, // This is just current page count, ideally we need total count from API
    critical: shipments.filter((s) => {
      const hours = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60);
      return hours >= 24;
    }).length,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Helper to determine bucket (client-side for display)
  const getAgingBucket = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hours < 6) return '0-6h';
    if (hours < 12) return '6-12h';
    if (hours < 24) return '12-24h';
    return '24h+';
  };

  const bucketColor = (bucket: string) => {
    switch (bucket) {
      case '0-6h': return 'text-status-success';
      case '6-12h': return 'text-status-warning';
      case '12-24h': return 'text-status-warning';
      case '24h+': return 'text-status-error font-bold';
      default: return 'text-muted-foreground';
    }
  };

  const getInventoryLocation = (s: { origin_hub_id: string; destination_hub_id: string; status: string }) => {
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

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader title="Inventory Management" description="Real-time stock view across hub network.">
        <div className="flex gap-1">
          <Button
            variant={filterHub === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterHub('ALL'); setPage(1); }}
          >
            All Hubs
          </Button>
          <Button
            variant={filterHub === 'IMPHAL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterHub('IMPHAL'); setPage(1); }}
          >
            Imphal
          </Button>
          <Button
            variant={filterHub === 'NEW_DELHI' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterHub('NEW_DELHI'); setPage(1); }}
          >
            New Delhi
          </Button>
        </div>
      </PageHeader>

      <Card className="grid grid-cols-2 divide-x divide-border">
        {/* Stats are strictly for current page now, which is a trade-off until we implement aggregate API */}
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-none">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Items on Page</div>
            <div className="text-3xl font-bold text-foreground font-mono leading-none">{stats.total}</div>
          </div>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-status-error/10 text-status-error rounded-none">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Critical on Page</div>
            <div className="text-3xl font-bold text-status-error font-mono leading-none">{stats.critical}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4 p-4 pb-0">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search AWB..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="border border-border rounded-md mx-4 mb-4">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}><TableSkeleton rows={5} columns={6} /></TableCell>
                </TableRow>
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => {
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

        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) handlePageChange(page - 1); }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" isActive>{page}</PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                  // Disable next if we have fewer items than page size (simple check)
                  aria-disabled={shipments.length < pageSize}
                  className={shipments.length < pageSize ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>
    </div>
  );
};
