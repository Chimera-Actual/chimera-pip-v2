-- Fix duplicate widget order positions
-- First, let's create a function to reassign unique order positions for each user's widgets
WITH user_widgets_with_row_numbers AS (
  SELECT 
    id,
    user_id,
    tab_assignment,
    ROW_NUMBER() OVER (PARTITION BY user_id, tab_assignment ORDER BY 
      CASE 
        WHEN order_position IS NOT NULL THEN order_position 
        ELSE 999999 
      END ASC, 
      created_at ASC
    ) - 1 AS new_order_position
  FROM user_widgets
)
UPDATE user_widgets 
SET 
  order_position = uwrn.new_order_position,
  updated_at = now()
FROM user_widgets_with_row_numbers uwrn
WHERE user_widgets.id = uwrn.id
  AND user_widgets.order_position != uwrn.new_order_position;

-- Add a constraint to prevent future duplicate order positions within the same user/tab
-- Note: We can't use a unique constraint directly because order_position can be null
-- Instead, we'll create a partial unique index that ignores nulls
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_widgets_unique_order_per_tab 
ON user_widgets (user_id, tab_assignment, order_position) 
WHERE order_position IS NOT NULL;