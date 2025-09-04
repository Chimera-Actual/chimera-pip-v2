import { memo, useState, useEffect } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Radio,
  Music,
  Disc
} from 'lucide-react';

interface AudioPlayerWidgetProps {
  widget: BaseWidget;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  source: 'holotape' | 'radio' | 'ambient' | 'system';
  frequency?: string; // for radio tracks
}

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Welcome to Vault 111',
    artist: 'CHIMERA-TEC Industries',
    album: 'Orientation Package',
    duration: 180,
    source: 'holotape'
  },
  {
    id: '2',
    title: 'Galaxy News Radio',
    artist: 'Three Dog',
    duration: 0, // live radio
    source: 'radio',
    frequency: '101.1 FM'
  },
  {
    id: '3',
    title: 'Diamond City Radio',
    artist: 'Travis Miles',
    duration: 0, // live radio
    source: 'radio',
    frequency: '97.9 FM'
  },
  {
    id: '4',
    title: 'Ambient Vault Sounds',
    artist: 'Environmental Audio',
    duration: 3600, // 1 hour loop
    source: 'ambient'
  },
  {
    id: '5',
    title: 'Safety Briefing #1',
    artist: 'Overseer',
    album: 'Vault Protocols',
    duration: 240,
    source: 'holotape'
  },
  {
    id: '6',
    title: 'Emergency Broadcast System',
    artist: 'CHIMERA-TEC Emergency',
    duration: 300,
    source: 'system'
  },
  {
    id: '7',
    title: 'Classical Radio',
    artist: 'Various Artists',
    duration: 0,
    source: 'radio',
    frequency: '88.5 FM'
  }
];

const formatTime = (seconds: number): string => {
  if (seconds === 0) return 'LIVE';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'holotape': return <Disc className="h-4 w-4" />;
    case 'radio': return <Radio className="h-4 w-4" />;
    case 'ambient': return <Music className="h-4 w-4" />;
    case 'system': return <Volume2 className="h-4 w-4" />;
    default: return <Music className="h-4 w-4" />;
  }
};

const getSourceColor = (source: string) => {
  switch (source) {
    case 'holotape': return 'bg-pip-accent/20 text-pip-accent border-pip-accent/30';
    case 'radio': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'ambient': return 'bg-pip-primary/20 text-pip-primary border-pip-primary/30';
    case 'system': return 'bg-destructive/20 text-destructive border-destructive/30';
    default: return 'bg-pip-text-muted/20 text-pip-text-muted border-pip-text-muted/30';
  }
};

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = memo(({ widget }) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings
  );

  const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [playlist] = useState(mockTracks);

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying && currentTrack && currentTrack.duration > 0) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex > 0) {
      setCurrentTrack(playlist[currentIndex - 1]);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1]);
      setCurrentTime(0);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    if (currentTrack && currentTrack.duration > 0) {
      const newTime = Math.floor((value[0] / 100) * currentTrack.duration);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="text-center text-pip-text-muted font-pip-mono py-4">
        Loading audio player...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive font-pip-mono py-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Track Display */}
      {currentTrack && (
        <Card className="border-pip-border bg-pip-bg-secondary/50">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-pip-accent">
                {getSourceIcon(currentTrack.source)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-pip-text truncate font-mono">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-pip-text-secondary truncate">
                  {currentTrack.artist}
                </p>
                {currentTrack.album && (
                  <p className="text-xs text-pip-text-muted truncate">
                    {currentTrack.album}
                  </p>
                )}
                {currentTrack.frequency && (
                  <p className="text-xs text-pip-accent font-mono">
                    {currentTrack.frequency}
                  </p>
                )}
              </div>

              <Badge variant="outline" className={getSourceColor(currentTrack.source)}>
                {currentTrack.source.toUpperCase()}
              </Badge>
            </div>

            {/* Progress Bar */}
            {currentTrack.duration > 0 && (
              <div className="mt-3 space-y-2">
                <Slider
                  value={[currentTrack.duration > 0 ? (currentTime / currentTrack.duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                  disabled={currentTrack.duration === 0}
                />
                <div className="flex justify-between text-xs text-pip-text-muted font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsShuffled(!isShuffled)}
          className={`h-8 w-8 p-0 ${isShuffled ? 'text-pip-accent' : ''}`}
        >
          <Shuffle className="h-3 w-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          className="h-10 w-10 p-0"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRepeatMode(
            repeatMode === 'off' ? 'all' : 
            repeatMode === 'all' ? 'one' : 'off'
          )}
          className={`h-8 w-8 p-0 ${repeatMode !== 'off' ? 'text-pip-accent' : ''}`}
        >
          <Repeat className="h-3 w-3" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVolumeToggle}
          className="h-6 w-6 p-0"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={100}
          className="flex-1"
        />
        
        <span className="text-xs text-pip-text-muted font-mono w-8">
          {isMuted ? 0 : volume}%
        </span>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-pip-text-muted uppercase">Playlist</h5>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {playlist.map((track) => (
              <div
                key={track.id}
                className={`flex items-center gap-2 p-2 hover:bg-pip-bg-secondary/50 cursor-pointer rounded text-xs ${
                  currentTrack?.id === track.id ? 'bg-pip-bg-secondary text-pip-accent' : ''
                }`}
                onClick={() => playTrack(track)}
              >
                <div className="text-pip-text-muted">
                  {getSourceIcon(track.source)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-mono truncate">{track.title}</div>
                  <div className="text-pip-text-muted truncate">{track.artist}</div>
                </div>
                
                <div className="text-pip-text-muted font-mono">
                  {formatTime(track.duration)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

AudioPlayerWidget.displayName = 'AudioPlayerWidget';