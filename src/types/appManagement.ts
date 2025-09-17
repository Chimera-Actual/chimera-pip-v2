// App Management Types

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  description?: string;
  category: 'utility' | 'data' | 'entertainment' | 'productivity' | 'system';
  component: string; // Component name to render
  defaultSettings?: Record<string, any>;
  isDefault?: boolean;
}

// UserApp matches the database structure (user_widgets table)
export interface UserApp {
  id: string;
  user_id: string;
  widget_type: string;
  tab_assignment: string;
  display_order: number;
  widget_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active?: boolean; // Optional since we'll add this field to DB
}

export type AppCategory = 'utility' | 'data' | 'entertainment' | 'productivity' | 'system';