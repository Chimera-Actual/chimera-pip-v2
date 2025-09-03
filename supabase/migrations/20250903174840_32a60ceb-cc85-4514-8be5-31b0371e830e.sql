-- Insert widget settings schemas for new widgets
INSERT INTO widget_settings_schemas (widget_type, default_settings, settings_schema, validation_rules)
VALUES 
(
  'achievement-gallery',
  '{"showProgress": true, "categoryFilter": "all", "sortBy": "unlocked"}',
  '{"type": "object", "properties": {"showProgress": {"type": "boolean", "title": "Show Progress", "description": "Display achievement progress bars"}, "categoryFilter": {"type": "string", "title": "Category Filter", "enum": ["all", "combat", "exploration", "social", "technical", "milestone", "special"], "default": "all"}, "sortBy": {"type": "string", "title": "Sort By", "enum": ["unlocked", "points", "rarity", "category"], "default": "unlocked"}}}',
  '{"required": ["showProgress", "categoryFilter", "sortBy"]}'
),
(
  'secure-vault',
  '{"autoLockTimeout": 300000, "showLastAccess": true, "encryptionLevel": "high"}',
  '{"type": "object", "properties": {"autoLockTimeout": {"type": "number", "title": "Auto Lock Timeout (ms)", "minimum": 60000, "maximum": 1800000, "default": 300000}, "showLastAccess": {"type": "boolean", "title": "Show Last Access", "description": "Display last access timestamps"}, "encryptionLevel": {"type": "string", "title": "Encryption Level", "enum": ["standard", "high", "maximum"], "default": "high"}}}',
  '{"required": ["autoLockTimeout", "showLastAccess", "encryptionLevel"]}'
),
(
  'calendar-mission',
  '{"viewMode": "list", "autoRefresh": true, "showOverdue": true, "defaultPriority": "medium"}',
  '{"type": "object", "properties": {"viewMode": {"type": "string", "title": "View Mode", "enum": ["list", "calendar", "timeline"], "default": "list"}, "autoRefresh": {"type": "boolean", "title": "Auto Refresh", "description": "Automatically refresh mission data"}, "showOverdue": {"type": "boolean", "title": "Show Overdue", "description": "Highlight overdue missions"}, "defaultPriority": {"type": "string", "title": "Default Priority", "enum": ["low", "medium", "high", "critical"], "default": "medium"}}}',
  '{"required": ["viewMode", "autoRefresh", "showOverdue", "defaultPriority"]}'
),
(
  'ai-oracle',
  '{"personality": "codsworth", "responseLength": "medium", "contextAware": true, "saveHistory": true}',
  '{"type": "object", "properties": {"personality": {"type": "string", "title": "AI Personality", "enum": ["codsworth", "modus", "eden", "nick_valentine"], "default": "codsworth"}, "responseLength": {"type": "string", "title": "Response Length", "enum": ["short", "medium", "long"], "default": "medium"}, "contextAware": {"type": "boolean", "title": "Context Aware", "description": "Use user profile and activity data for responses"}, "saveHistory": {"type": "boolean", "title": "Save Chat History", "description": "Store conversation history"}}}',
  '{"required": ["personality", "responseLength", "contextAware", "saveHistory"]}'
);

-- Insert missing widget catalog entries for new widgets
INSERT INTO widget_catalog (widget_type, name, description, icon, category, featured, default_settings)
VALUES 
(
  'achievement-gallery',
  'Achievement Gallery',
  'Track and display your unlocked achievements and progress milestones',
  'Trophy',
  'entertainment',
  true,
  '{"showProgress": true, "categoryFilter": "all", "sortBy": "unlocked"}'
),
(
  'secure-vault',
  'Secure Vault',
  'Encrypted storage for sensitive information like passwords and API keys',
  'Lock',
  'productivity',
  true,
  '{"autoLockTimeout": 300000, "showLastAccess": true, "encryptionLevel": "high"}'
),
(
  'calendar-mission',
  'Mission Calendar',
  'Task and mission management with calendar view and progress tracking',
  'Calendar',
  'productivity',
  true,
  '{"viewMode": "list", "autoRefresh": true, "showOverdue": true, "defaultPriority": "medium"}'
),
(
  'ai-oracle',
  'AI Oracle',
  'Intelligent AI assistant with customizable personalities and context awareness',
  'MessageCircle',
  'communication',
  true,
  '{"personality": "codsworth", "responseLength": "medium", "contextAware": true, "saveHistory": true}'
);