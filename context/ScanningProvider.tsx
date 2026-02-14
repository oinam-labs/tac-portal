import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
// import { BarcodeScanner } from '@/components/scanning/BarcodeScanner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ScanBarcode, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ScanSource } from '@/types';

type ScanCallback = (data: string, source: ScanSource) => void;

interface ScanningContextType {
    scan: () => Promise<string>;
    isScanning: boolean;
    cancelScan: () => void;
    subscribe: (callback: ScanCallback) => () => void;
}

const ScanningContext = createContext<ScanningContextType | undefined>(undefined);

export function useScanner() {
    const context = useContext(ScanningContext);
    if (!context) {
        throw new Error('useScanner must be used within a ScanningProvider');
    }
    return context;
}

interface ScanningProviderProps {
    children: ReactNode;
}

export function ScanningProvider({ children }: ScanningProviderProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [resolveScan, setResolveScan] = useState<((value: string) => void) | null>(null);
    const [rejectScan, setRejectScan] = useState<((reason?: any) => void) | null>(null);
    const listenersRef = useRef<Set<ScanCallback>>(new Set());
    const inputRef = useRef<HTMLInputElement>(null);

    const subscribe = useCallback((callback: ScanCallback) => {
        listenersRef.current.add(callback);

        return () => {
            listenersRef.current.delete(callback);
        };
    }, []);

    const notifyListeners = useCallback((data: string, source: ScanSource) => {
        // Log for debugging
        console.log(`[ScanningProvider] Scan detected: ${data} via ${source}`);
        if (listenersRef.current.size > 0) {
            listenersRef.current.forEach(cb => {
                try {
                    cb(data, source);
                } catch (e) {
                    console.error('[ScanningProvider] Error in listener:', e);
                }
            });
        } else {
            // If no listeners, at least show a toast so user knows something happened
            // But only for HID, as Camera is explicit intent
            if (source === ScanSource.BARCODE_SCANNER) {
                toast.success(`Scanned: ${data}`);
            }
        }
    }, []);

    // Keyboard listener for hardware scanners (HID mode)
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
                return;
            }

            const currentTime = Date.now();

            // Hardware scanners typically send characters very quickly (e.g. < 50ms)
            if (currentTime - lastKeyTime > 100) {
                buffer = '';
            }

            lastKeyTime = currentTime;

            if (e.key === 'Enter') {
                if (buffer.length > 3) { // Minimum length to consider a valid scan
                    // Notify listeners
                    notifyListeners(buffer, ScanSource.BARCODE_SCANNER);

                    // If we have an active promise (camera UI open), resolve it too
                    if (isScanning && resolveScan) {
                        resolveScan(buffer);
                        // We do NOT cleanup here immediately to allow generic handling? 
                        // Actually yes, if UI is open and they scan, it counts as the result.
                        cleanup();
                    }
                }
                buffer = '';
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isScanning, resolveScan, notifyListeners]);

    const cleanup = useCallback(() => {
        setIsScanning(false);
        setResolveScan(null);
        setRejectScan(null);
    }, []);

    const scan = useCallback(() => {
        if (isScanning) {
            return Promise.reject(new Error('Scan already in progress'));
        }

        return new Promise<string>((resolve, reject) => {
            setIsScanning(true);
            setResolveScan(() => resolve);
            setRejectScan(() => reject);
        });
    }, [isScanning]);

    const cancelScan = useCallback(() => {
        if (rejectScan) {
            rejectScan(new Error('Scan cancelled by user'));
        }
        cleanup();
    }, [cleanup, rejectScan]);

    // const handleScanResult = (result: string) => {
    //     notifyListeners(result, ScanSource.CAMERA);
    //     if (resolveScan) {
    //         resolveScan(result);
    //     }
    //     cleanup(); // Close scanner immediately after success
    // };

    // const handleScanError = (error: Error) => {
    //     console.error("Scanner error:", error);
    //     // Don't close on error, let user try again or cancel
    //     toast.error("Failed to scan. Please try again.");
    // Force focus on input when scanning starts
    // Force focus on input when scanning starts
    // useEffect(() => {
    //     if (isScanning && inputRef.current) {
    //         console.log('[ScanningProvider] useEffect force focus');
    //         // Small timeout to ensure dialog animation is done/mounted
    //         setTimeout(() => {
    //             inputRef.current?.focus();
    //         }, 100);
    //     }
    // }, [isScanning]);

    const handleManualSubmit = () => {
        if (inputRef.current?.value && resolveScan) {
            resolveScan(inputRef.current.value.trim());
            cleanup();
        }
    };

    return (
        <ScanningContext.Provider value={{ scan, isScanning, cancelScan, subscribe }}>
            {children}

            <Dialog open={isScanning} onOpenChange={(open) => !open && cancelScan()}>
                <DialogContent
                    className="sm:max-w-md p-0 overflow-hidden bg-black border-zinc-800 text-white gap-0"
                    aria-describedby="scan-instructions"
                    onOpenAutoFocus={(e) => {
                        // Prevent Radix from focusing the first focusable element automatically
                        // We handle it manually to ensure our input gets it
                        e.preventDefault();
                        inputRef.current?.focus();
                    }}
                >
                    <div className="relative w-full aspect-[4/3] bg-black">
                        <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center space-y-4">
                            <div className="relative">
                                <ScanBarcode className="w-16 h-16 text-primary animate-pulse" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-4 w-full max-w-xs mx-auto">
                                <h3 className="text-lg font-semibold">Ready to Scan</h3>
                                <p id="scan-instructions" className="text-sm text-zinc-400">
                                    Scan barcode or type manually below.
                                </p>
                                <DialogTitle className="sr-only">Scanning Interface</DialogTitle>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    placeholder="Scan or type ID..."
                                    className="bg-zinc-900 border-zinc-700 text-center text-lg h-12 flex-1 focus:ring-2 focus:ring-primary text-white placeholder:text-zinc-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleManualSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleManualSubmit}
                                    size="icon"
                                    className="h-12 w-12 shrink-0"
                                    title="Search Manually"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white hover:bg-white/20 z-50 pointer-events-auto"
                            onClick={cancelScan}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </ScanningContext.Provider >
    );
}
