import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ScanBarcode, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ScanSource } from '@/types';
import { ScanningContext, type ScanCallback } from './ScanningContext';

interface ScanningProviderProps {
    children: ReactNode;
}

// --- Constants ---
// If keystrokes arrive faster than this, they are from a scanner, not a human.
const SCANNER_SPEED_THRESHOLD_MS = 60;
// Minimum number of characters for a valid scan sequence.
const MIN_SCAN_LENGTH = 3;
// If no key arrives within this window, the buffer is considered stale and reset.
const BUFFER_STALE_TIMEOUT_MS = 500;

export function ScanningProvider({ children }: ScanningProviderProps) {
    const [isScanning, setIsScanning] = useState(false);
    const listenersRef = useRef<Set<ScanCallback>>(new Set());
    const inputRef = useRef<HTMLInputElement>(null);

    // Use refs for values that the keyboard handler needs, to avoid stale closures (BUG 1 fix)
    const isScanningRef = useRef(false);
    const resolveScanRef = useRef<((value: string) => void) | null>(null);
    const rejectScanRef = useRef<((reason?: unknown) => void) | null>(null);

    // Scanner detection state (all in refs to keep the handler closure stable)
    const bufferRef = useRef<string>('');
    const lastKeyTimeRef = useRef<number>(0);
    const keyTimingsRef = useRef<number[]>([]); // Inter-key delays for speed detection

    // Keep the ref in sync with state
    useEffect(() => {
        isScanningRef.current = isScanning;
    }, [isScanning]);

    const subscribe = useCallback((callback: ScanCallback) => {
        listenersRef.current.add(callback);
        return () => {
            listenersRef.current.delete(callback);
        };
    }, []);

    // Lifecycle logging (Removed for production cleanup)
    useEffect(() => {
        return () => {
            // cleanup
        };
    }, []);

    const notifyListeners = useCallback((data: string, source: ScanSource) => {
        if (listenersRef.current.size > 0) {
            listenersRef.current.forEach(cb => {
                try {
                    cb(data, source);
                } catch (e) {
                    console.error('[ScanningProvider] Error in listener:', e);
                }
            });
        } else {
            console.warn('[ScanningProvider] No listeners registered for this scan.');
            if (source === ScanSource.BARCODE_SCANNER) {
                toast.success(`Scanned: ${data}`);
            }
        }
    }, []);

    /**
     * Determines if the accumulated key timings indicate scanner-speed input.
     * Scanners typically send keys <50ms apart consistently.
     * Humans rarely sustain <60ms per key for more than 2-3 keys.
     */
    const isScannerSpeed = useCallback((timings: number[]): boolean => {
        if (timings.length < 2) return false; // Need at least 3 characters (2 intervals)
        const avgDelay = timings.reduce((a, b) => a + b, 0) / timings.length;
        return avgDelay < SCANNER_SPEED_THRESHOLD_MS;
    }, []);

    // Keyboard listener for hardware scanners (HID mode) — registered ONCE (BUG 1 fix)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isScannerInput = target === inputRef.current;

            const currentTime = Date.now();
            const timeSinceLastKey = currentTime - lastKeyTimeRef.current;

            // Reset buffer if stale (no key for BUFFER_STALE_TIMEOUT_MS)
            if (timeSinceLastKey > BUFFER_STALE_TIMEOUT_MS) {
                bufferRef.current = '';
                keyTimingsRef.current = [];
            }

            lastKeyTimeRef.current = currentTime;

            // Handle terminator keys (Enter / Tab)
            if (e.key === 'Enter' || e.key === 'Tab') {
                const buffer = bufferRef.current;
                const timings = keyTimingsRef.current;
                const scannerDetected = buffer.length >= MIN_SCAN_LENGTH && isScannerSpeed(timings);

                if (scannerDetected) {
                    // Prevent the Enter/Tab from doing its default action (form submit, tab navigation)
                    e.preventDefault();
                    e.stopPropagation();

                    // If the scan landed in an input field, clear it (BUG 5 fix)
                    if (target.tagName === 'INPUT' && target !== inputRef.current) {
                        (target as HTMLInputElement).value = '';
                        // Also dispatch input event so React state stays in sync
                        target.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Pass raw buffer directly to listeners — no parseScanInput (BUG 2 fix)
                    const cleanCode = buffer.trim();
                    notifyListeners(cleanCode, ScanSource.BARCODE_SCANNER);

                    // If the scan dialog is open, also resolve the promise (BUG 1 fix — uses ref)
                    if (isScanningRef.current && resolveScanRef.current) {
                        resolveScanRef.current(cleanCode);
                        cleanupInternal();
                    }
                }
                // else: Not scanner speed, let the event propagate normally
                // (allows manual Enter in search bars, forms, etc.)

                // Always reset buffer after terminator
                bufferRef.current = '';
                keyTimingsRef.current = [];
                return;
            }

            // Accumulate printable characters
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Record inter-key timing
                if (bufferRef.current.length > 0) {
                    keyTimingsRef.current.push(timeSinceLastKey);
                }
                bufferRef.current += e.key;

                // If we're accumulating in an input that isn't our scanner input,
                // and the speed indicates scanner, prevent the character from going into the input.
                // We do this proactively after accumulating enough evidence.
                if (!isScannerInput && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                    const timings = keyTimingsRef.current;
                    if (timings.length >= 2 && isScannerSpeed(timings)) {
                        // This is likely a scanner — prevent character from entering the focused input
                        e.preventDefault();
                    }
                }
            }
        };

        // Use capture phase so we can intercept before any other handlers
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [notifyListeners, isScannerSpeed]); // Stable deps only — no state variables

    const cleanupInternal = () => {
        isScanningRef.current = false;
        resolveScanRef.current = null;
        rejectScanRef.current = null;
        setIsScanning(false);
    };

    const scan = useCallback(() => {
        if (isScanningRef.current) {
            return Promise.reject(new Error('Scan already in progress'));
        }

        return new Promise<string>((resolve, reject) => {
            isScanningRef.current = true;
            resolveScanRef.current = resolve;
            rejectScanRef.current = reject;
            setIsScanning(true);
        });
    }, []);

    const cancelScan = useCallback(() => {
        if (rejectScanRef.current) {
            rejectScanRef.current(new Error('Scan cancelled by user'));
        }
        cleanupInternal();
    }, []);

    // Focus the input when the scanning dialog opens
    useEffect(() => {
        if (isScanning && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isScanning]);

    const handleManualSubmit = () => {
        const value = inputRef.current?.value?.trim();
        if (value && resolveScanRef.current) {
            resolveScanRef.current(value);
            cleanupInternal();
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
                        e.preventDefault();
                    }}
                >
                    <DialogDescription className="sr-only">
                        Use your barcode scanner or type manually to search.
                    </DialogDescription>
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
                                            // Stop propagation so the global handler doesn't also
                                            // try to process this as a scanner scan (BUG 7 fix)
                                            e.stopPropagation();
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
