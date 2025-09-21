-- Security fix for reference data access
-- Applied approach 2A: Safer proxy view for spatial_ref_sys

-- 2A-1: Lock down raw table (restrict direct access)
REVOKE ALL ON TABLE public.spatial_ref_sys FROM PUBLIC;

-- 2A-2: Create read-only view exposing only needed columns
CREATE OR REPLACE VIEW public.v_spatial_ref_sys 
WITH (security_invoker = true) AS
SELECT srid, auth_name, auth_srid, srtext, proj4text 
FROM public.spatial_ref_sys;

-- 2A-3: Grant controlled read access
GRANT SELECT ON public.v_spatial_ref_sys TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.v_spatial_ref_sys IS 'Read-only view of spatial reference systems for PostGIS operations (security invoker)';

-- Note: spatial_ref_sys table RLS cannot be enabled due to Supabase ownership restrictions
-- This view-based approach provides controlled access without RLS on the underlying table