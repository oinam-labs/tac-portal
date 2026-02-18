import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useBookings } from '@/hooks/useBookings';
import { TableSkeleton } from '../ui/skeleton';
import { format } from 'date-fns';

export const RecentBookings: React.FC = () => {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useBookings({ limit: 5 });

  if (isLoading) {
    return (
      <Card className="h-full border-border/50">
        <div className="flex justify-between items-center mb-6 p-4">
          <h3 className="text-lg font-bold text-foreground">Recent Bookings</h3>
        </div>
        <div className="p-4">
          <TableSkeleton rows={5} columns={4} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border/50">
      <div className="flex justify-between items-center mb-4 p-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Recent Bookings</h3>
          <p className="text-sm text-muted-foreground">Latest shipment requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
          View All
        </Button>
      </div>
      <div className="overflow-hidden border-t border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consignor</TableHead>
              <TableHead>Consignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {booking.consignor_details.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.consignor_details.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {booking.consignee_details.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.consignee_details.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-medium ${booking.status === 'APPROVED'
                        ? 'bg-status-success/10 text-status-success border-status-success/20'
                        : booking.status === 'REJECTED'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                        }`}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
