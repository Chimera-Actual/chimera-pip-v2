-- Fix the remaining user presence privacy issue
-- The "Users can view all presence data" policy is still allowing everyone to see all presence data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all presence data" ON public.user_presence;

-- The existing "Users can only see their own presence" policy is sufficient for private presence data
-- But if we want to allow viewing online/offline status of other users (common in apps), 
-- let's create a more limited policy that only shows basic status without sensitive data

CREATE POLICY "Users can view limited presence status of others" 
ON public.user_presence 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Full access to own data
    ELSE false  -- No access to others' presence data for now (can be adjusted later)
  END
);