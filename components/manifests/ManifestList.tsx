import React from 'react';
import { useManifests } from '../../hooks/useManifests';
import { Button, Card, Table, Th, Td } from '../ui/CyberComponents';
import { FileText, Plane, Truck, ArrowRight, Loader } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

export const ManifestList: React.FC = () => {
    const { data: manifests, isLoading, error } = useManifests();
    const navigate = useNavigate();

    if (isLoading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-cyber-neon" /></div>;
    if (error) return <div className="text-red-500">Error loading manifests</div>;

    return (
        <Card className="p-6 bg-white dark:bg-cyber-surface border border-cyber-border">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyber-neon to-purple-400 bg-clip-text text-transparent">
                        Linehaul Manifests
                    </h2>
                    <p className="text-xs text-slate-500">Manage hub-to-hub transport</p>
                </div>
                <Button onClick={() => navigate('/manifests/create')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Manifest
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <thead>
                        <tr>
                            <Th>MANIFEST NO</Th>
                            <Th>ROUTE</Th>
                            <Th>MODE</Th>
                            <Th>STATUS</Th>
                            <Th>LOAD</Th>
                            <Th>CREATED</Th>
                            <Th></Th>
                        </tr>
                    </thead>
                    <tbody>
                        {manifests?.map((manifest) => (
                            <tr
                                key={manifest.id}
                                className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <Td className="font-mono text-cyber-neon font-bold">
                                    <Link to={`/manifests/${manifest.id}`} className="hover:underline block w-full h-full">
                                        {manifest.manifest_no}
                                    </Link>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold">{manifest.from_hub?.code}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold">{manifest.to_hub?.code}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        {manifest.type === 'AIR' ? <Plane className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                        <span className="text-xs">{manifest.type}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <StatusBadge status={manifest.status} />
                                </Td>
                                <Td className="text-right">
                                    <div className="text-xs">
                                        <div>{manifest.total_shipments} Shipments</div>
                                        <div className="text-slate-400">{manifest.total_weight} kg</div>
                                    </div>
                                </Td>
                                <Td className="text-right text-xs text-slate-500">
                                    {format(new Date(manifest.created_at), 'dd MMM HH:mm')}
                                </Td>
                                <Td className="text-right">
                                    <Link to={`/manifests/${manifest.id}`} className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyber-neon transition-colors" />
                                    </Link>
                                </Td>
                            </tr>
                        ))}
                        {(!manifests || manifests.length === 0) && (
                            <tr>
                                <Td className="text-center py-8 text-slate-500">
                                    No manifests found (ColSpan not supported in Td wrapper properly, checked manually)
                                </Td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Card>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        OPEN: 'border-blue-500 text-blue-500 bg-blue-500/10',
        CLOSED: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
        DEPARTED: 'border-purple-500 text-purple-500 bg-purple-500/10',
        ARRIVED: 'border-green-500 text-green-500 bg-green-500/10',
    };
    return (
        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${styles[status] || 'border-slate-500 text-slate-500'}`}>
            {status}
        </span>
    );
};
