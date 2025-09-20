import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Palette, AlertCircle, CheckCircle2, Info, Eye, EyeOff, Search, Mail, Link, Upload, User, Heart, Settings, Home, TestTube } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { WidgetTemplate } from './WidgetTemplate';

interface TestWidgetProps {
  title?: string;
  settings?: any;
  onSettingsChange?: (settings: any) => void;
  widget?: any;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
}

export const TestWidget: React.FC<TestWidgetProps> = ({
  title = "Test Widget",
  settings = {},
  onSettingsChange,
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings
}) => {
  const { toast } = useToast();
  
  const [textInput, setTextInput] = useState(settings.textInput || '');
  const [textareaInput, setTextareaInput] = useState(settings.textareaInput || '');
  const [selectValue, setSelectValue] = useState(settings.selectValue || '');
  const [checkboxes, setCheckboxes] = useState(settings.checkboxes || { option1: false, option2: false, option3: false });
  const [radioValue, setRadioValue] = useState(settings.radioValue || '');
  const [sliderValue, setSliderValue] = useState(settings.sliderValue || [50]);
  const [switchValue, setSwitchValue] = useState(settings.switchValue || false);
  const [date, setDate] = useState<Date | undefined>(settings.date ? new Date(settings.date) : undefined);
  const [colorValue, setColorValue] = useState(settings.colorValue || 'hsl(var(--pip-green-primary))');
  const [numberInput, setNumberInput] = useState(settings.numberInput || 0);
  const [passwordInput, setPasswordInput] = useState(settings.passwordInput || '');
  const [emailInput, setEmailInput] = useState(settings.emailInput || '');
  const [urlInput, setUrlInput] = useState(settings.urlInput || '');
  const [searchInput, setSearchInput] = useState(settings.searchInput || '');
  const [showPassword, setShowPassword] = useState(false);
  const [progressValue, setProgressValue] = useState(settings.progressValue || 65);
  const [toggleStates, setToggleStates] = useState(settings.toggleStates || { bold: false, italic: false, underline: false });
  const [toggleGroupValue, setToggleGroupValue] = useState<string[]>(settings.toggleGroupValue || []);
  const [activeTab, setActiveTab] = useState(settings.activeTab || 'tab1');

  const handleCheckboxChange = (key: string, checked: CheckedState) => {
    const newCheckboxes = { ...checkboxes, [key]: !!checked };
    setCheckboxes(newCheckboxes);
    onSettingsChange?.({ ...settings, checkboxes: newCheckboxes });
  };

  const updateSetting = (key: string, value: any) => {
    onSettingsChange?.({ ...settings, [key]: value });
  };

  return (
    <WidgetTemplate
      title={title}
      settings={{ title, description: 'Comprehensive UI component testing widget' }}
      icon={TestTube}
      widget={widget}
      onRemove={onRemove}
      onToggleCollapse={onToggleCollapse}
      onToggleFullWidth={onToggleFullWidth}
      onOpenSettings={onOpenSettings}
      contentClassName="p-0"
    >
      
      <ScrollArea className="h-96 px-6">
          <div className="space-y-6">
        {/* Text Inputs Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Text Inputs
          </h4>
          
          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Single Line Input</Label>
            <Input
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                updateSetting('textInput', e.target.value);
              }}
              placeholder="Enter text here..."
              className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Multi-line Input</Label>
            <Textarea
              value={textareaInput}
              onChange={(e) => {
                setTextareaInput(e.target.value);
                updateSetting('textareaInput', e.target.value);
              }}
              placeholder="Enter multi-line text..."
              rows={3}
              className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Number Input</Label>
            <Input
              type="number"
              value={numberInput}
              onChange={(e) => {
                setNumberInput(Number(e.target.value));
                updateSetting('numberInput', Number(e.target.value));
              }}
              className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
            />
          </div>
        </div>

        {/* Selection Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Selection Components
          </h4>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Dropdown Select</Label>
            <Select value={selectValue} onValueChange={(value) => {
              setSelectValue(value);
              updateSetting('selectValue', value);
            }}>
              <SelectTrigger className="bg-pip-bg-tertiary border-pip-border">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent className="bg-pip-bg-secondary border-pip-border z-50">
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Checkboxes</Label>
            <div className="space-y-2">
              {Object.entries(checkboxes).map(([key, checked]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={checked as boolean}
                    onCheckedChange={(checked) => handleCheckboxChange(key, checked)}
                    className="border-pip-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={key} className="text-pip-text-primary font-pip-mono text-xs capitalize">
                    {key.replace('option', 'Checkbox Option ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Radio Buttons</Label>
            <RadioGroup value={radioValue} onValueChange={(value) => {
              setRadioValue(value);
              updateSetting('radioValue', value);
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="radio1" id="radio1" className="border-pip-border text-primary" />
                <Label htmlFor="radio1" className="text-pip-text-primary font-pip-mono text-xs">Radio Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="radio2" id="radio2" className="border-pip-border text-primary" />
                <Label htmlFor="radio2" className="text-pip-text-primary font-pip-mono text-xs">Radio Option 2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="radio3" id="radio3" className="border-pip-border text-primary" />
                <Label htmlFor="radio3" className="text-pip-text-primary font-pip-mono text-xs">Radio Option 3</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Interactive Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Interactive Components
          </h4>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Slider (Value: {sliderValue[0]})</Label>
            <Slider
              value={sliderValue}
              onValueChange={(value) => {
                setSliderValue(value);
                updateSetting('sliderValue', value);
              }}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Toggle Switch</Label>
            <Switch
              checked={switchValue}
              onCheckedChange={(checked) => {
                setSwitchValue(checked);
                updateSetting('switchValue', checked);
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Date Picker</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-pip-bg-tertiary border-pip-border",
                    !date && "text-pip-text-secondary"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-pip-bg-secondary border-pip-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    updateSetting('date', newDate?.toISOString());
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-pip-text-secondary font-pip-mono text-xs">Color Picker</Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={colorValue}
                onChange={(e) => {
                  setColorValue(e.target.value);
                  updateSetting('colorValue', e.target.value);
                }}
                className="w-12 h-8 rounded border border-pip-border bg-pip-bg-tertiary cursor-pointer"
              />
              <Input
                value={colorValue}
                onChange={(e) => {
                  setColorValue(e.target.value);
                  updateSetting('colorValue', e.target.value);
                }}
                className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
                placeholder="hsl(var(--background))"
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Button Variants
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="font-pip-mono text-xs">
              Primary Button
            </Button>
            <Button variant="secondary" className="font-pip-mono text-xs">
              Secondary Button
            </Button>
            <Button variant="outline" className="font-pip-mono text-xs">
              Outline Button
            </Button>
            <Button variant="destructive" className="font-pip-mono text-xs">
              Destructive Button
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Status Indicators
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-pip-mono text-xs">Success status indicator</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 font-pip-mono text-xs">Warning status indicator</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 font-pip-mono text-xs">Error status indicator</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 font-pip-mono text-xs">Info status indicator</span>
            </div>
          </div>
        </div>

        {/* Additional Input Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Additional Input Types
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Password Input</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    updateSetting('passwordInput', e.target.value);
                  }}
                  placeholder="Enter password..."
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Email Input</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-secondary" />
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    updateSetting('emailInput', e.target.value);
                  }}
                  placeholder="Enter email..."
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">URL Input</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-secondary" />
                <Input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    updateSetting('urlInput', e.target.value);
                  }}
                  placeholder="https://example.com"
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Search Input</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-secondary" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    updateSetting('searchInput', e.target.value);
                  }}
                  placeholder="Search..."
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">File Input</Label>
              <div className="relative">
                <Input
                  type="file"
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Progress Components
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Progress Bar ({progressValue}%)</Label>
              <Progress value={progressValue} className="w-full" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>-10%</Button>
                <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+10%</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Toggle Components
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Single Toggles</Label>
              <div className="flex gap-2">
                <Toggle>
                  <Heart className="h-4 w-4" />
                </Toggle>
                <Toggle variant="outline">
                  <Settings className="h-4 w-4" />
                </Toggle>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Toggle Group</Label>
              <ToggleGroup type="multiple" value={toggleGroupValue} onValueChange={setToggleGroupValue}>
                <ToggleGroupItem value="bold" aria-label="Toggle bold">
                  <strong>B</strong>
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic">
                  <em>I</em>
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline">
                  <u>U</u>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* Alert Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Alert Components
          </h4>
          
          <div className="space-y-3">
            <Alert className="bg-pip-bg-tertiary border-pip-border">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-pip-text-bright">Info Alert</AlertTitle>
              <AlertDescription className="text-pip-text-secondary">
                This is an informational alert with custom styling.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Destructive Alert</AlertTitle>
              <AlertDescription>
                This is a destructive alert indicating an error or warning.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Avatar Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Avatar Components
          </h4>
          
          <div className="flex gap-4 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" alt="Vercel" />
              <AvatarFallback className="bg-pip-bg-tertiary text-pip-text-primary">VC</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-pip-bg-tertiary text-pip-text-primary text-lg">
                LG
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Separator */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Separators
          </h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-pip-text-secondary font-pip-mono text-xs mb-2">Horizontal Separator</p>
              <Separator className="bg-pip-border" />
            </div>
            <div className="flex h-8 items-center">
              <p className="text-pip-text-secondary font-pip-mono text-xs">Vertical</p>
              <Separator orientation="vertical" className="mx-4 bg-pip-border" />
              <p className="text-pip-text-secondary font-pip-mono text-xs">Separator</p>
            </div>
          </div>
        </div>

        {/* Badge Variations */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Badge Variations
          </h4>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        {/* Tooltip Examples */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Tooltip Examples
          </h4>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Bottom positioned tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Toast Notifications
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => toast({ title: "Success!", description: "This is a success toast." })}
            >
              Success Toast
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => toast({ 
                variant: "destructive",
                title: "Error!", 
                description: "This is an error toast." 
              })}
            >
              Error Toast
            </Button>
          </div>
        </div>

        {/* Tabs Example */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Tabs Example
          </h4>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-pip-bg-tertiary">
              <TabsTrigger value="tab1" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tab 1
              </TabsTrigger>
              <TabsTrigger value="tab2" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tab 2
              </TabsTrigger>
              <TabsTrigger value="tab3" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tab 3
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="bg-pip-bg-tertiary p-4 rounded">
              <p className="text-pip-text-primary font-pip-mono text-xs">Content for Tab 1</p>
            </TabsContent>
            <TabsContent value="tab2" className="bg-pip-bg-tertiary p-4 rounded">
              <p className="text-pip-text-primary font-pip-mono text-xs">Content for Tab 2</p>
            </TabsContent>
            <TabsContent value="tab3" className="bg-pip-bg-tertiary p-4 rounded">
              <p className="text-pip-text-primary font-pip-mono text-xs">Content for Tab 3</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Accordion Example */}
        <div className="space-y-4">
          <h4 className="text-sm font-pip-display text-pip-text-bright border-b border-pip-border pb-2">
            Accordion Example
          </h4>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-pip-border">
              <AccordionTrigger className="text-pip-text-primary hover:text-pip-text-bright">
                Is it accessible?
              </AccordionTrigger>
              <AccordionContent className="text-pip-text-secondary">
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-pip-border">
              <AccordionTrigger className="text-pip-text-primary hover:text-pip-text-bright">
                Is it styled?
              </AccordionTrigger>
              <AccordionContent className="text-pip-text-secondary">
                Yes. It comes with default styles that match the other components' aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-pip-border">
              <AccordionTrigger className="text-pip-text-primary hover:text-pip-text-bright">
                Is it animated?
              </AccordionTrigger>
              <AccordionContent className="text-pip-text-secondary">
                Yes. It's animated by default, but you can disable it if you prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
          </div>
        </ScrollArea>
    </WidgetTemplate>
  );
};