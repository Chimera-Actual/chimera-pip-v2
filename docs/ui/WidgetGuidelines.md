# Widget Guidelines

This document outlines the standardized patterns and conventions for creating widgets in our application.

## Widget Structure

All widgets should follow a consistent three-tier structure:

### 1. Header (WidgetHeader)
The header contains **chrome controls only** - no business logic controls belong here.

**Left side:**
- Widget title and icon
- Drag handle (if draggable)

**Right side:**
- Collapse/Expand button
- Full-width toggle (overflow menu if needed)
- Close/Remove button

```tsx
<WidgetHeader
  title="Widget Name"
  icon={WidgetIcon}
  onClose={onClose}
  onCollapse={onCollapse}
  onToggleFullWidth={onToggleFullWidth}
  dragHandle={true}
/>
```

### 2. Function Bar (WidgetActionBar)
The function bar sits **immediately under the header** and contains all widget-specific business controls.

**Typical actions (left → right):**
- Mode selection (tabs, dropdown)
- Primary actions (new, refresh, sync)
- Conditional actions (stop, pause - only when relevant)
- Secondary actions (export, import)
- Settings (opens right-side sheet)

```tsx
const actions: WidgetAction[] = [
  { type: 'dropdown', id: 'mode', label: currentMode.name, items: modeOptions },
  { type: 'button', id: 'refresh', label: 'Refresh', icon: RefreshCw, onClick: handleRefresh },
  { type: 'button', id: 'settings', label: 'Settings', icon: Settings, onClick: openSettings },
];

<WidgetActionBar actions={actions} />
```

### 3. Content Area
The main widget content with **no duplicate controls**. Each function should appear exactly once in the widget.

## Settings Pattern

**All widget settings must use the shared `WidgetSettingsSheet`** - no per-widget modals.

```tsx
<WidgetSettingsSheet
  open={settingsOpen}
  onOpenChange={setSettingsOpen}
  title="Widget Settings"
  description="Configure your widget preferences"
>
  <WidgetSettingsForm config={config} onSave={handleSave} />
</WidgetSettingsSheet>
```

The settings sheet:
- Opens from the right side
- Uses consistent Pip-Boy theme tokens
- Contains only the settings form content (no sheet wrapper in the form component)

## Layout & Spacing

### Consistent Spacing
- **No double borders**: If the action bar has a border-b, content should not add border-t
- **Tight bottom spacing**: Use `contentClassName="pt-0 pb-1 px-4"` on WidgetShell to avoid excess padding
- **Respect theme tokens**: Use semantic color tokens, never hardcoded colors

### Grid Layout
Widgets support two widths in the grid layout:
- **Normal**: `col-span-1` (half width)
- **Full**: `col-span-2` (full width)

## Accessibility Requirements

All interactive elements must have:
- **aria-label**: Descriptive labels for screen readers
- **Tooltips**: Visual help text on hover
- **Keyboard navigation**: Focus states and keyboard shortcuts
- **Focus management**: Proper tab order and escape handling

```tsx
<Button
  aria-label="Refresh weather data"
  title="Refresh weather data"
  onClick={handleRefresh}
>
  <RefreshCw className="h-4 w-4" />
</Button>
```

## Theme Integration

Use semantic design tokens from the theme system:

```tsx
// ✅ Correct - semantic tokens
className="bg-pip-bg-secondary text-pip-text-primary border-pip-border"

// ❌ Wrong - hardcoded colors  
className="bg-gray-800 text-white border-gray-600"
```

## Example Implementation

```tsx
function ExampleWidget({ 
  widgetId, 
  onClose, 
  onCollapse, 
  onToggleFullWidth 
}: WidgetProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('default');
  
  const actions: WidgetAction[] = [
    { 
      type: 'dropdown', 
      id: 'mode', 
      label: currentMode,
      items: modeOptions.map(mode => ({
        id: mode.id,
        label: mode.name,
        onClick: () => setCurrentMode(mode.id)
      }))
    },
    { type: 'button', id: 'refresh', label: 'Refresh', icon: RefreshCw, onClick: refresh },
    { type: 'button', id: 'settings', label: 'Settings', icon: Settings, onClick: () => setSettingsOpen(true) },
  ];

  return (
    <>
      <WidgetShell
        title="Example Widget"
        icon={ExampleIcon}
        onClose={onClose}
        onCollapse={onCollapse}
        onToggleFullWidth={onToggleFullWidth}
        contentClassName="pt-0 pb-1 px-4"
      >
        <WidgetActionBar actions={actions} />
        
        <div className="widget-content">
          {/* Main widget content - no duplicate controls */}
        </div>
      </WidgetShell>
      
      <WidgetSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Example Widget Settings"
      >
        <ExampleWidgetSettings config={config} onSave={handleSave} />
      </WidgetSettingsSheet>
    </>
  );
}
```

## Migration Checklist

When migrating existing widgets to this pattern:

- [ ] Move all business controls from header to function bar
- [ ] Remove duplicate controls (keep single source of truth)
- [ ] Replace widget modals with WidgetSettingsSheet
- [ ] Add standard header controls (close, collapse, full-width)
- [ ] Verify spacing and borders are clean
- [ ] Add aria-labels and tooltips
- [ ] Use theme tokens throughout
- [ ] Test keyboard navigation

## Anti-Patterns to Avoid

❌ **Business controls in header**: Settings, refresh, mode toggles don't belong in the header
❌ **Duplicate controls**: Don't have the same function in multiple places  
❌ **Widget-specific modals**: Use the shared WidgetSettingsSheet instead
❌ **Hardcoded colors**: Always use theme tokens
❌ **Excessive spacing**: Avoid large gaps and double borders
❌ **Missing accessibility**: Every control needs proper labeling