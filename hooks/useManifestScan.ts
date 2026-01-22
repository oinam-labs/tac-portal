/**
 * useManifestScan Hook
 * Dedicated hook for barcode scanning operations in manifest building
 * 
 * Features:
 * - Keyboard wedge scanner support (external barcode scanner)
 * - Manual entry support
 * - Camera scanning integration (placeholder for future)
 * - Scan debouncing and buffering
 * - Audio/visual feedback
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    manifestService,
    type ScanResponse,
    type ScanSource,
} from '@/lib/services/manifestService';
import { parseScanInput } from '@/lib/scanParser';

export interface ScanOptions {
    manifestId: string;
    staffId?: string;
    validateDestination?: boolean;
    validateStatus?: boolean;
    onSuccess?: (result: ScanResponse) => void;
    onError?: (result: ScanResponse) => void;
    onDuplicate?: (result: ScanResponse) => void;
    playSound?: boolean;
    debounceMs?: number;
}

export interface ScanState {
    isScanning: boolean;
    lastResult: ScanResponse | null;
    scanCount: number;
    successCount: number;
    errorCount: number;
    duplicateCount: number;
    scanHistory: ScanHistoryEntry[];
}

export interface ScanHistoryEntry extends ScanResponse {
    timestamp: string;
    scanSource: ScanSource;
}

const SCAN_DEBOUNCE_MS = 100;
const KEYBOARD_BUFFER_TIMEOUT_MS = 50;

/**
 * Manages scanning flows, history, debouncing, feedback, and callbacks for building a manifest.
 *
 * Creates a scanner tied to a specific manifest that processes scan tokens (manual, barcode, camera),
 * updates counters and scan history, debounces rapid input, emits optional audio feedback, and invokes
 * the provided callbacks for success, error, and duplicate results.
 *
 * @param options - Configuration for the scanner:
 *   - manifestId: target manifest identifier (required)
 *   - staffId: optional staff identifier included with each scan
 *   - validateDestination: whether to validate shipment destination (default: true)
 *   - validateStatus: whether to validate shipment status (default: true)
 *   - onSuccess/onError/onDuplicate: callbacks invoked with the ScanResponse for respective outcomes
 *   - playSound: enable audio feedback (default: true)
 *   - debounceMs: minimum interval between processed scans in milliseconds
 *
 * @returns An object exposing:
 *   - State: isScanning, lastResult, scanCount, successCount, errorCount, duplicateCount, scanHistory
 *   - Actions: scanManual(token), scanBarcode(token), scanCamera(token), processScan(token, source),
 *     enableKeyboardWedge(), resetStats()
 *   - Utilities: normalizeScanToken, isValidAwbFormat
 */
export function useManifestScan(options: ScanOptions) {
    const {
        manifestId,
        staffId,
        validateDestination = true,
        validateStatus = true,
        onSuccess,
        onError,
        onDuplicate,
        playSound = true,
        debounceMs = SCAN_DEBOUNCE_MS,
    } = options;

    const [state, setState] = useState<ScanState>({
        isScanning: false,
        lastResult: null,
        scanCount: 0,
        successCount: 0,
        errorCount: 0,
        duplicateCount: 0,
        scanHistory: [],
    });

    // Refs for debouncing and keyboard buffer
    const lastScanTimeRef = useRef<number>(0);
    const keyboardBufferRef = useRef<string>('');
    const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Audio feedback
    const playBeep = useCallback((type: 'success' | 'error' | 'duplicate') => {
        if (!playSound) return;

        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different results
            const frequencies: Record<string, number> = {
                success: 880,    // High A
                duplicate: 440,  // Middle A
                error: 220,      // Low A
            };

            oscillator.frequency.value = frequencies[type];
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch {
            // Audio not available
        }
    }, [playSound]);

    // Core scan function
    const processScan = useCallback(
        async (scanToken: string, source: ScanSource = 'MANUAL'): Promise<ScanResponse> => {
            const trimmed = scanToken.trim();
            if (!trimmed) {
                return { success: false, error: 'EMPTY_SCAN', message: 'Empty scan token' };
            }

            let parsedToken = trimmed;
            try {
                const parsed = parseScanInput(trimmed);
                if (parsed.type !== 'shipment' || !parsed.awb) {
                    return {
                        success: false,
                        error: 'INVALID_SCAN_TYPE',
                        message: 'Only shipment AWB scans are supported in manifest build',
                    };
                }
                parsedToken = parsed.awb;
            } catch {
                // Ignore parser errors and allow raw tokens (e.g., numeric IATA AWB)
            }

            // Debounce rapid scans
            const now = Date.now();
            if (now - lastScanTimeRef.current < debounceMs) {
                return { success: false, error: 'DEBOUNCED', message: 'Scan too fast, debounced' };
            }
            lastScanTimeRef.current = now;

            setState((s) => ({ ...s, isScanning: true, scanCount: s.scanCount + 1 }));

            try {
                const result = await manifestService.addShipmentByScan(manifestId, parsedToken, {
                    staffId,
                    scanSource: source,
                    validateDestination,
                    validateStatus,
                });

                const historyEntry: ScanHistoryEntry = {
                    ...result,
                    timestamp: new Date().toISOString(),
                    scanSource: source,
                };

                setState((s) => ({
                    ...s,
                    isScanning: false,
                    lastResult: result,
                    successCount: result.success && !result.duplicate ? s.successCount + 1 : s.successCount,
                    errorCount: !result.success ? s.errorCount + 1 : s.errorCount,
                    duplicateCount: result.duplicate ? s.duplicateCount + 1 : s.duplicateCount,
                    scanHistory: [historyEntry, ...s.scanHistory].slice(0, 50),
                }));

                // Feedback
                if (result.success) {
                    if (result.duplicate) {
                        playBeep('duplicate');
                        onDuplicate?.(result);
                    } else {
                        playBeep('success');
                        onSuccess?.(result);
                    }
                } else {
                    playBeep('error');
                    onError?.(result);
                }

                return result;
            } catch (error) {
                const errorResult: ScanResponse = {
                    success: false,
                    error: 'SYSTEM_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                const historyEntry: ScanHistoryEntry = {
                    ...errorResult,
                    timestamp: new Date().toISOString(),
                    scanSource: source,
                };

                setState((s) => ({
                    ...s,
                    isScanning: false,
                    lastResult: errorResult,
                    errorCount: s.errorCount + 1,
                    scanHistory: [historyEntry, ...s.scanHistory].slice(0, 50),
                }));

                playBeep('error');
                onError?.(errorResult);
                return errorResult;
            }
        },
        [manifestId, staffId, validateDestination, validateStatus, debounceMs, playBeep, onSuccess, onError, onDuplicate]
    );

    // Manual scan (from input field)
    const scanManual = useCallback(
        (token: string) => processScan(token, 'MANUAL'),
        [processScan]
    );

    // Barcode scanner scan (keyboard wedge)
    const scanBarcode = useCallback(
        (token: string) => processScan(token, 'BARCODE_SCANNER'),
        [processScan]
    );

    // Camera scan
    const scanCamera = useCallback(
        (token: string) => processScan(token, 'CAMERA'),
        [processScan]
    );

    // Keyboard wedge handler - detects rapid keystrokes from barcode scanner
    const handleKeyboardWedge = useCallback(
        (event: KeyboardEvent) => {
            // Most barcode scanners end with Enter
            if (event.key === 'Enter') {
                if (keyboardBufferRef.current.length >= 3) {
                    // Process buffered scan
                    scanBarcode(keyboardBufferRef.current);
                }
                keyboardBufferRef.current = '';
                if (keyboardTimeoutRef.current) {
                    clearTimeout(keyboardTimeoutRef.current);
                    keyboardTimeoutRef.current = null;
                }
                return;
            }

            // Only capture printable characters
            if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                keyboardBufferRef.current += event.key;

                // Clear timeout and set new one
                if (keyboardTimeoutRef.current) {
                    clearTimeout(keyboardTimeoutRef.current);
                }

                keyboardTimeoutRef.current = setTimeout(() => {
                    // If buffer has content after timeout, it was manual typing not scanner
                    keyboardBufferRef.current = '';
                    keyboardTimeoutRef.current = null;
                }, KEYBOARD_BUFFER_TIMEOUT_MS);
            }
        },
        [scanBarcode]
    );

    // Enable/disable keyboard wedge listener
    const enableKeyboardWedge = useCallback(() => {
        document.addEventListener('keydown', handleKeyboardWedge);
        return () => document.removeEventListener('keydown', handleKeyboardWedge);
    }, [handleKeyboardWedge]);

    // Reset stats
    const resetStats = useCallback(() => {
        setState({
            isScanning: false,
            lastResult: null,
            scanCount: 0,
            successCount: 0,
            errorCount: 0,
            duplicateCount: 0,
            scanHistory: [],
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (keyboardTimeoutRef.current) {
                clearTimeout(keyboardTimeoutRef.current);
            }
        };
    }, []);

    return {
        // State
        ...state,

        // Actions
        scanManual,
        scanBarcode,
        scanCamera,
        processScan,
        enableKeyboardWedge,
        resetStats,

        // Utilities
        normalizeScanToken: manifestService.normalizeScanToken,
        isValidAwbFormat: manifestService.isValidAwbFormat,
    };
}

/**
 * Binds a text input to the manifest scanner, providing input state and handlers that submit the current value on Enter or form submit.
 *
 * @param options - Configuration for the hook. Includes the same scan options accepted by the scanner plus:
 *   - inputRef: optional ref to an HTML input element that will be focused after a successful scan.
 * @returns An object combining the scanner's state and actions with input helpers:
 *   - inputValue: current input string
 *   - setInputValue: setter for the input value
 *   - handleChange: change handler for an <input> element
 *   - handleKeyDown: keydown handler that submits on Enter
 *   - handleSubmit: submit handler that processes the current input, clears it on success, and refocuses the input when `inputRef` is provided
 *   - plus all fields returned by `useManifestScan` (state, scan actions, and utilities)
 */
export function useScanInput(options: ScanOptions & { inputRef?: React.RefObject<HTMLInputElement | null> }) {
    const { inputRef, ...scanOptions } = options;
    const [inputValue, setInputValue] = useState('');
    const scanner = useManifestScan(scanOptions);

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!inputValue.trim()) return;

            const result = await scanner.scanManual(inputValue);

            if (result.success) {
                setInputValue('');
                // Refocus input for next scan
                inputRef?.current?.focus();
            }
        },
        [inputValue, scanner, inputRef]
    );

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    return {
        ...scanner,
        inputValue,
        setInputValue,
        handleChange,
        handleKeyDown,
        handleSubmit,
    };
}

export default useManifestScan;