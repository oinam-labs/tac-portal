import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Plus, Scan, Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingDialog } from '@/components/bookings/BookingDialog';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const actions = [
    {
      label: 'New Shipment',
      description: 'Create & schedule orders',
      icon: Plus,
      color: 'text-primary',
      onClick: () => navigate('/shipments?new=true'),
      shortcut: 'N',
    },
    // Book Shipment removed as per request (Public only now)
    // {
    //   label: 'Book Shipment',
    //   description: 'Request new booking',
    //   icon: PackagePlus,
    //   color: 'text-blue-500',
    //   onClick: (e: React.MouseEvent) => {
    //     console.log('[QuickActions] Book Shipment clicked');
    //     e.preventDefault();
    //     e.stopPropagation();
    //     setBookingDialogOpen(true);
    //   },
    //   shortcut: 'B',
    // },
    {
      label: 'Scan Package',
      description: 'Update status via barcode',
      icon: Scan,
      color: 'text-chart-5',
      onClick: () => navigate('/scanning'),
      shortcut: 'S',
    },
    {
      label: 'Manifests',
      description: 'Review daily dispatches',
      icon: FileText,
      color: 'text-status-warning',
      onClick: () => navigate('/manifests'),
      shortcut: 'M',
    },
    {
      label: 'Print Labels',
      description: 'Batch print air waybills',
      icon: Printer,
      color: 'text-status-success',
      onClick: () => navigate('/print/label/recent'),
      shortcut: 'P',
    },
  ];

  // Keyboard shortcuts could be implemented here via useHotkeys later

  return (
    <>
      <div data-testid="quick-actions" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Common tasks for your role</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost" // Changed to ghost to allow custom tile styling
              data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="h-auto py-6 px-6 flex flex-col items-start gap-2 bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/50 hover:bg-card transition-all group rounded-xl"
              onClick={action.onClick}
              type="button"
            >
              <div className="flex items-center gap-3 w-full mb-1">
                <div
                  className={`p-2 rounded-lg ${action.color.replace('text-', 'bg-')}/10 ${action.color}`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </span>
                <span className="ml-auto text-[10px] opacity-40 border border-current px-1.5 py-0.5 rounded hidden lg:inline-block font-mono">
                  {action.shortcut}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-normal text-left line-clamp-1 pl-1">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </div>

      <BookingDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} />
    </>
  );
};
