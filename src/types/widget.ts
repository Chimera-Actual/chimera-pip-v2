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
  widgetSpecificActions?: React.ReactNode;
  standardControls?: React.ReactNode;
  statusBarContent?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  cardClassName?: string;
  onSettingsClick?: () => void;
  additionalActions?: React.ReactNode;
  widget?: any; // UserWidget for width control
  isCollapsed?: boolean; // Collapsed state
  // Props from StandardWidgetTemplate
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
  showStandardControls?: boolean;
}

export interface WidgetSettingsTab {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  content: React.ReactNode | ((props: {
    localSettings: BaseWidgetSettings;
    updateSetting: (key: keyof BaseWidgetSettings, value: any) => void;
    updateEffectSetting: (key: string, value: any) => void;
  }) => React.ReactNode);
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

// Widget Action Types for Function Bar
export type WidgetAction =
  | { type: 'tab'; id: string; label: string; active: boolean; onSelect: () => void; icon?: React.ComponentType<any> }
  | { type: 'button'; id: string; label: string; onClick: () => void; icon?: React.ComponentType<any>; disabled?: boolean }
  | { type: 'toggle'; id: string; label: string; on: boolean; onChange: (v: boolean) => void; icon?: React.ComponentType<any> }
  | { type: 'input'; id: string; placeholder?: string; value: string; onChange: (v: string) => void; icon?: React.ComponentType<any> }
  | { type: 'menu'; id: string; label?: string; icon?: React.ComponentType<any>; items: { id: string; label: string; onClick: () => void; icon?: React.ComponentType<any> }[] };

export type WidgetSize = 'half' | 'full';
export type WidgetTheme = 'default' | 'minimal' | 'retro' | 'modern';