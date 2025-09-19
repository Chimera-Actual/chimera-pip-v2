-- Add AI Agent widget to the widget catalog
INSERT INTO widget_catalog (
  widget_type,
  name,
  description,
  icon,
  default_settings,
  is_default,
  featured
) VALUES (
  'ai-agent',
  'AI Agent',
  'Chat with AI agents using custom webhooks or the built-in Supabase AI service. Features conversation history, multiple agent personalities, and export capabilities.',
  'Bot',
  '{"defaultAgentId": "overseer", "customWebhookUrl": null, "customHeaders": {}}',
  true,
  true
) ON CONFLICT (widget_type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  default_settings = EXCLUDED.default_settings,
  updated_at = now();