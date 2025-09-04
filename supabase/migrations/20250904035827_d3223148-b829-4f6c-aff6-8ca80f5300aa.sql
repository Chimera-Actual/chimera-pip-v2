-- Add archived column to user_widgets table
ALTER TABLE user_widgets 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering archived widgets
CREATE INDEX IF NOT EXISTS idx_user_widgets_archived 
ON user_widgets (user_id, is_archived);