/**
 * Scan Parser
 * Parses barcode/QR scan inputs into structured data
 * Supports: raw AWB, JSON payload, manifest QR
 */

import { ValidationError } from '@/lib/errors';

export type ScanType = 'shipment' | 'manifest' | 'package';

export interface ScanResult {
    type: ScanType;
    awb?: string;
    manifestId?: string;
    manifestNo?: string;
    packageId?: string;
    route?: string;
    metadata?: Record<string, any>;
    raw: string;
}

export interface ScanPayloadV1 {
    v: 1;
    type?: 'shipment' | 'manifest' | 'package';
    awb?: string;
    id?: string;
    manifestNo?: string;
    packageId?: string;
    route?: string;
    metadata?: Record<string, any>;
}

/**
 * Parse scan input into structured result
 * Supports:
 * 1. Raw AWB: TAC12345678
 * 2. JSON shipment: {"v":1,"awb":"TAC12345678"}
 * 3. JSON manifest: {"v":1,"type":"manifest","id":"uuid","manifestNo":"MNF-2024-001"}
 * 4. JSON package: {"v":1,"type":"package","packageId":"PKG-001"}
 */
export function parseScanInput(input: string): ScanResult {
    const trimmed = input.trim();

    if (!trimmed) {
        throw new ValidationError('Empty scan input');
    }

    // 1. Try raw AWB format (TAC followed by 8 digits)
    if (/^TAC\d{8}$/i.test(trimmed)) {
        return {
            type: 'shipment',
            awb: trimmed.toUpperCase(),
            raw: trimmed,
        };
    }

    // 2. Try JSON payload
    if (trimmed.startsWith('{')) {
        try {
            const payload = JSON.parse(trimmed) as ScanPayloadV1;

            // Validate version
            if (payload.v !== 1) {
                throw new ValidationError('Unsupported scan payload version');
            }

            // Handle manifest scan
            if (payload.type === 'manifest') {
                if (!payload.id && !payload.manifestNo) {
                    throw new ValidationError('Manifest scan requires id or manifestNo');
                }
                return {
                    type: 'manifest',
                    manifestId: payload.id,
                    manifestNo: payload.manifestNo,
                    route: payload.route,
                    metadata: payload.metadata,
                    raw: trimmed,
                };
            }

            // Handle package scan
            if (payload.type === 'package') {
                if (!payload.packageId) {
                    throw new ValidationError('Package scan requires packageId');
                }
                return {
                    type: 'package',
                    packageId: payload.packageId,
                    awb: payload.awb,
                    metadata: payload.metadata,
                    raw: trimmed,
                };
            }

            // Handle shipment scan (default)
            if (payload.awb) {
                if (!/^TAC\d{8}$/i.test(payload.awb)) {
                    throw new ValidationError('Invalid AWB format in payload');
                }
                return {
                    type: 'shipment',
                    awb: payload.awb.toUpperCase(),
                    metadata: payload.metadata,
                    raw: trimmed,
                };
            }

            throw new ValidationError('Invalid scan payload structure');
        } catch (e) {
            if (e instanceof ValidationError) throw e;
            throw new ValidationError('Invalid JSON in scan input');
        }
    }

    // 3. Try manifest number format (MNF-YYYY-XXXXXX)
    if (/^MNF-\d{4}-\d{6}$/i.test(trimmed)) {
        return {
            type: 'manifest',
            manifestNo: trimmed.toUpperCase(),
            raw: trimmed,
        };
    }

    // 4. Unknown format
    throw new ValidationError(`Invalid scan format: ${trimmed.slice(0, 20)}${trimmed.length > 20 ? '...' : ''}`);
}

/**
 * Validate AWB format
 */
export function isValidAWB(awb: string): boolean {
    return /^TAC\d{8}$/i.test(awb);
}

/**
 * Generate QR payload for manifest
 */
export function generateManifestQRPayload(manifest: {
    id: string;
    manifestNo: string;
    fromHubCode: string;
    toHubCode: string;
}): string {
    const payload: ScanPayloadV1 = {
        v: 1,
        type: 'manifest',
        id: manifest.id,
        manifestNo: manifest.manifestNo,
        route: `${manifest.fromHubCode}-${manifest.toHubCode}`,
    };
    return JSON.stringify(payload);
}

/**
 * Generate QR payload for shipment
 */
export function generateShipmentQRPayload(awb: string): string {
    const payload: ScanPayloadV1 = {
        v: 1,
        awb: awb.toUpperCase(),
    };
    return JSON.stringify(payload);
}
