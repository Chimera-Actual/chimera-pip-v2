import React, { useState, useEffect, memo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon,
  Plus, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MissionCalendarWidgetProps {
  widget: BaseWidget;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'active' | 'completed' | 'failed';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  experience: number;
  category: 'main' | 'side' | 'daily' | 'weekly';
  progress?: number;
  maxProgress?: number;
}

const priorityColors = {
  low: 'text-pip-text-muted',
  medium: 'text-pip-accent-blue',
  high: 'text-pip-accent-amber',
  critical: 'text-pip-accent-red',
};

const statusColors = {
  pending: 'text-pip-text-muted',
  active: 'text-pip-accent-blue',
  completed: 'text-pip-accent-green',
  failed: 'text-pip-accent-red',
};

const categoryIcons = {
  main: Star,
  side: Target,
  daily: Clock,
  weekly: Calendar as any,
};

export const MissionCalendarWidget: React.FC<MissionCalendarWidgetProps> = memo(({ widget }) => {
  const { settings, isLoading } = useWidgetState(widget.id, widget.settings || {});
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Mission['status'] | 'all'>('all');
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    priority: 'medium' as Mission['priority'],
    category: 'side' as Mission['category'],
    dueDate: new Date(),
    experience: 50,
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = () => {
    // Mock missions data
    const mockMissions: Mission[] = [
      {
        id: '1',
        title: 'Repair Water Purifier',
        description: 'Fix the malfunctioning water purification system in Sector 7',
        priority: 'critical',
        status: 'active',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        createdAt: new Date(Date.now() - 3600000),
        experience: 150,
        category: 'main',
        progress: 2,
        maxProgress: 5,
      },
      {
        id: '2',
        title: 'Collect Daily Reports',
        description: 'Gather status reports from all department heads',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(),
        createdAt: new Date(Date.now() - 7200000),
        experience: 25,
        category: 'daily',
      },
      {
        id: '3',
        title: 'Security System Upgrade',
        description: 'Install new security protocols for vault entrance',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 172800000),
        completedAt: new Date(Date.now() - 43200000),
        experience: 200,
        category: 'main',
      },
      {
        id: '4',
        title: 'Inventory Management',
        description: 'Update and organize all supply inventories',
        priority: 'low',
        status: 'active',
        dueDate: new Date(Date.now() + 259200000), // 3 days
        createdAt: new Date(Date.now() - 86400000),
        experience: 75,
        category: 'weekly',
        progress: 1,
        maxProgress: 3,
      },
    ];

    setMissions(mockMissions);
  };

  const addMission = () => {
    const mission: Mission = {
      id: Date.now().toString(),
      title: newMission.title,
      description: newMission.description,
      priority: newMission.priority,
      status: 'pending',
      dueDate: newMission.dueDate,
      createdAt: new Date(),
      experience: newMission.experience,
      category: newMission.category,
    };

    setMissions([mission, ...missions]);
    setNewMission({
      title: '',
      description: '',
      priority: 'medium',
      category: 'side',
      dueDate: new Date(),
      experience: 50,
    });
    setShowAddForm(false);
    toast.success('Mission added to calendar');
  };

  const updateMissionStatus = (missionId: string, status: Mission['status']) => {
    setMissions(missions.map(mission => 
      mission.id === missionId 
        ? { 
            ...mission, 
            status,
            completedAt: status === 'completed' ? new Date() : undefined
          }
        : mission
    ));
    
    if (status === 'completed') {
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
        toast.success(`Mission completed! +${mission.experience} XP`);
      }
    }
  };

  const deleteMission = (missionId: string) => {
    setMissions(missions.filter(m => m.id !== missionId));
    toast.success('Mission deleted');
  };

  const filteredMissions = missions.filter(mission => 
    selectedStatus === 'all' || mission.status === selectedStatus
  );

  const todaysMissions = missions.filter(mission => {
    const today = new Date();
    const missionDate = new Date(mission.dueDate);
    return missionDate.toDateString() === today.toDateString();
  });

  const overdueMissions = missions.filter(mission => 
    mission.dueDate < new Date() && mission.status !== 'completed'
  );

  const completedToday = missions.filter(mission => {
    if (!mission.completedAt) return false;
    const today = new Date();
    const completedDate = new Date(mission.completedAt);
    return completedDate.toDateString() === today.toDateString();
  });

  if (isLoading) {
    return (
      <div className="text-center text-pip-text-muted font-pip-mono py-4">
        Loading missions...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="pip-special-stat p-2">
          <div className="text-lg font-bold text-pip-accent-blue">{todaysMissions.length}</div>
          <div className="text-xs text-pip-text-muted font-pip-mono">Today</div>
        </div>
        <div className="pip-special-stat p-2">
          <div className="text-lg font-bold text-pip-accent-amber">{missions.filter(m => m.status === 'active').length}</div>
          <div className="text-xs text-pip-text-muted font-pip-mono">Active</div>
        </div>
        <div className="pip-special-stat p-2">
          <div className="text-lg font-bold text-pip-accent-red">{overdueMissions.length}</div>
          <div className="text-xs text-pip-text-muted font-pip-mono">Overdue</div>
        </div>
        <div className="pip-special-stat p-2">
          <div className="text-lg font-bold text-pip-accent-green">{completedToday.length}</div>
          <div className="text-xs text-pip-text-muted font-pip-mono">Done</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-1" />
            New Mission
          </Button>
        </div>
        <div className="flex gap-1">
          {(['all', 'pending', 'active', 'completed'] as const).map(status => (
            <Badge
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              className="cursor-pointer capitalize font-pip-mono text-xs"
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Add Mission Form */}
      {showAddForm && (
        <Card className="pip-special-stat">
          <CardContent className="space-y-3 p-4">
            <h4 className="text-sm font-pip-mono font-semibold mb-3">Create New Mission</h4>
            <Input
              placeholder="Mission title"
              value={newMission.title}
              onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
              className="font-pip-mono"
            />
            <Textarea
              placeholder="Mission description"
              value={newMission.description}
              onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
              className="font-pip-mono"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-pip-text-muted font-pip-mono">Priority</label>
                <div className="flex gap-1 mt-1">
                  {(['low', 'medium', 'high', 'critical'] as const).map(priority => (
                    <Badge
                      key={priority}
                      variant={newMission.priority === priority ? "default" : "outline"}
                      className="cursor-pointer capitalize font-pip-mono text-xs"
                      onClick={() => setNewMission({ ...newMission, priority })}
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-pip-text-muted font-pip-mono">Category</label>
                <div className="flex gap-1 mt-1">
                  {(['main', 'side', 'daily', 'weekly'] as const).map(category => (
                    <Badge
                      key={category}
                      variant={newMission.category === category ? "default" : "outline"}
                      className="cursor-pointer capitalize font-pip-mono text-xs"
                      onClick={() => setNewMission({ ...newMission, category })}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-pip-text-muted font-pip-mono">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start font-pip-mono">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(newMission.dueDate, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMission.dueDate}
                      onSelect={(date) => date && setNewMission({ ...newMission, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs text-pip-text-muted font-pip-mono">Experience</label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={newMission.experience}
                  onChange={(e) => setNewMission({ ...newMission, experience: parseInt(e.target.value) || 50 })}
                  className="font-pip-mono"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addMission} disabled={!newMission.title}>
                Create Mission
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missions List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredMissions.length === 0 ? (
          <div className="text-center text-pip-text-muted font-pip-mono py-8">
            No missions found
          </div>
        ) : (
          filteredMissions.map(mission => {
            const IconComponent = categoryIcons[mission.category];
            const isOverdue = mission.dueDate < new Date() && mission.status !== 'completed';
            const hasProgress = mission.progress !== undefined;
            
            return (
              <Card key={mission.id} className={`pip-special-stat ${isOverdue ? 'border-pip-accent-red' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-pip-accent-green" />
                      <h4 className="text-sm font-pip-mono font-semibold">{mission.title}</h4>
                      <Badge variant="outline" className={`text-xs font-pip-mono ${priorityColors[mission.priority]}`}>
                        {mission.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs font-pip-mono ${statusColors[mission.status]}`}>
                        {mission.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {mission.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => updateMissionStatus(mission.id, 'active')}
                        >
                          <Flag className="h-3 w-3" />
                        </Button>
                      )}
                      {mission.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => updateMissionStatus(mission.id, 'completed')}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteMission(mission.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-pip-text-muted font-pip-mono mb-2">
                    {mission.description}
                  </p>
                  
                  {hasProgress && mission.status !== 'completed' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-pip-mono">
                        <span>Progress</span>
                        <span>{mission.progress}/{mission.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(mission.progress! / mission.maxProgress!) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-pip-mono">
                    <div className="flex items-center gap-2">
                      <span className={isOverdue ? 'text-pip-accent-red' : 'text-pip-text-muted'}>
                        Due: {format(mission.dueDate, 'MMM dd, yyyy')}
                      </span>
                      {isOverdue && <AlertCircle className="h-3 w-3 text-pip-accent-red" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-pip-accent-amber" />
                      <span>{mission.experience} XP</span>
                    </div>
                  </div>

                  {mission.completedAt && (
                    <div className="text-xs text-pip-accent-green font-pip-mono pt-1">
                      Completed: {format(mission.completedAt, 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
});

MissionCalendarWidget.displayName = 'MissionCalendarWidget';