import React from 'react';
import { Card, Button } from '../ui/CyberComponents';
import { Plus, Scan, Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Shipment',
      icon: Plus,
      color: 'text-primary',
      onClick: () => navigate('/shipments?new=true'),
      shortcut: 'N',
    },
    {
      label: 'Scan Package',
      icon: Scan,
      color: 'text-cyber-purple',
      onClick: () => navigate('/scanning'),
      shortcut: 'S',
    },
    {
      label: 'Manifests',
      icon: FileText,
      color: 'text-cyber-warning',
      onClick: () => navigate('/manifests'),
      shortcut: 'M',
    },
    {
      label: 'Print Labels',
      icon: Printer,
      color: 'text-cyber-success',
      onClick: () => navigate('/print/label/recent'),
      shortcut: 'P',
    },
  ];

  // Keyboard shortcuts could be implemented here via useHotkeys later

  return (
    <Card data-testid="quick-actions" className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Common tasks for your role</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-background border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group shadow-sm"
              onClick={action.onClick}
            >
              <action.icon className={`w-4 h-4 sm:mr-2 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden text-xs">{action.label.split(' ')[0]}</span>
              <span className="ml-2 text-[10px] opacity-40 border border-current px-1 rounded hidden lg:inline-block">
                {action.shortcut}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
