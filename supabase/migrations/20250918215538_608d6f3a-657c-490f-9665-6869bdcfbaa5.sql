-- Add Weather Dashboard Widget to the widget catalog
INSERT INTO public.widget_catalog (
  widget_type,
  name,
  description,
  icon,
  default_settings,
  is_default,
  featured
) VALUES (
  'weather_dashboard',
  'Weather Dashboard',
  'Complete weather station with current conditions, 5-day forecast, air quality, pollen data, and Pip-Boy radiation mode',
  'CloudSun',
  '{
    "title": "Weather Dashboard",
    "units": "metric",
    "pipBoyMode": false,
    "showAirQuality": true,
    "showPollen": true,
    "showForecast": true,
    "autoLocation": true,
    "defaultLocation": {
      "lat": 40.7128,
      "lng": -74.0060,
      "city": "New York",
      "country": "US",
      "displayName": "New York, NY, USA"
    },
    "updateInterval": 10,
    "theme": "modern"
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