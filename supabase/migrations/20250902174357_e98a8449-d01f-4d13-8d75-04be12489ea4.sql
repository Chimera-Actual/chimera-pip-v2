-- Add performance indexes for widget queries
CREATE INDEX IF NOT EXISTS idx_user_widgets_user_id_tab ON user_widgets(user_id, tab_assignment);
CREATE INDEX IF NOT EXISTS idx_user_widgets_created_at ON user_widgets(created_at);
CREATE INDEX IF NOT EXISTS idx_user_widgets_updated_at ON user_widgets(updated_at);

-- Add index for widget tags
CREATE INDEX IF NOT EXISTS idx_widget_tags_user_id ON widget_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_tags_usage_count ON widget_tags(usage_count DESC);

-- Add index for tab management
CREATE INDEX IF NOT EXISTS idx_user_tabs_user_id_position ON user_tabs(user_id, position);

-- Add index for user activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id_created ON user_activities(user_id, created_at DESC);

-- Add index for user achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id, unlocked_at DESC);