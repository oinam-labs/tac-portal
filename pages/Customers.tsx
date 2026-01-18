
import React, { useEffect, useState } from 'react';
import { Card, Table, Th, Td, Badge, Button, Input } from '../components/ui/CyberComponents';
import { useShipmentStore } from '../store/shipmentStore';
import { Mail, Phone, MoreHorizontal, Plus, Building, User, FileText } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    type: z.enum(['INDIVIDUAL', 'BUSINESS']),
    name: z.string().min(2, "Name required"),
    companyName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(8, "Phone required"),
    address: z.string().min(5, "Address required"),
    tier: z.enum(['STANDARD', 'PRIORITY', 'ENTERPRISE']),
    gstin: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const Customers: React.FC = () => {
    const { customers, fetchCustomers, addCustomer, isLoading } = useShipmentStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: 'BUSINESS',
            tier: 'STANDARD'
        }
    });

    const customerType = watch('type');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const onSubmit = async (data: FormData) => {
        await addCustomer(data);
        setIsModalOpen(false);
        reset();
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Directory</h1>
                    <p className="text-slate-500 text-sm">Manage client profiles and contracts.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Customer
                </Button>
            </div>
            
            <Card>
                <div className="mb-4 max-w-md">
                    <Input 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table>
                    <thead>
                        <tr>
                            <Th>Identity</Th>
                            <Th>Contact Info</Th>
                            <Th>Tier</Th>
                            <Th>GSTIN</Th>
                            <Th>Contracts</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-500">No customers found.</td></tr>
                        ) : (
                            filteredCustomers.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-cyber-neon">
                                                {c.type === 'BUSINESS' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{c.companyName || c.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{c.id}</div>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="text-sm text-slate-700 dark:text-slate-300">{c.name}</div>
                                        <div className="flex gap-3 mt-1 text-xs">
                                            <a href={`mailto:${c.email}`} className="text-slate-500 hover:text-cyber-accentHover dark:hover:text-cyber-neon flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {c.email}
                                            </a>
                                            <a href={`tel:${c.phone}`} className="text-slate-500 hover:text-cyber-accentHover dark:hover:text-cyber-neon flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {c.phone}
                                            </a>
                                        </div>
                                    </Td>
                                    <Td>
                                        <Badge variant={c.tier === 'ENTERPRISE' ? 'neon' : 'default'}>{c.tier}</Badge>
                                    </Td>
                                    <Td>
                                        {c.gstin ? <div className="font-mono text-xs flex items-center gap-1"><FileText className="w-3 h-3 text-slate-400" />{c.gstin}</div> : <span className="text-slate-400">-</span>}
                                    </Td>
                                    <Td className="text-slate-900 dark:text-white font-mono">{c.activeContracts || 0}</Td>
                                    <Td>
                                        <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Customer">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">TYPE</label>
                            <select {...register('type')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="BUSINESS">Business</option>
                                <option value="INDIVIDUAL">Individual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">TIER</label>
                            <select {...register('tier')} className="w-full bg-cyber-card border border-cyber-border rounded-lg p-2">
                                <option value="STANDARD">Standard</option>
                                <option value="PRIORITY">Priority</option>
                                <option value="ENTERPRISE">Enterprise</option>
                            </select>
                        </div>
                    </div>

                    {customerType === 'BUSINESS' && (
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">COMPANY NAME</label>
                                <Input {...register('companyName')} placeholder="e.g. Globex Corp" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">GSTIN</label>
                                <Input {...register('gstin')} placeholder="GST Number" />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">FULL NAME (CONTACT)</label>
                        <Input {...register('name')} placeholder="e.g. John Doe" />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">EMAIL</label>
                            <Input {...register('email')} type="email" placeholder="e.g. contact@domain.com" />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1">PHONE</label>
                            <Input {...register('phone')} placeholder="e.g. +91 99999 88888" />
                            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-slate-500 mb-1">BILLING ADDRESS</label>
                        <Input {...register('address')} placeholder="e.g. 123 Business Park, New Delhi" />
                        {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Creating...' : 'Create Customer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
