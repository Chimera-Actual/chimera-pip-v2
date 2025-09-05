-- Final fix for duplicate order positions (without recreating existing index)
-- This will ensure ALL widgets have unique, sequential order positions per user/tab

-- Create a temporary table to calculate the correct order positions
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
UPDATE user_widgets 
SET 
  order_position = ordered_widgets.new_order_position,
  updated_at = now()
FROM ordered_widgets 
WHERE user_widgets.id = ordered_widgets.id
  AND user_widgets.order_position != ordered_widgets.new_order_position;

-- Add unique constraint to prevent future duplicates (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_tab_order_position'
    ) THEN
        ALTER TABLE user_widgets 
        ADD CONSTRAINT unique_user_tab_order_position 
        UNIQUE (user_id, tab_assignment, order_position);
    END IF;
END $$;