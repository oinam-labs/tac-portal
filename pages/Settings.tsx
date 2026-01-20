import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, Th, Td } from '../components/ui/CyberComponents';
import { Bell, Shield, Globe, Activity } from 'lucide-react';
import { useAuditStore } from '../store/auditStore';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'AUDIT'>('GENERAL');
    const { logs, fetchLogs } = useAuditStore();

    useEffect(() => {
        if (activeTab === 'AUDIT') {
            fetchLogs();
        }
    }, [activeTab]);

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
                                <label className="block text-xs font-mono text-muted-foreground mb-1">TERMINAL NAME</label>
                                <Input defaultValue="TAC Cargo HQ - Node 1" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-muted-foreground mb-1">TIMEZONE</label>
                                <Input defaultValue="UTC-5 (Eastern Standard Time)" />
                            </div>
                            <div className="pt-2">
                                <Button>Save Changes</Button>
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
                            {['Shipment Delays', 'New Orders', 'System Alerts', 'Driver Updates'].map((item) => (
                                <div key={item} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                    <span className="text-sm text-foreground">{item}</span>
                                    <div className="w-10 h-5 bg-cyber-accent/20 rounded-full relative cursor-pointer">
                                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-cyber-accentHover dark:bg-cyber-neon rounded-full shadow-[0_0_5px_#22d3ee]"></div>
                                    </div>
                                </div>
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
                                    <div className="text-xs text-muted-foreground">Enabled via Authenticator App</div>
                                </div>
                                <Button variant="secondary" size="sm">Configure</Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-bold text-foreground">API Access Keys</div>
                                    <div className="text-xs text-muted-foreground">Last used 2 hours ago</div>
                                </div>
                                <Button variant="secondary" size="sm">Manage Keys</Button>
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
                                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No logs found.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted transition-colors border-b border-cyber-border/30">
                                            <Td className="font-mono text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</Td>
                                            <Td className="font-bold text-foreground">{log.actorId}</Td>
                                            <Td><span className="text-primary font-mono text-xs">{log.action}</span></Td>
                                            <Td className="text-xs">{log.entityType} ({log.entityId})</Td>
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
