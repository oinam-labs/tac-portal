import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui/CyberComponents';
import { BarcodeScanner } from '../components/scanning/BarcodeScanner';
import { ScanLine, Box, Check, X, Truck, AlertTriangle, Camera, Keyboard } from 'lucide-react';
import { parseScanInput } from '../lib/scanParser';
import { useScanQueue } from '../store/scanQueueStore';
import { useUpdateShipmentStatus } from '../hooks/useShipments';
import { supabase } from '../lib/supabase';
import { playSuccessFeedback, playErrorFeedback, playWarningFeedback, playManifestActivatedFeedback } from '../lib/feedback';

type ScanMode = 'RECEIVE' | 'DELIVER' | 'LOAD_MANIFEST' | 'VERIFY_MANIFEST';

interface ActiveManifest {
    id: string;
    manifest_no: string;
    from_hub_id: string;
    to_hub_id: string;
    status: string;
}

export const Scanning: React.FC = () => {
    const [scannedItems, setScannedItems] = useState<{ code: string; status: 'SUCCESS' | 'ERROR'; msg: string; timestamp: string }[]>([]);
    const [currentCode, setCurrentCode] = useState('');
    const [scanMode, setScanMode] = useState<ScanMode>('RECEIVE');
    const [activeManifest, setActiveManifest] = useState<ActiveManifest | null>(null);
    const [useCameraScanner, setUseCameraScanner] = useState(true);
    const [scanCount, setScanCount] = useState({ success: 0, error: 0 });

    // Offline queue
    const { addScan, pendingScans, isOnline, syncPending } = useScanQueue();

    // Mutations
    const updateStatus = useUpdateShipmentStatus();

    // Sync pending scans when online
    useEffect(() => {
        if (isOnline && pendingScans.length > 0) {
            syncPending();
        }
    }, [isOnline, pendingScans.length]);

    const addScanResult = useCallback((code: string, status: 'SUCCESS' | 'ERROR', msg: string, feedbackType?: 'manifest' | 'duplicate') => {
        const timestamp = new Date().toLocaleTimeString();
        setScannedItems(prev => [{ code, status, msg, timestamp }, ...prev]);
        setScanCount(prev => ({
            success: status === 'SUCCESS' ? prev.success + 1 : prev.success,
            error: status === 'ERROR' ? prev.error + 1 : prev.error
        }));

        // Play audio/haptic feedback
        if (feedbackType === 'manifest') {
            playManifestActivatedFeedback();
        } else if (feedbackType === 'duplicate') {
            playWarningFeedback();
        } else if (status === 'SUCCESS') {
            playSuccessFeedback();
        } else {
            playErrorFeedback();
        }
    }, []);

    const processScan = async (code: string) => {
        // Parse scan input using the scan parser
        let scanResult;
        try {
            scanResult = parseScanInput(code);
        } catch (e) {
            addScanResult(code, 'ERROR', e instanceof Error ? e.message : 'Invalid scan format');
            return;
        }

        // Handle Manifest scans
        if (scanResult.type === 'manifest') {
            if (!activeManifest) {
                // Try to load manifest
                const { data: manifest, error } = await (supabase
                    .from('manifests') as any)
                    .select('id, manifest_no, from_hub_id, to_hub_id, status')
                    .or(`id.eq.${scanResult.manifestId},manifest_no.eq.${scanResult.manifestNo}`)
                    .single();

                if (error || !manifest) {
                    addScanResult(code, 'ERROR', 'Manifest not found');
                    return;
                }

                const m = manifest as ActiveManifest;
                if (scanMode === 'LOAD_MANIFEST' && m.status !== 'OPEN') {
                    addScanResult(code, 'ERROR', `Manifest is ${m.status}, cannot load.`);
                    return;
                }

                if (scanMode === 'VERIFY_MANIFEST' && m.status !== 'DEPARTED') {
                    addScanResult(code, 'ERROR', `Manifest is ${m.status}, cannot verify.`);
                    return;
                }

                setActiveManifest(m);
                const action = scanMode === 'LOAD_MANIFEST' ? 'load packages' : 'verify arrival';
                addScanResult(m.manifest_no, 'SUCCESS', `Manifest active. Ready to ${action}.`, 'manifest');
            }
            return;
        }

        // Handle Shipment scans
        const awb = scanResult.awb;
        if (!awb) {
            addScanResult(code, 'ERROR', 'No AWB found in scan');
            return;
        }

        // If offline, queue the scan
        if (!isOnline) {
            addScan({
                awb,
                mode: scanMode,
                manifestId: activeManifest?.id,
            });
            addScanResult(awb, 'SUCCESS', 'Queued for sync (offline)');
            return;
        }

        // Fetch shipment from Supabase
        const { data: shipmentData, error: shipmentError } = await (supabase
            .from('shipments') as any)
            .select('id, awb_number, status, origin_hub_id, destination_hub_id')
            .eq('awb_number', awb)
            .single();

        if (shipmentError || !shipmentData) {
            addScanResult(awb, 'ERROR', 'Shipment not found in system.');
            return;
        }

        const shipment = shipmentData as { id: string; awb_number: string; status: string; origin_hub_id: string; destination_hub_id: string };

        try {
            if (scanMode === 'RECEIVE') {
                const newStatus = shipment.status === 'CREATED' ? 'RECEIVED' : 'RECEIVED_AT_DEST';
                await updateStatus.mutateAsync({ id: shipment.id, status: newStatus as any });
                addScanResult(awb, 'SUCCESS', `Status updated to ${newStatus}`);

            } else if (scanMode === 'LOAD_MANIFEST') {
                if (!activeManifest) throw new Error("No Active Manifest.");

                // Add to manifest
                const orgResult = await (supabase.from('orgs') as any).select('id').single();
                const { error: addError } = await (supabase
                    .from('manifest_items') as any)
                    .insert({
                        org_id: orgResult.data?.id,
                        manifest_id: activeManifest.id,
                        shipment_id: shipment.id,
                        scanned_at: new Date().toISOString(),
                    });

                if (addError) throw new Error(addError.message);

                // Update shipment status
                await updateStatus.mutateAsync({ id: shipment.id, status: 'LOADED_FOR_LINEHAUL' as any });
                addScanResult(awb, 'SUCCESS', `Loaded to ${activeManifest.manifest_no}`);

            } else if (scanMode === 'VERIFY_MANIFEST') {
                if (!activeManifest) throw new Error("No Active Manifest.");

                // Check if shipment is in manifest
                const { data: item } = await (supabase
                    .from('manifest_items') as any)
                    .select('id')
                    .eq('manifest_id', activeManifest.id)
                    .eq('shipment_id', shipment.id)
                    .single();

                if (item) {
                    await updateStatus.mutateAsync({ id: shipment.id, status: 'RECEIVED_AT_DEST' as any });
                    addScanResult(awb, 'SUCCESS', 'Verified & Received');
                } else {
                    // Create exception
                    const orgResult = await (supabase.from('orgs') as any).select('id').single();
                    await (supabase.from('exceptions') as any).insert({
                        org_id: orgResult.data?.id,
                        shipment_id: shipment.id,
                        type: 'MISROUTE',
                        severity: 'HIGH',
                        description: `Scanned with Manifest ${activeManifest.manifest_no} but not listed.`,
                        status: 'OPEN',
                    });
                    addScanResult(awb, 'ERROR', 'EXCEPTION: Shipment not in Manifest!');
                }

            } else if (scanMode === 'DELIVER') {
                await updateStatus.mutateAsync({ id: shipment.id, status: 'DELIVERED' as any });
                addScanResult(awb, 'SUCCESS', 'Marked as Delivered');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            addScanResult(awb, 'ERROR', errorMessage);
        }
    };

    const handleCameraScan = useCallback((result: string) => {
        processScan(result);
    }, [scanMode, activeManifest, isOnline]);

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCode) {
            processScan(currentCode);
            setCurrentCode('');
        }
    };

    const clearManifest = () => {
        setActiveManifest(null);
        setScannedItems([]);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terminal Scanner</h1>
                    <p className="text-sm text-slate-500">Process incoming/outgoing shipments.</p>
                </div>
                <div className="flex gap-2 bg-cyber-card p-1 rounded-lg border border-cyber-border">
                    <button
                        onClick={() => { setScanMode('RECEIVE'); setActiveManifest(null); }}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${scanMode === 'RECEIVE' ? 'bg-cyber-neon text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        RECEIVE
                    </button>
                    <button
                        onClick={() => { setScanMode('LOAD_MANIFEST'); setActiveManifest(null); }}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${scanMode === 'LOAD_MANIFEST' ? 'bg-purple-500 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        LOAD
                    </button>
                    <button
                        onClick={() => { setScanMode('VERIFY_MANIFEST'); setActiveManifest(null); }}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${scanMode === 'VERIFY_MANIFEST' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        VERIFY
                    </button>
                    <button
                        onClick={() => { setScanMode('DELIVER'); setActiveManifest(null); }}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${scanMode === 'DELIVER' ? 'bg-green-500 text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                        DELIVER
                    </button>
                </div>
            </div>

            {(scanMode === 'LOAD_MANIFEST' || scanMode === 'VERIFY_MANIFEST') && activeManifest && (
                <div className={`border p-3 rounded-lg flex items-center justify-between ${scanMode === 'LOAD_MANIFEST' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <div className="flex items-center gap-3">
                        <Truck className={scanMode === 'LOAD_MANIFEST' ? "text-purple-400" : "text-blue-400"} />
                        <div>
                            <div className="text-sm font-bold text-white">
                                {scanMode === 'LOAD_MANIFEST' ? 'Loading' : 'Verifying Arrival'}: {activeManifest.manifest_no}
                            </div>
                            <div className={`text-xs ${scanMode === 'LOAD_MANIFEST' ? 'text-purple-300' : 'text-blue-300'}`}>
                                {activeManifest.from_hub_id} → {activeManifest.to_hub_id}
                            </div>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={clearManifest}><X className="w-4 h-4" /></Button>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Camera / Scanner View */}
                <Card className="relative overflow-hidden flex flex-col border-cyber-neon/50 bg-black">
                    {/* Toggle Camera/Manual */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <button
                            onClick={() => setUseCameraScanner(true)}
                            className={`p-2 rounded-lg transition-all ${useCameraScanner ? 'bg-cyber-accent text-black' : 'bg-black/50 text-white hover:bg-black/70'}`}
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setUseCameraScanner(false)}
                            className={`p-2 rounded-lg transition-all ${!useCameraScanner ? 'bg-cyber-accent text-black' : 'bg-black/50 text-white hover:bg-black/70'}`}
                        >
                            <Keyboard className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scan Stats */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 text-xs font-mono">
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">✓ {scanCount.success}</span>
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">✗ {scanCount.error}</span>
                    </div>

                    {useCameraScanner ? (
                        <BarcodeScanner
                            onScan={handleCameraScan}
                            active={true}
                            className="flex-1 min-h-[300px]"
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                            <ScanLine className="w-16 h-16 text-cyber-neon mx-auto animate-pulse z-10" />
                            <div className="bg-black/80 px-4 py-2 rounded text-cyber-neon font-mono mt-4 z-10">
                                {(scanMode === 'LOAD_MANIFEST' || scanMode === 'VERIFY_MANIFEST') && !activeManifest
                                    ? 'ENTER MANIFEST CODE'
                                    : 'ENTER AWB MANUALLY'}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Manual Entry & Log */}
                <div className="flex flex-col gap-6 min-h-0">
                    <Card>
                        <form onSubmit={handleScanSubmit} className="flex gap-4">
                            <Input
                                placeholder={
                                    (scanMode === 'LOAD_MANIFEST' || scanMode === 'VERIFY_MANIFEST') && !activeManifest
                                        ? "Scan Manifest Ref..."
                                        : "Scan AWB..."
                                }
                                value={currentCode}
                                onChange={(e) => setCurrentCode(e.target.value)}
                                autoFocus
                            />
                            <Button type="submit" disabled={!currentCode}>Process</Button>
                        </form>
                    </Card>

                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Scan Log</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {scannedItems.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">No items scanned this session</div>
                            ) : (
                                scannedItems.map((item, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded border animate-[slideIn_0.2s_ease-out] ${item.status === 'SUCCESS' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className="flex items-center gap-3">
                                            {item.msg.includes('EXCEPTION') ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Box className={`w-4 h-4 ${item.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`} />}
                                            <div>
                                                <div className="font-mono font-bold text-slate-900 dark:text-white">{item.code}</div>
                                                <div className="text-xs text-slate-500">{item.msg}</div>
                                            </div>
                                        </div>
                                        {item.status === 'SUCCESS' ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
