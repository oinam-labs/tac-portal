/**
 * Manifest Service - Enterprise Edition
 * All manifest CRUD, scanning, and workflow operations
 * 
 * Features:
 * - AWB-first barcode scanning with idempotency
 * - Atomic scan-to-manifest via DB RPC
 * - Enterprise status workflow (DRAFT → BUILDING → CLOSED → DEPARTED → ARRIVED → RECONCILED)
 * - Scan audit logging
 * - Containerization support (ULD/Bag/Cage/Pallet)
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase client requires any for complex insert/update operations */

import { supabase } from '@/lib/supabase';
import { mapSupabaseError, ValidationError } from '@/lib/errors';
import { orgService } from './orgService';
import type { Database } from '@/lib/database.types';

type Manifest = Database['public']['Tables']['manifests']['Row'];
type ManifestInsert = Database['public']['Tables']['manifests']['Insert'];
type ManifestItem = Database['public']['Tables']['manifest_items']['Row'];

export type ManifestStatus = 'DRAFT' | 'OPEN' | 'BUILDING' | 'CLOSED' | 'DEPARTED' | 'ARRIVED' | 'RECONCILED';
export type ManifestType = 'AIR' | 'TRUCK';
export type ScanSource = 'CAMERA' | 'MANUAL' | 'BARCODE_SCANNER';
export type ScanResult = 'SUCCESS' | 'DUPLICATE' | 'NOT_FOUND' | 'INVALID' | 'WRONG_DESTINATION' | 'WRONG_STATUS' | 'ALREADY_MANIFESTED';

export interface ManifestWithRelations extends Manifest {
    from_hub?: { id: string; code: string; name: string };
    to_hub?: { id: string; code: string; name: string };
    creator?: { id: string; full_name: string };
}

export interface ManifestItemWithShipment extends ManifestItem {
    shipment?: {
        id: string;
        awb_number: string;
        receiver_name: string;
        receiver_phone?: string;
        receiver_address?: Record<string, unknown>;
        sender_name?: string;
        sender_phone?: string;
        receiver_city?: string;
        sender_city?: string;
        total_weight: number;
        total_packages?: number;
        package_count: number;
        volumetric_weight?: number;
        chargeable_weight?: number;
        cod_amount?: number;
        special_instructions?: string | null;
        service_type?: string;
        payment_mode?: string;
        status?: string;
    };
}

export function mapManifestItemWithShipment(item: any): ManifestItemWithShipment {
    return {
        ...item,
        shipment: item.shipment ? {
            ...item.shipment,
            // Map to expected interface names (columns use receiver_*/sender_* names)
            receiver_name: item.shipment.receiver_name,
            receiver_phone: item.shipment.receiver_phone,
            receiver_address: item.shipment.receiver_address,
            sender_name: item.shipment.sender_name,
            sender_phone: item.shipment.sender_phone,
            package_count: item.shipment.package_count,
            total_weight: item.shipment.total_weight,
            receiver_city: item.shipment.receiver_address?.city,
        } : undefined,
    };
}

export interface ManifestFilters {
    status?: string;
    fromHubId?: string;
    toHubId?: string;
    type?: 'AIR' | 'TRUCK';
    limit?: number;
}

export interface ScanResponse {
    success: boolean;
    duplicate?: boolean;
    error?: string;
    message: string;
    shipment_id?: string;
    awb_number?: string;
    receiver_name?: string;
    sender_name?: string;
    total_packages?: number;
    total_weight?: number;
    manifest_item_id?: string;
    current_status?: string;
}

export interface CreateManifestParams {
    fromHubId: string;
    toHubId: string;
    type: ManifestType;
    status?: ManifestStatus;
    // AIR specific
    flightNumber?: string;
    flightDate?: string;
    airlineCode?: string;
    etd?: string;
    eta?: string;
    // TRUCK specific
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    dispatchAt?: string;
    // Common
    notes?: string;
    createdByStaffId?: string;
}

export interface ManifestScanLog {
    id: string;
    manifest_id: string;
    shipment_id: string | null;
    raw_scan_token: string;
    normalized_token: string | null;
    scan_result: ScanResult;
    scanned_by_staff_id: string | null;
    scan_source: ScanSource;
    error_message: string | null;
    created_at: string;
}

export const manifestService = {
    async list(filters?: ManifestFilters): Promise<ManifestWithRelations[]> {
        const orgId = orgService.getCurrentOrgId();

        let query = supabase
            .from('manifests')
            .select(`
        *,
        from_hub:hubs!manifests_from_hub_id_fkey(id, code, name),
        to_hub:hubs!manifests_to_hub_id_fkey(id, code, name),
        creator:staff!manifests_created_by_staff_id_fkey(id, full_name)
      `)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.fromHubId) {
            query = query.eq('from_hub_id', filters.fromHubId);
        }
        if (filters?.toHubId) {
            query = query.eq('to_hub_id', filters.toHubId);
        }
        if (filters?.type) {
            query = query.eq('type', filters.type);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw mapSupabaseError(error);
        return (data ?? []) as unknown as ManifestWithRelations[];
    },

    async getById(id: string): Promise<ManifestWithRelations> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await supabase
            .from('manifests')
            .select(`
        *,
        from_hub:hubs!manifests_from_hub_id_fkey(id, code, name),
        to_hub:hubs!manifests_to_hub_id_fkey(id, code, name),
        creator:staff!manifests_created_by_staff_id_fkey(id, full_name)
      `)
            .eq('id', id)
            .eq('org_id', orgId)
            .single();

        if (error) throw mapSupabaseError(error);
        return data as unknown as ManifestWithRelations;
    },

    async getByManifestNo(manifestNo: string): Promise<ManifestWithRelations | null> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await supabase
            .from('manifests')
            .select(`
        *,
        from_hub:hubs!manifests_from_hub_id_fkey(id, code, name),
        to_hub:hubs!manifests_to_hub_id_fkey(id, code, name),
        creator:staff!manifests_created_by_staff_id_fkey(id, full_name)
      `)
            .eq('manifest_no', manifestNo)
            .eq('org_id', orgId)
            .maybeSingle();

        if (error) throw mapSupabaseError(error);
        return data as unknown as ManifestWithRelations | null;
    },

    async create(manifest: Omit<ManifestInsert, 'org_id' | 'manifest_no'>): Promise<Manifest> {
        const orgId = orgService.getCurrentOrgId();

        // manifest_no is generated by DB trigger (generate_manifest_number)
        // This ensures atomic, collision-free numbering
        const { data, error } = await (supabase
            .from('manifests') as any)
            .insert({
                ...manifest,
                org_id: orgId,
                // manifest_no omitted - DB trigger generates it
            })
            .select()
            .single();

        if (error) throw mapSupabaseError(error);
        return data as Manifest;
    },

    async getItems(manifestId: string): Promise<ManifestItemWithShipment[]> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await supabase
            .from('manifest_items')
            .select(`
        *,
        shipment:shipments(id, awb_number, receiver_name, total_weight, package_count)
      `)
            .eq('manifest_id', manifestId)
            .eq('org_id', orgId);

        if (error) throw mapSupabaseError(error);
        return (data ?? []) as unknown as ManifestItemWithShipment[];
    },

    async addShipment(
        manifestId: string,
        shipmentId: string,
        staffId: string
    ): Promise<ManifestItem> {
        const orgId = orgService.getCurrentOrgId();

        // Validate manifest is open
        const manifest = await this.getById(manifestId);
        if (manifest.status !== 'OPEN') {
            throw new ValidationError('Cannot add shipments to a closed manifest');
        }

        // Check for duplicate
        const { data: existing } = await supabase
            .from('manifest_items')
            .select('id')
            .eq('manifest_id', manifestId)
            .eq('shipment_id', shipmentId)
            .maybeSingle();

        if (existing) {
            throw new ValidationError('Shipment already added to manifest');
        }

        // Add item
        const { data, error } = await (supabase
            .from('manifest_items') as any)
            .insert({
                org_id: orgId,
                manifest_id: manifestId,
                shipment_id: shipmentId,
                scanned_by_staff_id: staffId,
                scanned_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw mapSupabaseError(error);

        // Update manifest totals
        await this.updateTotals(manifestId);

        // Update shipment status
        await (supabase
            .from('shipments') as any)
            .update({
                manifest_id: manifestId,
                status: 'IN_TRANSIT',
                updated_at: new Date().toISOString(),
            })
            .eq('id', shipmentId);

        return data as ManifestItem;
    },

    async removeShipment(manifestId: string, shipmentId: string): Promise<void> {
        const orgId = orgService.getCurrentOrgId();

        // Validate manifest is open
        const manifest = await this.getById(manifestId);
        if (manifest.status !== 'OPEN') {
            throw new ValidationError('Cannot remove shipments from a closed manifest');
        }

        const { error } = await supabase
            .from('manifest_items')
            .delete()
            .eq('manifest_id', manifestId)
            .eq('shipment_id', shipmentId)
            .eq('org_id', orgId);

        if (error) throw mapSupabaseError(error);

        // Update manifest totals
        await this.updateTotals(manifestId);

        // Update shipment
        await (supabase
            .from('shipments') as any)
            .update({
                manifest_id: null,
                status: 'RECEIVED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', shipmentId);
    },

    async updateTotals(manifestId: string): Promise<void> {
        const items = await this.getItems(manifestId);

        const totals = items.reduce(
            (acc, item) => ({
                shipments: acc.shipments + 1,
                packages: acc.packages + (item.shipment?.package_count ?? 0),
                weight: acc.weight + (item.shipment?.total_weight ?? 0),
            }),
            { shipments: 0, packages: 0, weight: 0 }
        );

        await (supabase
            .from('manifests') as any)
            .update({
                total_shipments: totals.shipments,
                total_packages: totals.packages,
                total_weight: totals.weight,
                updated_at: new Date().toISOString(),
            })
            .eq('id', manifestId);
    },

    async close(manifestId: string): Promise<Manifest> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await (supabase
            .from('manifests') as any)
            .update({
                status: 'CLOSED',
                closed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', manifestId)
            .eq('org_id', orgId)
            .select()
            .single();

        if (error) throw mapSupabaseError(error);
        return data as Manifest;
    },

    async depart(manifestId: string): Promise<Manifest> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await (supabase
            .from('manifests') as any)
            .update({
                status: 'DEPARTED',
                departed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', manifestId)
            .eq('org_id', orgId)
            .select()
            .single();

        if (error) throw mapSupabaseError(error);

        const manifestData = data as Manifest & { from_hub_id: string; manifest_no: string };

        // Update all shipments to IN_TRANSIT
        const items = await this.getItems(manifestId);
        for (const item of items) {
            await (supabase
                .from('shipments') as any)
                .update({
                    status: 'IN_TRANSIT',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', item.shipment_id);

            // Create tracking event
            await (supabase.from('tracking_events') as any).insert({
                org_id: orgId,
                shipment_id: item.shipment_id,
                awb_number: item.shipment?.awb_number ?? '',
                event_code: 'DEPARTED',
                hub_id: manifestData.from_hub_id,
                source: 'SYSTEM',
                meta: { manifest_no: manifestData.manifest_no },
            });
        }

        return manifestData;
    },

    async arrive(manifestId: string): Promise<Manifest> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await (supabase
            .from('manifests') as any)
            .update({
                status: 'ARRIVED',
                arrived_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', manifestId)
            .eq('org_id', orgId)
            .select()
            .single();

        if (error) throw mapSupabaseError(error);

        const manifestData = data as Manifest & { to_hub_id: string; manifest_no: string };

        // Update all shipments to RECEIVED_AT_DEST
        const items = await this.getItems(manifestId);
        for (const item of items) {
            await (supabase
                .from('shipments') as any)
                .update({
                    status: 'RECEIVED_AT_DEST',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', item.shipment_id);

            // Create tracking event
            await (supabase.from('tracking_events') as any).insert({
                org_id: orgId,
                shipment_id: item.shipment_id,
                awb_number: item.shipment?.awb_number ?? '',
                event_code: 'ARRIVED',
                hub_id: manifestData.to_hub_id,
                source: 'SYSTEM',
                meta: { manifest_no: manifestData.manifest_no },
            });
        }

        return manifestData;
    },

    async delete(id: string): Promise<void> {
        const orgId = orgService.getCurrentOrgId();

        const { error } = await (supabase
            .from('manifests') as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('org_id', orgId);

        if (error) throw mapSupabaseError(error);
    },

    // =========================================================================
    // ENTERPRISE SCAN OPERATIONS
    // =========================================================================

    /**
     * Add shipment to manifest via barcode scan (IDEMPOTENT)
     * Uses atomic DB RPC function for concurrency safety
     */
    async addShipmentByScan(
        manifestId: string,
        scanToken: string,
        options: {
            staffId?: string;
            scanSource?: ScanSource;
            validateDestination?: boolean;
            validateStatus?: boolean;
        } = {}
    ): Promise<ScanResponse> {
        const orgId = orgService.getCurrentOrgId();
        const {
            staffId,
            scanSource = 'MANUAL',
            validateDestination = true,
            validateStatus = true,
        } = options;

        // Use type assertion for RPC call (function defined in migration 006)
        const { data, error } = await (supabase.rpc as any)('manifest_add_shipment_by_scan', {
            p_org_id: orgId,
            p_manifest_id: manifestId,
            p_scan_token: scanToken,
            p_staff_id: staffId || null,
            p_scan_source: scanSource,
            p_validate_destination: validateDestination,
            p_validate_status: validateStatus,
        });

        if (error) {
            // Handle AbortError gracefully
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return {
                    success: false,
                    error: 'REQUEST_CANCELLED',
                    message: 'Request was cancelled. Please try again.',
                };
            }
            // RPC function doesn't exist yet, fall back to app-level logic
            if (error.code === '42883' || error.message?.includes('does not exist')) {
                return this.addShipmentByScanFallback(manifestId, scanToken, options);
            }
            throw mapSupabaseError(error);
        }

        return data as unknown as ScanResponse;
    },

    /**
     * Fallback scan implementation (app-level) for when RPC not available
     * Still provides idempotency via unique constraint
     */
    async addShipmentByScanFallback(
        manifestId: string,
        scanToken: string,
        options: {
            staffId?: string;
            scanSource?: ScanSource;
            validateDestination?: boolean;
            validateStatus?: boolean;
        } = {}
    ): Promise<ScanResponse> {
        try {
            const orgId = orgService.getCurrentOrgId();
            const { staffId, validateDestination = true, validateStatus = true } = options;

            // Normalize scan token
            const normalized = scanToken.replace(/[\s-]/g, '').toUpperCase();

            // Get manifest
            const manifest = await this.getById(manifestId);
            if (!manifest) {
                return {
                    success: false,
                    error: 'MANIFEST_NOT_FOUND',
                    message: 'Manifest not found or access denied',
                };
            }

            // Check manifest is editable
            if (!['OPEN', 'DRAFT', 'BUILDING'].includes(manifest.status)) {
                return {
                    success: false,
                    error: 'MANIFEST_CLOSED',
                    message: 'Cannot add items to a closed manifest',
                };
            }

            // Find shipment by AWB or ID
            const { data: shipment } = await supabase
                .from('shipments')
                .select('*')
                .eq('org_id', orgId)
                .is('deleted_at', null)
                .or(`awb_number.ilike.%${normalized}%,id.eq.${scanToken}`)
                .limit(1)
                .maybeSingle();

            if (!shipment) {
                return {
                    success: false,
                    error: 'SHIPMENT_NOT_FOUND',
                    message: `No shipment found matching: ${scanToken}`,
                };
            }

            // Check if already in this manifest (idempotency)
            const { data: existing } = await supabase
                .from('manifest_items')
                .select('id')
                .eq('manifest_id', manifestId)
                .eq('shipment_id', shipment.id)
                .maybeSingle();

            if (existing) {
                return {
                    success: true,
                    duplicate: true,
                    message: 'Shipment already in manifest',
                    shipment_id: shipment.id,
                    awb_number: shipment.awb_number,
                    manifest_item_id: existing.id,
                };
            }

            // Check if in another open manifest
            const { data: otherManifest } = await supabase
                .from('manifest_items')
                .select('manifest_id, manifests!inner(status)')
                .eq('shipment_id', shipment.id)
                .in('manifests.status', ['OPEN', 'DRAFT', 'BUILDING'])
                .neq('manifest_id', manifestId)
                .maybeSingle();

            if (otherManifest) {
                return {
                    success: false,
                    error: 'ALREADY_IN_MANIFEST',
                    message: 'Shipment is already in another open manifest',
                    shipment_id: shipment.id,
                    awb_number: shipment.awb_number,
                };
            }

            // Validate destination
            if (validateDestination && shipment.destination_hub_id !== manifest.to_hub_id) {
                return {
                    success: false,
                    error: 'DESTINATION_MISMATCH',
                    message: 'Shipment destination does not match manifest destination',
                    shipment_id: shipment.id,
                    awb_number: shipment.awb_number,
                };
            }

            // Validate status
            const validStatuses = ['CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN'];
            if (validateStatus && !validStatuses.includes(shipment.status)) {
                return {
                    success: false,
                    error: 'INVALID_STATUS',
                    message: `Shipment status is not eligible for manifesting: ${shipment.status}`,
                    shipment_id: shipment.id,
                    awb_number: shipment.awb_number,
                    current_status: shipment.status,
                };
            }

            // Insert manifest item
            const { data: newItem, error: insertError } = await (supabase
                .from('manifest_items') as any)
                .insert({
                    org_id: orgId,
                    manifest_id: manifestId,
                    shipment_id: shipment.id,
                    scanned_by_staff_id: staffId || null,
                    scanned_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (insertError) {
                // Unique constraint violation = duplicate (race condition)
                if (insertError.code === '23505') {
                    return {
                        success: true,
                        duplicate: true,
                        message: 'Shipment already in manifest (concurrent)',
                        shipment_id: shipment.id,
                        awb_number: shipment.awb_number,
                    };
                }
                throw mapSupabaseError(insertError);
            }

            return {
                success: true,
                duplicate: false,
                message: 'Shipment added to manifest',
                shipment_id: shipment.id,
                awb_number: shipment.awb_number,
                receiver_name: shipment.receiver_name,
                sender_name: shipment.sender_name,
                total_packages: shipment.total_packages,
                total_weight: shipment.total_weight,
                manifest_item_id: newItem.id,
            };
        } catch (error) {
            // Handle AbortError gracefully
            if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
                return {
                    success: false,
                    error: 'REQUEST_CANCELLED',
                    message: 'Request was cancelled. Please try again.',
                };
            }
            throw error;
        }
    },

    /**
     * Remove shipment from manifest via RPC (with audit)
     */
    async removeShipmentById(
        manifestId: string,
        shipmentId: string,
        staffId?: string
    ): Promise<{ success: boolean; error?: string; message: string }> {
        const orgId = orgService.getCurrentOrgId();

        // Use type assertion for RPC call (function defined in migration 006)
        const { data, error } = await (supabase.rpc as any)('manifest_remove_item', {
            p_org_id: orgId,
            p_manifest_id: manifestId,
            p_shipment_id: shipmentId,
            p_staff_id: staffId || null,
        });

        if (error) {
            // RPC not available, use direct delete
            if (error.code === '42883') {
                await this.removeShipment(manifestId, shipmentId);
                return { success: true, message: 'Shipment removed from manifest' };
            }
            throw mapSupabaseError(error);
        }

        return data as unknown as { success: boolean; error?: string; message: string };
    },

    /**
     * Get scan audit logs for a manifest
     */
    async getScanLogs(manifestId: string): Promise<ManifestScanLog[]> {
        const orgId = orgService.getCurrentOrgId();

        // Use type assertion for table defined in migration 006
        const { data, error } = await (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> })
            .from('manifest_scan_logs')
            .select('*')
            .eq('manifest_id', manifestId)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (error) {
            // Table might not exist yet
            if (error.code === '42P01') return [];
            throw mapSupabaseError(error);
        }

        return (data ?? []) as unknown as ManifestScanLog[];
    },

    // =========================================================================
    // ENTERPRISE MANIFEST CREATION
    // =========================================================================

    /**
     * Create manifest with enterprise fields (AIR/TRUCK specific)
     * Manifest number is generated by DB trigger
     */
    async createEnterprise(params: CreateManifestParams): Promise<ManifestWithRelations> {
        const orgId = orgService.getCurrentOrgId();

        const vehicleMeta = params.type === 'AIR'
            ? {
                flight_no: params.flightNumber,
                flight_date: params.flightDate,
                airline_code: params.airlineCode,
            }
            : {
                vehicle_no: params.vehicleNumber,
                driver_name: params.driverName,
                driver_phone: params.driverPhone,
            };

        const { data, error } = await (supabase
            .from('manifests') as any)
            .insert({
                org_id: orgId,
                type: params.type,
                from_hub_id: params.fromHubId,
                to_hub_id: params.toHubId,
                status: params.status || 'DRAFT',
                vehicle_meta: vehicleMeta,
                // Extended fields
                flight_number: params.flightNumber,
                flight_date: params.flightDate,
                airline_code: params.airlineCode,
                etd: params.etd,
                eta: params.eta,
                vehicle_number: params.vehicleNumber,
                driver_name: params.driverName,
                driver_phone: params.driverPhone,
                dispatch_at: params.dispatchAt,
                notes: params.notes,
                created_by_staff_id: params.createdByStaffId,
                // Totals start at 0
                total_shipments: 0,
                total_packages: 0,
                total_weight: 0,
            })
            .select(`
                *,
                from_hub:hubs!manifests_from_hub_id_fkey(id, code, name),
                to_hub:hubs!manifests_to_hub_id_fkey(id, code, name),
                creator:staff!manifests_created_by_staff_id_fkey(id, full_name)
            `)
            .single();

        if (error) throw mapSupabaseError(error);
        return data as unknown as ManifestWithRelations;
    },

    /**
     * Update manifest status with validation
     */
    async updateStatus(
        manifestId: string,
        newStatus: ManifestStatus,
        staffId?: string
    ): Promise<ManifestWithRelations> {
        const orgId = orgService.getCurrentOrgId();

        // Get current manifest
        const manifest = await this.getById(manifestId);

        // Validate status transition
        const validTransitions: Record<ManifestStatus, ManifestStatus[]> = {
            DRAFT: ['BUILDING', 'OPEN', 'CLOSED'],
            OPEN: ['BUILDING', 'CLOSED'],
            BUILDING: ['CLOSED', 'OPEN'],
            CLOSED: ['DEPARTED'],
            DEPARTED: ['ARRIVED'],
            ARRIVED: ['RECONCILED'],
            RECONCILED: [],
        };

        const currentStatus = manifest.status as ManifestStatus;
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new ValidationError(
                `Invalid status transition: ${currentStatus} → ${newStatus}`
            );
        }

        // Build update payload
        const updatePayload: Record<string, any> = {
            status: newStatus,
            updated_at: new Date().toISOString(),
        };

        // Add timestamp fields based on status
        if (newStatus === 'CLOSED') {
            updatePayload.closed_at = new Date().toISOString();
            updatePayload.closed_by_staff_id = staffId;
        } else if (newStatus === 'DEPARTED') {
            updatePayload.departed_at = new Date().toISOString();
        } else if (newStatus === 'ARRIVED') {
            updatePayload.arrived_at = new Date().toISOString();
        } else if (newStatus === 'RECONCILED') {
            updatePayload.reconciled_at = new Date().toISOString();
            updatePayload.reconciled_by_staff_id = staffId;
        }

        const { data, error } = await (supabase
            .from('manifests') as any)
            .update(updatePayload)
            .eq('id', manifestId)
            .eq('org_id', orgId)
            .select(`
                *,
                from_hub:hubs!manifests_from_hub_id_fkey(id, code, name),
                to_hub:hubs!manifests_to_hub_id_fkey(id, code, name),
                creator:staff!manifests_created_by_staff_id_fkey(id, full_name)
            `)
            .single();

        if (error) throw mapSupabaseError(error);
        return data as unknown as ManifestWithRelations;
    },

    /**
     * Get manifest items with full shipment details for enterprise table
     */
    async getItemsWithFullDetails(manifestId: string): Promise<ManifestItemWithShipment[]> {
        const orgId = orgService.getCurrentOrgId();

        const { data, error } = await supabase
            .from('manifest_items')
            .select(`
                *,
                shipment:shipments(
                    id,
                    awb_number,
                    receiver_name,
                    receiver_phone,
                    receiver_address,
                    sender_name,
                    sender_phone,
                    total_weight,
                    package_count,
                    chargeable_weight,
                    declared_value,
                    status,
                    service_level,
                    special_instructions,
                    destination_hub_id
                )
            `)
            .eq('manifest_id', manifestId)
            .eq('org_id', orgId)
            .order('scanned_at', { ascending: false });

        if (error) throw mapSupabaseError(error);

        // Map to expected format with receiver/sender names
        return ((data ?? []) as any[]).map(mapManifestItemWithShipment);
    },

    /**
     * Recalculate and update manifest totals
     */
    async recalculateTotals(manifestId: string): Promise<void> {
        // Try RPC first (function defined in migration 006)
        const { error } = await (supabase.rpc as any)('manifest_update_totals', {
            p_manifest_id: manifestId,
        });

        if (error && error.code === '42883') {
            // RPC not available, use app-level
            await this.updateTotals(manifestId);
        }
    },

    // =========================================================================
    // BARCODE PARSING UTILITIES
    // =========================================================================

    /**
     * Normalize and parse a scanned barcode token
     * Supports IATA Resolution 606 format and common variations
     */
    normalizeScanToken(token: string): string {
        if (!token) return '';

        // Remove whitespace and common delimiters
        let normalized = token.trim().replace(/[\s\-_]/g, '');

        // Convert to uppercase
        normalized = normalized.toUpperCase();

        // Handle IATA AWB format (e.g., 123-12345678)
        // AWB numbers are typically 11 digits: 3-digit prefix + 8-digit serial
        const awbMatch = normalized.match(/^(\d{3})(\d{8})$/);
        if (awbMatch) {
            return `${awbMatch[1]}-${awbMatch[2]}`;
        }

        return normalized;
    },

    /**
     * Validate if a token looks like a valid AWB number
     */
    isValidAwbFormat(token: string): boolean {
        const normalized = this.normalizeScanToken(token);
        // IATA AWB: 3-digit airline prefix + 8-digit serial
        return /^\d{3}-?\d{8}$/.test(normalized);
    },
};
