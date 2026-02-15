'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Shield,
  Bell,
  ChevronDown,
  User,
  Clock,
  Activity,
  Search,
  Truck,
  MapPin,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { HUBS, SHIPMENT_MODES, SERVICE_LEVELS, PAYMENT_MODES } from '@/lib/constants';

const PageHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: any;
}

const SectionHeader = ({
  icon: Icon,
  title,
  color = 'text-primary',
}: {
  icon: any;
  title: string;
  color?: string;
}) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className="font-bold text-foreground tracking-tight">{title}</h3>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 ml-0.5">
    {children}
  </label>
);

export const Settings = () => {
  const { user, session } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'AUDIT'>('GENERAL');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Organization Settings
  const [terminalName, setTerminalName] = useState('MAIN HUB - MUMBAI');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Operational Defaults
  const [defaultMode, setDefaultMode] = useState('TRUCK_LINEHAUL');
  const [defaultServiceLevel, setDefaultServiceLevel] = useState('STANDARD');
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('PREPAID');
  const [exportFormat, setExportFormat] = useState('CSV');

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    shipment_delays: true,
    new_orders: true,
    system_alerts: true,
    driver_updates: false,
  });

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    // Mock simulation or Supabase fetch
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        actorId: user?.email || 'admin@tac.com',
        action: 'SETTINGS_UPDATE',
        entityType: 'SYSTEM',
        payload: { terminal: 'Hub-01' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actorId: 'system',
        action: 'BACKUP_COMPLETED',
        entityType: 'DATABASE',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        actorId: user?.email || 'admin@tac.com',
        action: 'USER_LOGIN',
        entityType: 'AUTH',
      },
    ];
    setLogs(mockLogs);
  };

  const handleSaveGeneral = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Configuration saved successfully');
    }, 1000);
  };

  const toggleNotification = (id: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Custom Select styled for TAC
  const SelectField = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="flex h-9 w-full border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );

  // Toggle switch component
  const ToggleSwitch = ({
    checked,
    onToggle,
    label,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      onClick={onToggle}
    >
      <span className="text-sm text-foreground">{label}</span>
      <div
        className={`w-10 h-5 relative transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 shadow-sm transition-all duration-200 ${
            checked ? 'right-0.5 bg-primary-foreground' : 'left-0.5 bg-background'
          }`}
        ></div>
      </div>
    </button>
  );

  // Filtered audit logs
  const filteredLogs = logs.filter((log) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entityType?.toLowerCase().includes(q) ||
      log.entityId?.toLowerCase().includes(q) ||
      log.actorId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="System Configuration"
        description="Manage organization settings, security, and audit logs."
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'GENERAL' | 'SECURITY' | 'AUDIT')}
      >
        <TabsList variant="line">
          <TabsTrigger value="GENERAL">General</TabsTrigger>
          <TabsTrigger value="SECURITY">Security & Notifications</TabsTrigger>
          <TabsTrigger value="AUDIT">Audit Logs</TabsTrigger>
        </TabsList>

        {/* ============= GENERAL TAB ============= */}
        <TabsContent value="GENERAL" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Profile */}
            <Card className="p-5">
              <SectionHeader icon={Building2} title="Organization Profile" />
              <div className="space-y-4">
                <div>
                  <FieldLabel>Terminal Name</FieldLabel>
                  <Input
                    value={terminalName}
                    onChange={(e) => setTerminalName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <FieldLabel>Timezone</FieldLabel>
                  <SelectField
                    value={timezone}
                    onChange={setTimezone}
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' },
                      { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                      { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Currency</FieldLabel>
                    <SelectField
                      value={currency}
                      onChange={setCurrency}
                      options={[
                        { value: 'INR', label: '₹ INR' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                        { value: 'GBP', label: '£ GBP' },
                      ]}
                    />
                  </div>
                  <div>
                    <FieldLabel>Date Format</FieldLabel>
                    <SelectField
                      value={dateFormat}
                      onChange={setDateFormat}
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Operational Defaults */}
            <Card className="p-5">
              <SectionHeader icon={Truck} title="Operational Defaults" />
              <div className="space-y-4">
                <div>
                  <FieldLabel>Default Shipment Mode</FieldLabel>
                  <SelectField
                    value={defaultMode}
                    onChange={setDefaultMode}
                    options={SHIPMENT_MODES.map((m) => ({ value: m.id, label: m.label }))}
                  />
                </div>
                <div>
                  <FieldLabel>Default Service Level</FieldLabel>
                  <SelectField
                    value={defaultServiceLevel}
                    onChange={setDefaultServiceLevel}
                    options={SERVICE_LEVELS.map((s) => ({ value: s.id, label: s.label }))}
                  />
                </div>
                <div>
                  <FieldLabel>Default Payment Mode</FieldLabel>
                  <SelectField
                    value={defaultPaymentMode}
                    onChange={setDefaultPaymentMode}
                    options={PAYMENT_MODES.map((p) => ({ value: p.id, label: p.label }))}
                  />
                </div>
                <div>
                  <FieldLabel>Export Format</FieldLabel>
                  <SelectField
                    value={exportFormat}
                    onChange={setExportFormat}
                    options={[
                      { value: 'CSV', label: 'CSV (Spreadsheet)' },
                      { value: 'PDF', label: 'PDF (Document)' },
                      { value: 'XLSX', label: 'Excel (XLSX)' },
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* Hub Network — Full width */}
            <Card className="p-5 md:col-span-2">
              <SectionHeader icon={MapPin} title="Hub Network" color="text-chart-5" />
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hub Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Sort Code</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(HUBS).map(([key, hub]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-foreground">{hub.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {hub.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {hub.sortCode}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs">
                          {hub.address}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-status-success/20 text-status-success border-status-success/30"
                          >
                            ACTIVE
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Hub configuration is managed at the infrastructure level. Contact support to add or
                modify hubs.
              </p>
            </Card>

            {/* Save Button — Full width */}
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleSaveGeneral} disabled={isLoading} size="lg">
                {isLoading ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ============= SECURITY & NOTIFICATIONS TAB ============= */}
        <TabsContent value="SECURITY" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Profile */}
            <Card className="p-5">
              <SectionHeader icon={User} title="User Profile" color="text-chart-5" />
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-muted/30 border border-border">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {user?.fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {user?.fullName || 'Unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {user?.email || '—'}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {user?.role || '—'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Hub
                    </div>
                    <div className="text-sm font-medium text-foreground font-mono">
                      {user?.hubCode || 'All Hubs'}
                    </div>
                  </div>
                  <div className="p-3 border border-border">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </div>
                    <div className="text-sm font-medium">
                      {user?.isActive ? (
                        <span className="text-status-success">Active</span>
                      ) : (
                        <span className="text-status-error">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Appearance */}
            <Card className="p-5">
              <SectionHeader icon={Moon} title="Appearance" color="text-status-warning" />
              <div className="space-y-4">
                <div>
                  <FieldLabel>Theme</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'light' as const, icon: Sun, label: 'Light' },
                      { id: 'dark' as const, icon: Moon, label: 'Dark' },
                      { id: 'system' as const, icon: Monitor, label: 'System' },
                    ].map(({ id, icon: ThemeIcon, label }) => (
                      <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`flex flex-col items-center justify-center p-3 border-2 transition-colors ${theme === id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                      >
                        <ThemeIcon className="w-5 h-5 mb-2" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Session Info
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Last Sign In
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {session?.user?.last_sign_in_at
                          ? new Date(session.user.last_sign_in_at).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Auth ID
                      </span>
                      <span className="font-mono text-xs text-foreground truncate max-w-[180px]">
                        {session?.user?.id?.slice(0, 16) || '—'}…
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-5">
              <SectionHeader icon={Bell} title="Notifications" color="text-chart-5" />
              <div className="space-y-1">
                {[
                  {
                    id: 'shipment_delays',
                    label: 'Shipment Delays',
                    desc: 'Get notified when shipments are delayed',
                  },
                  {
                    id: 'new_orders',
                    label: 'New Orders',
                    desc: 'Alerts for incoming shipment orders',
                  },
                  {
                    id: 'system_alerts',
                    label: 'System Alerts',
                    desc: 'Critical system notifications',
                  },
                  {
                    id: 'driver_updates',
                    label: 'Driver Updates',
                    desc: 'Real-time driver status changes',
                  },
                ].map((item) => (
                  <ToggleSwitch
                    key={item.id}
                    checked={notifications[item.id as keyof typeof notifications]}
                    onToggle={() => toggleNotification(item.id as keyof typeof notifications)}
                    label={item.label}
                  />
                ))}
              </div>
            </Card>

            {/* Security */}
            <Card className="p-5">
              <SectionHeader icon={Shield} title="Security" color="text-status-success" />
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border border-border">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Two-Factor Authentication
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Managed via Identity Provider
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border border-border">
                  <div>
                    <div className="text-sm font-medium text-foreground">API Access Keys</div>
                    <div className="text-xs text-muted-foreground">Admin access required</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Keys
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border border-border">
                  <div>
                    <div className="text-sm font-medium text-foreground">Password Policy</div>
                    <div className="text-xs text-muted-foreground">
                      Minimum 8 characters, leak protection enabled
                    </div>
                  </div>
                  <Badge variant="outline" className="text-status-success border-status-success/30">
                    Enforced
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ============= AUDIT LOGS TAB ============= */}
        <TabsContent value="AUDIT" className="mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={Activity} title="System Audit Logs" />
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {filteredLogs.length} entries
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto border border-border">
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
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {auditSearch ? 'No logs matching search.' : 'No logs found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-foreground text-xs">
                          {log.actorId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-mono">{log.entityType}</span>
                          <span className="text-muted-foreground ml-1">
                            ({log.entityId?.slice(0, 8)}…)
                          </span>
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
