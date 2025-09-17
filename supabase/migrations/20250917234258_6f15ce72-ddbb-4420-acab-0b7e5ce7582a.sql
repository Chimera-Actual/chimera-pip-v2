-- Enable RLS on the PostGIS spatial_ref_sys table
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow everyone to read spatial reference systems
-- This is reference data, not user-specific data
CREATE POLICY "Allow public read access to spatial reference systems"
ON public.spatial_ref_sys
FOR SELECT
TO public
USING (true);