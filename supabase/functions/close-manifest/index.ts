/**
 * Close Manifest Edge Function
 * Atomic operation to close a manifest and update all related shipments
 * 
 * This function:
 * 1. Validates the manifest exists and is in OPEN status
 * 2. Updates manifest status to CLOSED
 * 3. Updates all linked shipments to LOADED_FOR_LINEHAUL
 * 4. Creates tracking events for each shipment
 * 5. Calculates and updates manifest totals
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CloseManifestRequest {
    manifest_id: string;
    staff_id?: string;
    notes?: string;
}

interface CloseManifestResponse {
    success: boolean;
    manifest?: {
        id: string;
        manifest_no: string;
        status: string;
        total_shipments: number;
        total_packages: number;
        total_weight: number;
    };
    shipments_updated: number;
    tracking_events_created: number;
    error?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
    // CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Parse request body
        const { manifest_id, staff_id, notes }: CloseManifestRequest = await req.json();

        if (!manifest_id) {
            return new Response(
                JSON.stringify({ success: false, error: "manifest_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create Supabase client with service role for full access
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch manifest and validate
        const { data: manifest, error: manifestError } = await supabase
            .from("manifests")
            .select("*")
            .eq("id", manifest_id)
            .single();

        if (manifestError || !manifest) {
            return new Response(
                JSON.stringify({ success: false, error: "Manifest not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (manifest.status !== "OPEN") {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Cannot close manifest with status '${manifest.status}'. Only OPEN manifests can be closed.`
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Get all shipments linked to this manifest
        const { data: manifestItems, error: itemsError } = await supabase
            .from("manifest_items")
            .select(`
        shipment_id,
        shipment:shipments(id, awb_number, package_count, total_weight, status)
      `)
            .eq("manifest_id", manifest_id);

        if (itemsError) {
            throw new Error(`Failed to fetch manifest items: ${itemsError.message}`);
        }

        const shipments = (manifestItems || [])
            .map((item: any) => item.shipment)
            .filter(Boolean);

        // 3. Calculate totals
        const totalShipments = shipments.length;
        const totalPackages = shipments.reduce((sum: number, s: any) => sum + (s.package_count || 0), 0);
        const totalWeight = shipments.reduce((sum: number, s: any) => sum + (s.total_weight || 0), 0);

        // 4. Update manifest status to CLOSED
        const { error: updateManifestError } = await supabase
            .from("manifests")
            .update({
                status: "CLOSED",
                total_shipments: totalShipments,
                total_packages: totalPackages,
                total_weight: totalWeight,
                closed_at: new Date().toISOString(),
                closed_by_staff_id: staff_id || null,
                notes: notes || manifest.notes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", manifest_id);

        if (updateManifestError) {
            throw new Error(`Failed to update manifest: ${updateManifestError.message}`);
        }

        // 5. Update all shipments to LOADED_FOR_LINEHAUL
        let shipmentsUpdated = 0;
        const shipmentIds = shipments.map((s: any) => s.id);

        if (shipmentIds.length > 0) {
            const { error: updateShipmentsError, count } = await supabase
                .from("shipments")
                .update({
                    status: "LOADED_FOR_LINEHAUL",
                    manifest_id: manifest_id,
                    updated_at: new Date().toISOString(),
                })
                .in("id", shipmentIds);

            if (updateShipmentsError) {
                throw new Error(`Failed to update shipments: ${updateShipmentsError.message}`);
            }
            shipmentsUpdated = count || shipmentIds.length;
        }

        // 6. Create tracking events for each shipment
        let trackingEventsCreated = 0;
        const trackingEvents = shipments.map((s: any) => ({
            org_id: manifest.org_id,
            shipment_id: s.id,
            awb_number: s.awb_number,
            event_code: "LOADED_FOR_LINEHAUL",
            event_time: new Date().toISOString(),
            hub_id: manifest.from_hub_id,
            actor_staff_id: staff_id || null,
            source: "SYSTEM",
            meta: {
                manifest_id: manifest_id,
                manifest_no: manifest.manifest_no,
                action: "MANIFEST_CLOSED",
            },
        }));

        if (trackingEvents.length > 0) {
            const { error: trackingError, count } = await supabase
                .from("tracking_events")
                .insert(trackingEvents);

            if (trackingError) {
                console.error("Failed to create tracking events:", trackingError);
                // Don't fail the entire operation for tracking events
            } else {
                trackingEventsCreated = count || trackingEvents.length;
            }
        }

        // 7. Return success response
        const response: CloseManifestResponse = {
            success: true,
            manifest: {
                id: manifest.id,
                manifest_no: manifest.manifest_no,
                status: "CLOSED",
                total_shipments: totalShipments,
                total_packages: totalPackages,
                total_weight: totalWeight,
            },
            shipments_updated: shipmentsUpdated,
            tracking_events_created: trackingEventsCreated,
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Close manifest error:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error"
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
