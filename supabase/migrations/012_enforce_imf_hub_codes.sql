-- Migration: Enforce IMF Hub Code and Add CHECK Constraints
-- Purpose: Replace IXA with IMF and prevent invalid hub codes at database level
-- Date: 2025-01-23

-- Step 1: Update existing data (IXA → IMF)
UPDATE shipments SET origin_hub_id = (SELECT id FROM hubs WHERE code = 'IMF') 
WHERE origin_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

UPDATE shipments SET destination_hub_id = (SELECT id FROM hubs WHERE code = 'IMF') 
WHERE destination_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

UPDATE manifests SET from_hub_id = (SELECT id FROM hubs WHERE code = 'IMF') 
WHERE from_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

UPDATE manifests SET to_hub_id = (SELECT id FROM hubs WHERE code = 'IMF') 
WHERE to_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

-- Update tracking_events if hub columns exist
UPDATE tracking_events SET hub_id = (SELECT id FROM hubs WHERE code = 'IMF') 
WHERE hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

-- Step 2: Update hub record itself (IXA → IMF)
UPDATE hubs SET code = 'IMF' WHERE code = 'IXA';

-- Step 3: Add CHECK constraints to enforce valid hub codes
-- Note: These constraints check against hub IDs, ensuring referential integrity
-- The valid codes are: DEL, GAU, CCU, IMF

-- Add check constraint on shipments table
ALTER TABLE shipments
ADD CONSTRAINT shipments_origin_hub_valid
CHECK (origin_hub_id IN (SELECT id FROM hubs WHERE code IN ('DEL', 'GAU', 'CCU', 'IMF')));

ALTER TABLE shipments
ADD CONSTRAINT shipments_destination_hub_valid
CHECK (destination_hub_id IN (SELECT id FROM hubs WHERE code IN ('DEL', 'GAU', 'CCU', 'IMF')));

-- Add check constraint on manifests table
ALTER TABLE manifests
ADD CONSTRAINT manifests_from_hub_valid
CHECK (from_hub_id IN (SELECT id FROM hubs WHERE code IN ('DEL', 'GAU', 'CCU', 'IMF')));

ALTER TABLE manifests
ADD CONSTRAINT manifests_to_hub_valid
CHECK (to_hub_id IN (SELECT id FROM hubs WHERE code IN ('DEL', 'GAU', 'CCU', 'IMF')));

-- Add check constraint on tracking_events table if hub_id exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracking_events' AND column_name = 'hub_id'
  ) THEN
    EXECUTE 'ALTER TABLE tracking_events
      ADD CONSTRAINT tracking_events_hub_valid
      CHECK (hub_id IN (SELECT id FROM hubs WHERE code IN (''DEL'', ''GAU'', ''CCU'', ''IMF'')))';
  END IF;
END $$;

-- Step 4: Verify - Check for any remaining IXA references
DO $$
DECLARE
  ixa_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ixa_count FROM hubs WHERE code = 'IXA';
  IF ixa_count > 0 THEN
    RAISE EXCEPTION 'IXA hub code still exists in hubs table';
  END IF;
END $$;
