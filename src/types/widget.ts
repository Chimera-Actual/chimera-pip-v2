// Base Widget Types

export interface BaseWidgetSettings {
  title?: string;
  description?: string;
  icon?: string;
  theme?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  customStyles?: Record<string, any>;
  effects?: {
    particles?: boolean;
    scanlines?: boolean;
    glow?: boolean;
    [key: string]: any;
  };
}

export interface BaseWidgetProps {
  title?: string;
  widgetId?: string;
  settings?: BaseWidgetSettings;
  onSettingsChange?: (settings: BaseWidgetSettings) => void;
  showControls?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface WidgetTemplateProps extends BaseWidgetProps {
  icon?: React.ComponentType<any>;
  headerActions?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  cardClassName?: string;
  onSettingsClick?: () => void;
  additionalActions?: React.ReactNode;
}

export interface WidgetSettingsTab {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  content: React.ReactNode;
}

export interface BaseWidgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  settings: BaseWidgetSettings;
  onSave: (settings: BaseWidgetSettings) => void;
  customTabs?: WidgetSettingsTab[];
  showGeneralTab?: boolean;
  showEffectsTab?: boolean;
  children?: React.ReactNode;
}

export type WidgetSize = 'half' | 'full';
export type WidgetTheme = 'default' | 'minimal' | 'retro' | 'modern';