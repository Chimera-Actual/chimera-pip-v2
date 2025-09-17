-- Insert test widget into widget catalog
INSERT INTO public.widget_catalog (
  widget_type,
  name, 
  description,
  icon,
  category,
  featured,
  default_settings
) VALUES (
  'test_widget',
  'Test Widget',
  'Comprehensive testing widget with all UI components for theme and functionality testing',
  'TestTube',
  'testing',
  true,
  '{
    "title": "Test Widget",
    "textInput": "",
    "textareaInput": "",
    "selectValue": "",
    "checkboxes": {"option1": false, "option2": false, "option3": false},
    "radioValue": "",
    "sliderValue": [50],
    "switchValue": false,
    "date": null,
    "colorValue": "#00ff00",
    "numberInput": 0
  }'::jsonb
);