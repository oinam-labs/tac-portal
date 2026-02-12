import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { Bell, Shield, Globe, Activity } from 'lucide-react';
import { useAuditStore } from '../store/auditStore';
import { settingsService } from '../lib/services/settingsService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'AUDIT'>('GENERAL');
  const { logs, fetchLogs } = useAuditStore();
  const { user } = useAuthStore();

  // Form States
  const [isLoading, setIsLoading] = useState(false);
  const [terminalName, setTerminalName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    shipment_delays: true,
    new_orders: true,
    system_alerts: true,
    driver_updates: false
  });

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setIsLoading(true);
        if (activeTab === 'GENERAL') {
          const data = await settingsService.getOrgSettings();
          if (mounted) {
            setTerminalName(data.name);
            setTimezone(data.settings.timezone || 'UTC');
          }
        } else if (activeTab === 'SECURITY' && user) {
          const userSettings = await settingsService.getUserSettings(user.id);
          if (mounted && userSettings.notifications?.types) {
            const notifState = { ...notifications };
            userSettings.notifications.types.forEach(type => {
              notifState[type] = true;
            });
            setNotifications(notifState);
          }
        } else if (activeTab === 'AUDIT') {
          await fetchLogs();
        }
      } catch (error) {
        if (mounted) toast.error('Failed to load settings');
        console.error(error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadSettings();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const handleSaveGeneral = async () => {
    try {
      setIsLoading(true);
      await settingsService.updateOrgSettings(terminalName, { timezone });
      toast.success('Organization settings updated');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = async (key: string) => {
    if (!user) return;
    const newState = { ...notifications, [key]: !notifications[key] };
    setNotifications(newState);

    // Auto-save user preferences
    try {
      const activeTypes = Object.entries(newState)
        .filter(([_, active]) => active)
        .map(([k]) => k);

      await settingsService.updateUserSettings(user.id, {
        notifications: {
          types: activeTypes
        }
      });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preference');
      // Revert on failure
      setNotifications({ ...notifications, [key]: notifications[key] });
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader title="System Configuration" description="Manage organization settings, security, and audit logs." />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'GENERAL' | 'SECURITY' | 'AUDIT')}
      >
        <TabsList variant="line">
          <TabsTrigger value="GENERAL">General</TabsTrigger>
          <TabsTrigger value="SECURITY">Security & Notifications</TabsTrigger>
          <TabsTrigger value="AUDIT">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="GENERAL" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">General Settings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Terminal Name
                  </label>
                  <Input
                    value={terminalName}
                    onChange={(e) => setTerminalName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Timezone
                  </label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. UTC, Asia/Kolkata"
                    disabled={isLoading}
                  />
                </div>
                <div className="pt-2">
                  <Button onClick={handleSaveGeneral} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="SECURITY" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Bell className="w-5 h-5 text-chart-5" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="space-y-1">
                {[
                  { id: 'shipment_delays', label: 'Shipment Delays' },
                  { id: 'new_orders', label: 'New Orders' },
                  { id: 'system_alerts', label: 'System Alerts' },
                  { id: 'driver_updates', label: 'Driver Updates' }
                ].map((item) => (
                  <button
                    key={item.id}
                    role="switch"
                    aria-checked={notifications[item.id]}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    onClick={() => toggleNotification(item.id)}
                  >
                    <span className="text-sm text-foreground">{item.label}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notifications[item.id] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${notifications[item.id]
                        ? 'right-0.5 bg-primary-foreground'
                        : 'left-0.5 bg-background'
                        }`}></div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Shield className="w-5 h-5 text-status-success" />
                <h3 className="font-semibold text-foreground">Security</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                    <div className="text-xs text-muted-foreground">Managed via Identity Provider</div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-foreground">API Access Keys</div>
                    <div className="text-xs text-muted-foreground">Admin access required</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Keys
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="AUDIT" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">System Audit Logs</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{log.actorId}</TableCell>
                        <TableCell>
                          <span className="text-primary font-mono text-xs">{log.action}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.entityType} ({log.entityId})
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground max-w-xs truncate">
                          {JSON.stringify(log.payload)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
