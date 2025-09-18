-- Add Atomic Clock Widget to the widget catalog
INSERT INTO public.widget_catalog (
  widget_type,
  name,
  description,
  icon,
  default_settings,
  is_default,
  featured
) VALUES (
  'atomic_clock',
  'Atomic Clock',
  'Multi-timezone atomic clock with alarms, themes, and retro visual effects',
  'Clock',
  '{
    "title": "Atomic Clock",
    "theme": "vault-tec",
    "showSeconds": true,
    "format24": false,
    "showDate": true,
    "showTimezone": true,
    "worldClocks": [
      {"id": "1", "timezone": "America/New_York", "label": "New York"},
      {"id": "2", "timezone": "Europe/London", "label": "London"},
      {"id": "3", "timezone": "Asia/Tokyo", "label": "Tokyo"}
    ],
    "alarms": [],
    "effects": {
      "particles": true,
      "scanlines": true,
      "glow": true
    }
  }',
  true,
  true
) ON CONFLICT (widget_type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  default_settings = EXCLUDED.default_settings,
  featured = EXCLUDED.featured,
  updated_at = now();