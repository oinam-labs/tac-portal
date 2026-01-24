import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, Th, Td } from '../components/ui/CyberComponents';
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
  // Use separate loading states or just one if blocking interactions globally is desired, 
  // but for tabs, local loading is often better. For now, we'll keep it simple but ensure unique effect triggers.
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
      // Don't set global loading if we just switched tabs, 
      // unless we want to block the whole UI. 
      // Better to have per-section loading, but for this refactor 
      // we'll ensure we don't race conditions.

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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to save preference');
      // Revert on failure
      setNotifications({ ...notifications, [key]: notifications[key] });
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-2xl font-bold text-foreground">System Configuration</h1>

      <div className="flex gap-4 border-b border-cyber-border mb-6">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'GENERAL' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'SECURITY' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Security & Notifications
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'AUDIT' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Audit Logs
        </button>
      </div>

      {activeTab === 'GENERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-border">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  TERMINAL NAME
                </label>
                <Input
                  value={terminalName}
                  onChange={(e) => setTerminalName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  TIMEZONE
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
      )}

      {activeTab === 'SECURITY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-border">
              <Bell className="w-5 h-5 text-cyber-purple" />
              <h3 className="font-bold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-3">
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
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => toggleNotification(item.id)}
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${notifications[item.id] ? 'bg-cyber-accent/20' : 'bg-muted-foreground/20'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${notifications[item.id]
                      ? 'right-0.5 bg-cyber-accentHover dark:bg-cyber-neon shadow-[0_0_5px_#22d3ee]'
                      : 'left-0.5 bg-muted-foreground'
                      }`}></div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-border">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-bold text-foreground">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-foreground">Two-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Managed via Identity Provider</div>
                </div>
                <Button variant="secondary" size="sm" disabled>
                  Configure
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-foreground">API Access Keys</div>
                  <div className="text-xs text-muted-foreground">Admin access required</div>
                </div>
                <Button variant="secondary" size="sm">
                  Manage Keys
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'AUDIT' && (
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-border">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">System Audit Logs</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Timestamp</Th>
                  <Th>Actor</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>Details</Th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted transition-colors border-b border-cyber-border/30"
                    >
                      <Td className="font-mono text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </Td>
                      <Td className="font-bold text-foreground">{log.actorId}</Td>
                      <Td>
                        <span className="text-primary font-mono text-xs">{log.action}</span>
                      </Td>
                      <Td className="text-xs">
                        {log.entityType} ({log.entityId})
                      </Td>
                      <Td className="text-xs font-mono text-muted-foreground max-w-xs truncate">
                        {JSON.stringify(log.payload)}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
