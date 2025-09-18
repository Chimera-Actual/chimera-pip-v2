# Universal Settings System

A unified, scrollable, tab-free settings interface for consistent UX across all components in the application.

## Features

- **Single scrollable content area** - No tabs, just organized sections
- **Flexible section system** - Components can define their own settings sections
- **Consistent theming** - Pip-Boy visual consistency across all settings
- **Standardized controls** - Unified form controls and validation
- **Smart organization** - Automatic grouping and spacing of settings sections

## Basic Usage

```tsx
import { 
  UniversalSettingsTemplate, 
  SettingsToggle, 
  SettingsSelect, 
  SettingsSlider,
  SettingsInput,
  SettingsGroup 
} from '@/components/settings';
import type { SettingsSection } from '@/types/settings';

const MyComponentSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    volume: 50,
    theme: 'dark'
  });

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic configuration options',
      icon: Settings,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Enable Feature"
            description="Turn this feature on or off"
            value={settings.enabled}
            onChange={(value) => setSettings(prev => ({ ...prev, enabled: value }))}
          />
          
          <SettingsSlider
            label="Volume Level"
            description="Adjust the volume"
            value={settings.volume}
            onChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
            min={0}
            max={100}
            unit="%"
          />
          
          <SettingsSelect
            label="Theme"
            description="Choose a visual theme"
            value={settings.theme}
            onChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
            options={[
              { value: 'light', label: 'Light Mode' },
              { value: 'dark', label: 'Dark Mode' }
            ]}
          />
        </SettingsGroup>
      )
    }
  ];

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="MY COMPONENT SETTINGS"
      description="Configure your component preferences"
      sections={sections}
      onSave={() => {/* save logic */}}
      onReset={() => {/* reset logic */}}
      isDirty={/* check if changed */}
    />
  );
};
```

## Available Controls

### SettingsToggle
```tsx
<SettingsToggle
  label="Enable Feature"
  description="Optional description"
  value={boolean}
  onChange={(value: boolean) => void}
  disabled={false}
/>
```

### SettingsSelect
```tsx
<SettingsSelect
  label="Choose Option"
  description="Optional description"
  value={string | number}
  onChange={(value: string | number) => void}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  disabled={false}
/>
```

### SettingsSlider
```tsx
<SettingsSlider
  label="Adjust Value"
  description="Optional description"
  value={number}
  onChange={(value: number) => void}
  min={0}
  max={100}
  step={1}
  unit="%"
  showValue={true}
  disabled={false}
/>
```

### SettingsInput
```tsx
<SettingsInput
  label="Enter Value"
  description="Optional description"
  value={string}
  onChange={(value: string) => void}
  type="text"
  placeholder="Enter text..."
  disabled={false}
/>
```

### SettingsGroup
```tsx
<SettingsGroup
  title="Group Title"
  description="Optional group description"
>
  {/* Settings controls go here */}
</SettingsGroup>
```

## Organizing Settings

### Section Structure
```tsx
const section: SettingsSection = {
  id: 'unique-id',           // Required: unique identifier
  title: 'Section Title',    // Required: display title
  description: 'Optional description of this section',
  icon: IconComponent,       // Optional: Lucide icon component
  order: 1,                  // Optional: sort order (lower = first)
  content: <JSX.Element />   // Required: the settings content
};
```

### Best Practices

1. **Group related settings** - Use `SettingsGroup` to organize related controls
2. **Meaningful descriptions** - Provide helpful descriptions for complex settings
3. **Logical ordering** - Use the `order` property to arrange sections logically
4. **Consistent icons** - Use Lucide icons for section headers
5. **Clear labels** - Keep setting labels short but descriptive

## Migration from Existing Settings

### From Tabbed Settings
Instead of tabs, organize content into sections:

```tsx
// Old tabbed approach
<Tabs>
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="general">{/* content */}</TabsContent>
  <TabsContent value="advanced">{/* content */}</TabsContent>
</Tabs>

// New sectioned approach
const sections = [
  {
    id: 'general',
    title: 'General Settings',
    content: <SettingsGroup>{/* content */}</SettingsGroup>
  },
  {
    id: 'advanced', 
    title: 'Advanced Settings',
    content: <SettingsGroup>{/* content */}</SettingsGroup>
  }
];
```

## Examples

See `SystemSettingsExample.tsx` for a complete real-world example of converting existing tabbed settings to the unified system.