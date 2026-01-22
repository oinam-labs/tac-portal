-- Migration: Add CHECK constraint on shipments.status
-- Purpose: Enforce canonical shipment status values at database level
-- Idempotent: Drops prior constraint before adding

-- ============================================================================
-- STEP 1: Drop existing constraint if it exists (idempotent)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shipments_status_check'
        AND table_name = 'shipments'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.shipments DROP CONSTRAINT shipments_status_check;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Add CHECK constraint with canonical status values
-- ============================================================================

ALTER TABLE public.shipments
ADD CONSTRAINT shipments_status_check CHECK (
    status IN (
        'CREATED',
        'PICKUP_SCHEDULED',
        'PICKED_UP',
        'RECEIVED_AT_ORIGIN',
        'IN_TRANSIT',
        'RECEIVED_AT_DEST',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RTO',
        'EXCEPTION'
    )
);

-- ============================================================================
-- STEP 3: Add comment for documentation
-- ============================================================================

COMMENT ON CONSTRAINT shipments_status_check ON public.shipments IS 
'Enforces canonical shipment status values: CREATED, PICKUP_SCHEDULED, PICKED_UP, RECEIVED_AT_ORIGIN, IN_TRANSIT, RECEIVED_AT_DEST, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RTO, EXCEPTION';
