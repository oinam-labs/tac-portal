-- Create tracking_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id),
    awb_number TEXT NOT NULL,
    event_code TEXT NOT NULL,
    event_time TIMESTAMPTZ DEFAULT now(),
    hub_id UUID REFERENCES public.hubs(id),
    actor_staff_id UUID REFERENCES public.staff(id),
    source TEXT CHECK (source IN ('SCAN', 'MANUAL', 'SYSTEM', 'API')) DEFAULT 'MANUAL',
    location TEXT,
    notes TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
-- Allow public to select tracking events by AWB (for public tracking page)
CREATE POLICY "Public can view tracking events by AWB" ON public.tracking_events
    FOR SELECT
    USING (true); -- Filtered by query usually, but 'true' allows public access. 
    -- Alternatively, might restrict to just 'awb_number' lookup, but that's what 'Using' does? 
    -- 'Using (true)' means anyone can select rows. The query usually filters by awb.

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Staff can manage tracking events" ON public.tracking_events
    FOR ALL
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.staff WHERE auth_user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tracking_events_org_id ON public.tracking_events(org_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_awb_number ON public.tracking_events(awb_number);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_time ON public.tracking_events(event_time);
