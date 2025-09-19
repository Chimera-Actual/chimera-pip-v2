-- Add numeric_id field to users table for Quick Access feature
ALTER TABLE public.users 
ADD COLUMN numeric_id VARCHAR(9) UNIQUE,
ADD COLUMN quick_access_enabled BOOLEAN DEFAULT FALSE;

-- Create unique index on numeric_id (excluding null values)
CREATE UNIQUE INDEX idx_users_numeric_id 
ON public.users (numeric_id) 
WHERE numeric_id IS NOT NULL;

-- Add constraint to ensure numeric_id contains only digits
ALTER TABLE public.users 
ADD CONSTRAINT chk_numeric_id_digits 
CHECK (numeric_id IS NULL OR numeric_id ~ '^\d{3,9}$');