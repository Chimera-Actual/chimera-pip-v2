-- Update existing widget catalog entries instead of inserting
UPDATE widget_catalog 
SET 
  name = 'Achievement Gallery',
  description = 'Track and display your unlocked achievements and progress milestones',
  icon = 'Trophy',
  category = 'entertainment',
  featured = true,
  default_settings = '{"showProgress": true, "categoryFilter": "all", "sortBy": "unlocked"}'
WHERE widget_type = 'achievement-gallery';

UPDATE widget_catalog 
SET 
  name = 'Secure Vault',
  description = 'Encrypted storage for sensitive information like passwords and API keys',
  icon = 'Lock',
  category = 'productivity',
  featured = true,
  default_settings = '{"autoLockTimeout": 300000, "showLastAccess": true, "encryptionLevel": "high"}'
WHERE widget_type = 'secure-vault';

UPDATE widget_catalog 
SET 
  name = 'Mission Calendar',
  description = 'Task and mission management with calendar view and progress tracking',
  icon = 'Calendar',
  category = 'productivity',
  featured = true,
  default_settings = '{"viewMode": "list", "autoRefresh": true, "showOverdue": true, "defaultPriority": "medium"}'
WHERE widget_type = 'calendar-mission';

UPDATE widget_catalog 
SET 
  name = 'AI Oracle',
  description = 'Intelligent AI assistant with customizable personalities and context awareness',
  icon = 'MessageCircle',
  category = 'communication',
  featured = true,
  default_settings = '{"personality": "codsworth", "responseLength": "medium", "contextAware": true, "saveHistory": true}'
WHERE widget_type = 'ai-oracle';