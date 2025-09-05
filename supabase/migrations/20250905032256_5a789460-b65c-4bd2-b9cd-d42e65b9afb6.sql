-- Final fix for duplicate order positions
-- This will ensure ALL widgets have unique, sequential order positions per user/tab

-- First, let's create a temporary table to calculate the correct order positions
CREATE TEMP TABLE widget_order_fix AS
WITH ordered_widgets AS (
  SELECT 
    id,
    user_id,
    tab_assignment,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, tab_assignment 
      ORDER BY 
        CASE 
          WHEN order_position IS NOT NULL THEN order_position 
          ELSE 999999 
        END,
        created_at
    ) - 1 AS new_order_position
  FROM user_widgets
)
SELECT * FROM ordered_widgets;

-- Update all widgets with their correct sequential order positions
UPDATE user_widgets 
SET 
  order_position = widget_order_fix.new_order_position,
  updated_at = now()
FROM widget_order_fix 
WHERE user_widgets.id = widget_order_fix.id
  AND user_widgets.order_position != widget_order_fix.new_order_position;

-- Add unique constraint to prevent future duplicates
-- Drop existing index if it exists (in case previous migrations created it)
DROP INDEX IF EXISTS idx_user_widgets_unique_order;

-- Create unique constraint for order positions per user/tab
ALTER TABLE user_widgets 
ADD CONSTRAINT unique_user_tab_order_position 
UNIQUE (user_id, tab_assignment, order_position);

-- Create index for performance
CREATE INDEX idx_user_widgets_order ON user_widgets (user_id, tab_assignment, order_position);