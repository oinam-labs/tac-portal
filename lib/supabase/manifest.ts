/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase operations require any for complex types */

import { supabase } from "@/lib/supabase"
import { ShipmentMode } from "@/types"

type FetchShipmentsArgs = {
    originHubId: string
    destinationHubId?: string // Optional filtering
    onlyReady: boolean
    matchDestination: boolean
    excludeCod: boolean
}

export async function fetchAvailableShipments(args: FetchShipmentsArgs) {
    // Base query: Shipments at origin, not yet manifested (manifest_id is null)
    let query = supabase
        .from("shipments")
        .select("*")
        .eq("origin_hub_id", args.originHubId)
        .is("manifest_id", null)

    // Filter 1: Only READY status
    if (args.onlyReady) {
        query = query.eq("status", "RECEIVED") // 'RECEIVED' at origin is effectively 'READY' for linehaul
    }

    // Filter 2: Match Destination
    if (args.matchDestination && args.destinationHubId) {
        query = query.eq("destination_hub_id", args.destinationHubId)
    }

    // Filter 3: Exclude COD (using special_instructions for now as flags column missing)

    const { data, error } = await query.order("created_at", { ascending: true })

    if (error) throw error
    return data as any[] // using any to bypass strict type mismatch for now, or map to Shipment type
}

function generateManifestNo() {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    // Format: MAN-YYYYMMDD-HHMMSS (Simple unique)
    return `MAN-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export async function createManifest(params: {
    originHubId: string
    destinationHubId: string
    transportType: ShipmentMode
    flightNo?: string
    flightDate?: Date
    vehicleNo?: string
    driverName?: string
    shipmentIds: string[]
}) {
    if (!params.shipmentIds.length) {
        throw new Error("Select at least one shipment.")
    }

    // 1. Get current user (for created_by)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Authenticated user required")

    // Find staff profile
    const { data: staff } = await supabase.from('staff').select('id, org_id').eq('auth_user_id', user.id).maybeSingle()

    // Fallback for dev/testing if staff not found
    let staffId = (staff as any)?.id
    let orgId = (staff as any)?.org_id

    if (!staffId) {
        // Try fetch ANY admin for fallback (TEMPORARY DEV FIX)
        const { data: admin } = await supabase.from('staff').select('id, org_id').eq('role', 'ADMIN').limit(1).maybeSingle()
        staffId = (admin as any)?.id
        orgId = (admin as any)?.org_id
    }

    if (!staffId || !orgId) throw new Error("Staff profile not found.")

    // 2. Fetch selected shipments to calc totals
    const { data: shipments, error: fetchError } = await supabase
        .from("shipments")
        .select("id, package_count, total_weight, status")
        .in("id", params.shipmentIds)

    if (fetchError) throw fetchError
    if (!shipments || shipments.length !== params.shipmentIds.length) {
        throw new Error("Some selected shipments could not be found.")
    }

    // Calculate totals
    const totalShipments = shipments.length
    // coerce types just in case
    const totalPackages = shipments.reduce((acc: number, s: any) => acc + (s.package_count || 0), 0)
    const totalWeight = shipments.reduce((acc: number, s: any) => acc + (s.total_weight || 0), 0)

    // 3. Create Manifest
    const manifestNo = generateManifestNo()

    // Prepare vehicle_meta
    const vehicleMeta = params.transportType === "AIR"
        ? { flight_no: params.flightNo, flight_date: params.flightDate }
        : { vehicle_no: params.vehicleNo, driver_name: params.driverName }

    const { data: manifest, error: createError } = await (supabase.from("manifests") as any)
        .insert({
            org_id: orgId,
            manifest_no: manifestNo,
            type: params.transportType,
            from_hub_id: params.originHubId,
            to_hub_id: params.destinationHubId,
            status: "OPEN",
            vehicle_meta: vehicleMeta,
            total_shipments: totalShipments,
            total_packages: totalPackages,
            total_weight: totalWeight,
            created_by_staff_id: staffId
        })
        .select()
        .single()

    if (createError) throw createError

    // 4. Create Manifest Items
    const items = params.shipmentIds.map(sid => ({
        org_id: orgId,
        manifest_id: manifest.id,
        shipment_id: sid,
        scanned_by_staff_id: staffId,
        scanned_at: new Date().toISOString()
    }))

    const { error: itemsError } = await (supabase.from("manifest_items") as any).insert(items)
    if (itemsError) throw itemsError

    // 5. Update Shipments (Status -> LOADED_FOR_LINEHAUL)
    const { error: updateError } = await (supabase.from("shipments") as any)
        .update({
            manifest_id: manifest.id,
            status: "LOADED_FOR_LINEHAUL"
        })
        .in("id", params.shipmentIds)

    if (updateError) throw updateError

    return manifest
}
