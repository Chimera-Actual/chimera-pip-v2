-- Fix duplicate widget order positions by assigning unique sequential order within each user/tab
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
WHERE user_widgets.id = uwrn.id;