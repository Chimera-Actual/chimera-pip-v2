-- 2A: Safer proxy view for spatial_ref_sys (recommended approach)
-- This keeps spatial_ref_sys accessible read-only without exposing more than needed

-- 2A-1: Lock down raw table (restrict direct access)
REVOKE ALL ON TABLE public.spatial_ref_sys FROM PUBLIC;

-- 2A-2: Create read-only view exposing only needed columns
CREATE OR REPLACE VIEW public.v_spatial_ref_sys AS
SELECT srid, auth_name, auth_srid, srtext, proj4text 
FROM public.spatial_ref_sys;

-- 2A-3: Grant controlled read access
GRANT SELECT ON public.v_spatial_ref_sys TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.v_spatial_ref_sys IS 'Read-only view of spatial reference systems for PostGIS operations';