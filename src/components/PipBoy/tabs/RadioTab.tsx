import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Radio, Play, Pause, SkipForward, SkipBack, Volume2, Headphones, Tv, Mic } from 'lucide-react';

const radioStations = [
  { name: 'Diamond City Radio', frequency: '101.3', status: 'strong', genre: 'Classic' },
  { name: 'Classical Radio', frequency: '105.7', status: 'weak', genre: 'Orchestral' },
  { name: 'Raider Radio', frequency: '98.2', status: 'strong', genre: 'Rock' },
  { name: 'Galaxy News Radio', frequency: '94.1', status: 'medium', genre: 'News' },
];

const currentTrack = {
  title: 'I Don\'t Want to Set the World on Fire',
  artist: 'The Ink Spots',
  album: 'Fallout Classics Vol. 1',
  duration: 183,
  currentTime: 67
};

const audioLibrary = [
  { name: 'Audio Logs', count: 23, type: 'logs' },
  { name: 'Music Collection', count: 156, type: 'music' },
  { name: 'Podcasts', count: 47, type: 'podcasts' },
  { name: 'Voice Memos', count: 12, type: 'memos' },
];

export const RadioTab: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStation, setCurrentStation] = useState('Diamond City Radio');
  const [volume, setVolume] = useState(75);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTrack.currentTime / currentTrack.duration) * 100;

  return (
    <div className="space-y-6">
      {/* Audio Control Tower */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Radio className="h-5 w-5" />
            <span>Audio Control Tower</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Now Playing */}
          <div className="text-center space-y-2">
            <div className="font-pip-display font-bold text-primary pip-text-glow text-lg">
              {currentTrack.title}
            </div>
            <div className="text-pip-text-secondary font-pip-mono">
              {currentTrack.artist} • {currentTrack.album}
            </div>
            <div className="text-xs text-pip-text-muted font-pip-mono">
              Now playing on {currentStation}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-pip-bg-secondary" />
            <div className="flex justify-between text-xs font-pip-mono text-pip-text-muted">
              <span>{formatTime(currentTrack.currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button size="sm" variant="ghost" className="text-pip-text-secondary hover:text-primary">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="default" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="pip-button-glow"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button size="sm" variant="ghost" className="text-pip-text-secondary hover:text-primary">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Volume2 className="h-4 w-4 text-pip-text-secondary" />
            <Progress value={volume} className="flex-1 h-2" />
            <span className="text-xs font-pip-mono text-pip-text-muted w-8">{volume}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Radio Stations */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Radio className="h-5 w-5" />
            <span>Broadcast Receiver</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {radioStations.map((station) => (
              <div 
                key={station.name} 
                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                  currentStation === station.name 
                    ? 'border-primary bg-primary/10' 
                    : 'border-pip-border bg-pip-bg-secondary/50 hover:border-primary/40'
                }`}
                onClick={() => setCurrentStation(station.name)}
              >
                <div>
                  <div className={`font-pip-display font-semibold ${
                    currentStation === station.name ? 'text-primary' : 'text-pip-text-bright'
                  }`}>
                    {station.name}
                  </div>
                  <div className="text-xs text-pip-text-muted font-pip-mono">
                    {station.frequency} FM • {station.genre}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    station.status === 'strong' ? 'bg-pip-green-primary animate-pulse' :
                    station.status === 'medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <Badge variant="secondary" className="text-xs font-pip-mono">
                    {station.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audio Library */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Headphones className="h-5 w-5" />
            <span>Audio Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {audioLibrary.map((category) => (
              <div key={category.name} className="pip-special-stat p-4 rounded cursor-pointer hover:border-primary/60 transition-colors text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 mx-auto">
                    {category.type === 'music' && <Headphones className="h-5 w-5 text-primary" />}
                    {category.type === 'logs' && <Mic className="h-5 w-5 text-primary" />}
                    {category.type === 'podcasts' && <Radio className="h-5 w-5 text-primary" />}
                    {category.type === 'memos' && <Mic className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <div className="font-pip-display font-semibold text-pip-text-bright text-sm">{category.name}</div>
                    <div className="text-xs text-pip-text-muted font-pip-mono">{category.count} items</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entertainment Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
              <Tv className="h-5 w-5" />
              <span>Video Terminal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="aspect-video bg-pip-bg-secondary/50 border border-pip-border rounded flex items-center justify-center">
                <div className="text-center">
                  <Tv className="h-12 w-12 text-pip-text-muted mx-auto mb-2" />
                  <div className="text-sm font-pip-mono text-pip-text-muted">No Active Stream</div>
                </div>
              </div>
              <Button variant="outline" className="w-full font-pip-display">
                CONNECT STREAM
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
              <Mic className="h-5 w-5" />
              <span>Voice Synthesizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-pip-display font-semibold text-primary">CODSWORTH</div>
                <div className="text-xs text-pip-text-muted font-pip-mono">Current Voice Profile</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="font-pip-mono text-xs">BUTLER</Button>
                <Button variant="outline" size="sm" className="font-pip-mono text-xs">MILITARY</Button>
                <Button variant="outline" size="sm" className="font-pip-mono text-xs">FEMALE</Button>
                <Button variant="outline" size="sm" className="font-pip-mono text-xs">ROBOTIC</Button>
              </div>
              <Button variant="default" className="w-full font-pip-display">
                TEST VOICE
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};