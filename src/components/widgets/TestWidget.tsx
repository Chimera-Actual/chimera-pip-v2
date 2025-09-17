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
import { CalendarIcon, Palette, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TestWidgetProps {
  title?: string;
  settings?: any;
  onSettingsChange?: (settings: any) => void;
}

export const TestWidget: React.FC<TestWidgetProps> = ({
  title = "Test Widget",
  settings = {},
  onSettingsChange
}) => {
  const [textInput, setTextInput] = useState(settings.textInput || '');
  const [textareaInput, setTextareaInput] = useState(settings.textareaInput || '');
  const [selectValue, setSelectValue] = useState(settings.selectValue || '');
  const [checkboxes, setCheckboxes] = useState(settings.checkboxes || { option1: false, option2: false, option3: false });
  const [radioValue, setRadioValue] = useState(settings.radioValue || '');
  const [sliderValue, setSliderValue] = useState(settings.sliderValue || [50]);
  const [switchValue, setSwitchValue] = useState(settings.switchValue || false);
  const [date, setDate] = useState<Date | undefined>(settings.date ? new Date(settings.date) : undefined);
  const [colorValue, setColorValue] = useState(settings.colorValue || '#00ff00');
  const [numberInput, setNumberInput] = useState(settings.numberInput || 0);

  const handleCheckboxChange = (key: string, checked: boolean | 'indeterminate') => {
    const newCheckboxes = { ...checkboxes, [key]: !!checked };
    setCheckboxes(newCheckboxes);
    onSettingsChange?.({ ...settings, checkboxes: newCheckboxes });
  };

  const updateSetting = (key: string, value: any) => {
    onSettingsChange?.({ ...settings, [key]: value });
  };

  return (
    <Card className="w-full bg-pip-bg-secondary border-pip-border">
      <CardHeader className="border-b border-pip-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-pip-text-bright font-pip-display pip-text-glow">
              {title}
            </CardTitle>
            <CardDescription className="text-pip-text-secondary font-pip-mono text-xs mt-1">
              Comprehensive UI component testing widget
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Testing
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
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
              <SelectContent className="bg-pip-bg-secondary border-pip-border">
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
                    checked={checked}
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
                placeholder="#000000"
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
      </CardContent>
    </Card>
  );
};