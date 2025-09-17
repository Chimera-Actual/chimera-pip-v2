-- Clear all widget-related data
DELETE FROM widget_tag_associations;
DELETE FROM widget_tags WHERE user_id IS NOT NULL;
DELETE FROM widget_instance_settings;
DELETE FROM ai_conversations;
DELETE FROM ai_agents;
DELETE FROM user_widgets;
DELETE FROM widget_catalog;