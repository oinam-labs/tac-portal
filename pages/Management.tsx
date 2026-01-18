import React, { useEffect, useState } from 'react';
import { Card, Table, Th, Td, Badge, Button, Input } from '../components/ui/CyberComponents';
import { User, Shield, User as UserIcon, Plus } from 'lucide-react';
import { useManagementStore } from '../store/managementStore';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { UserRole, HubLocation } from '../types';
import { HUBS } from '../lib/constants';

interface FormData {
    name: string;
    email: string;
    role: UserRole;
    assignedHub?: HubLocation;
}

export const Management: React.FC = () => {
    const { users, fetchUsers, addUser, toggleUserStatus, isLoading } = useManagementStore();
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    const { register, handleSubmit, reset } = useForm<FormData>();

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (data: FormData) => {
        await addUser(data);
        setIsInviteOpen(false);
        reset();
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
                    <p className="text-slate-500 text-sm">Manage access control and personnel.</p>
                </div>
                <Button onClick={() => setIsInviteOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Invite User
                </Button>
            </div>

            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>User</Th>
                            <Th>Role</Th>
                            <Th>Hub</Th>
                            <Th>Status</Th>
                            <Th>Last Active</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-cyber-border">
                                            <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <Badge variant={u.role === 'ADMIN' ? 'neon' : 'outline'}>{u.role.replace('_', ' ')}</Badge>
                                </Td>
                                <Td>
                                    {u.assignedHub ? (
                                        <span className="text-xs font-mono">{HUBS[u.assignedHub].code}</span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </Td>
                                <Td>
                                    <span className={`flex items-center gap-1.5 text-xs ${u.active ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500 dark:bg-green-400' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
                                        {u.active ? 'Active' : 'Inactive'}
                                    </span>
                                </Td>
                                <Td className="text-xs text-slate-500 dark:text-slate-400">{u.lastLogin}</Td>
                                <Td>
                                    <Button 
                                        variant={u.active ? "danger" : "secondary"} 
                                        size="sm"
                                        onClick={() => toggleUserStatus(u.id, u.active)}
                                    >
                                        {u.active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite New Staff">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">FULL NAME</label>
                        <Input {...register('name', { required: true })} placeholder="e.g. Alice Johnson" />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">EMAIL ADDRESS</label>
                        <Input type="email" {...register('email', { required: true })} placeholder="e.g. alice@taccargo.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">ROLE</label>
                            <select {...register('role')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="OPS_STAFF">Operations Staff</option>
                                <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                                <option value="MANAGER">Manager</option>
                                <option value="FINANCE_STAFF">Finance</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">ASSIGNED HUB</label>
                            <select {...register('assignedHub')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="">Global / HQ</option>
                                {Object.values(HUBS).map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Sending Invite...' : 'Send Invite'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
