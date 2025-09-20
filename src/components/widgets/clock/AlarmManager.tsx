import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Volume2, Bell, Clock } from 'lucide-react';
import { timeUtils } from './utils/timeUtils';

interface Alarm {
  id: string;
  time: string;
  days: string[];
  enabled: boolean;
  label: string;
  sound: string;
}

interface AlarmManagerProps {
  alarms: Alarm[];
  onAlarmsChange: (alarms: Alarm[]) => void;
  format24: boolean;
}

export const AlarmManager: React.FC<AlarmManagerProps> = ({
  alarms,
  onAlarmsChange,
  format24
}) => {
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarm, setNewAlarm] = useState({
    time: '08:00',
    days: [] as string[],
    label: '',
    sound: 'geiger'
  });

  const dayLabels = [
    { key: 'SUN', label: 'Sun' },
    { key: 'MON', label: 'Mon' },
    { key: 'TUE', label: 'Tue' },
    { key: 'WED', label: 'Wed' },
    { key: 'THU', label: 'Thu' },
    { key: 'FRI', label: 'Fri' },
    { key: 'SAT', label: 'Sat' }
  ];

  const soundOptions = [
    { value: 'geiger', label: 'Geiger Counter' },
    { value: 'pip-boy', label: 'Pip-Boy Alert' },
    { value: 'vault-alarm', label: 'Vault Alarm' },
    { value: 'radio-static', label: 'Radio Static' },
    { value: 'beep', label: 'Classic Beep' }
  ];

  const addAlarm = () => {
    if (!newAlarm.time || !newAlarm.label || newAlarm.days.length === 0) {
      return;
    }

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarm.time,
      days: newAlarm.days,
      enabled: true,
      label: newAlarm.label,
      sound: newAlarm.sound
    };

    onAlarmsChange([...alarms, alarm]);
    setNewAlarm({
      time: '08:00',
      days: [],
      label: '',
      sound: 'geiger'
    });
    setShowAddAlarm(false);
  };

  const removeAlarm = (alarmId: string) => {
    onAlarmsChange(alarms.filter(alarm => alarm.id !== alarmId));
  };

  const toggleAlarm = (alarmId: string) => {
    onAlarmsChange(
      alarms.map(alarm =>
        alarm.id === alarmId ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const toggleDay = (day: string) => {
    setNewAlarm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const formatAlarmTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (format24) {
      return time;
    }
    return timeUtils.to12HourFormat(hours, minutes);
  };

  const formatAlarmDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('SAT') && !days.includes('SUN')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('SAT') && days.includes('SUN')) {
      return 'Weekends';
    }
    return days.join(', ');
  };

  const playTestSound = (sound: string) => {
    // In a real implementation, this would play the actual sound
    if (import.meta.env.DEV) {
      console.log(`Playing test sound: ${sound}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-pip-display text-pip-text-bright flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alarms
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddAlarm(true)}
          className="pip-button-secondary text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Alarm
        </Button>
      </div>

      {/* Existing Alarms */}
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <Card key={alarm.id} className="bg-pip-bg-tertiary border-pip-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-mono font-bold text-pip-text-bright">
                      {formatAlarmTime(alarm.time)}
                    </span>
                    <Switch
                      checked={alarm.enabled}
                      onCheckedChange={() => toggleAlarm(alarm.id)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-pip-mono text-pip-text-secondary">
                      {alarm.label}
                    </div>
                    <div className="text-xs text-pip-text-secondary">
                      {formatAlarmDays(alarm.days)} • {soundOptions.find(s => s.value === alarm.sound)?.label}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playTestSound(alarm.sound)}
                    className="text-xs p-2 h-auto"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAlarm(alarm.id)}
                    className="text-xs p-2 h-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {alarms.length === 0 && !showAddAlarm && (
          <Card className="bg-pip-bg-tertiary border-pip-border border-dashed">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-pip-text-secondary mx-auto mb-4" />
              <div className="text-pip-text-secondary font-pip-mono">
                No alarms configured
              </div>
              <div className="text-xs text-pip-text-secondary mt-2">
                Click "Add Alarm" to create your first alarm
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add New Alarm Form */}
      {showAddAlarm && (
        <Card className="bg-pip-bg-tertiary border-pip-border">
          <CardHeader>
            <CardTitle className="text-pip-text-bright font-pip-display text-sm">
              New Alarm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Input */}
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Time</Label>
              <Input
                type="time"
                value={newAlarm.time}
                onChange={(e) => setNewAlarm(prev => ({ ...prev, time: e.target.value }))}
                className="pip-input"
              />
            </div>

            {/* Label Input */}
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Label</Label>
              <Input
                placeholder="Wake up, Morning coffee, etc."
                value={newAlarm.label}
                onChange={(e) => setNewAlarm(prev => ({ ...prev, label: e.target.value }))}
                className="pip-input"
              />
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Days</Label>
              <div className="flex flex-wrap gap-2">
                {dayLabels.map((day) => (
                  <Button
                    key={day.key}
                    variant={newAlarm.days.includes(day.key) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(day.key)}
                    className="text-xs pip-button-secondary"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sound Selection */}
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Sound</Label>
              <div className="flex gap-2">
                <Select
                  value={newAlarm.sound}
                  onValueChange={(value) => setNewAlarm(prev => ({ ...prev, sound: value }))}
                >
                  <SelectTrigger className="pip-input flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="pip-dialog">
                    {soundOptions.map((sound) => (
                      <SelectItem key={sound.value} value={sound.value}>
                        {sound.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playTestSound(newAlarm.sound)}
                  className="pip-button-secondary"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddAlarm(false)}
                className="flex-1 pip-button-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={addAlarm}
                disabled={!newAlarm.time || !newAlarm.label || newAlarm.days.length === 0}
                className="flex-1 pip-button-primary"
              >
                Add Alarm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
