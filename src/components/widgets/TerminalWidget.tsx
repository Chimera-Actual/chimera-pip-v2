import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Terminal, User } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const TerminalWidget: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { trackWidgetAction } = useAnalytics();
  const { user } = useAuth();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  useEffect(() => {
    // Welcome message
    addLine('output', 'CHIMERA-TEC Terminal v2.1.0');
    addLine('output', 'Type "help" for available commands.');
    addLine('output', '');
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    
    addLine('command', `> ${command}`);
    trackWidgetAction('terminal', 'command_executed', { command: trimmedCommand });

    switch (trimmedCommand) {
      case 'help':
        addLine('output', 'Available commands:');
        addLine('output', '  help     - Show this help message');
        addLine('output', '  clear    - Clear the terminal');
        addLine('output', '  whoami   - Display current user');
        addLine('output', '  date     - Show current date and time');
        addLine('output', '  status   - Show system status');
        addLine('output', '  ls       - List available widgets');
        addLine('output', '  vault    - Show vault information');
        break;

      case 'clear':
        setLines([]);
        return;

      case 'whoami':
        addLine('output', user?.email || 'Dweller');
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'status':
        addLine('output', 'CHIMERA-TEC PIP-Boy Status:');
        addLine('output', '  Power: 100%');
        addLine('output', '  Connection: ONLINE');
        addLine('output', '  Radiation: 0.0 RAD');
        addLine('output', '  Status: OPERATIONAL');
        break;

      case 'ls':
        addLine('output', 'Available widgets:');
        addLine('output', '  character-profile    Special Stats       System Monitor');
        addLine('output', '  weather-station      Achievement Gallery File Explorer');
        addLine('output', '  secure-vault         News Terminal       Audio Player');
        addLine('output', '  calendar-mission     AI Oracle           Cryptocurrency');
        break;

      case 'vault':
        const profile = user as any; // Type assertion for vault_number
        addLine('output', `Vault-Tec Information:`);
        addLine('output', `  Vault Number: ${profile?.vault_number || 'Unknown'}`);
        addLine('output', `  Dweller Status: Active`);
        addLine('output', `  Security Clearance: Level 1`);
        break;

      case '':
        // Empty command, just add new line
        break;

      default:
        addLine('error', `Command not found: ${trimmedCommand}`);
        addLine('output', 'Type "help" for available commands.');
        break;
    }

    addLine('output', '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      setCommandHistory(prev => [...prev, currentCommand]);
      setHistoryIndex(-1);
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (newIndex === commandHistory.length - 1 && historyIndex === newIndex) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-primary font-bold';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="h-full bg-background/95 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Terminal className="w-5 h-5" />
          Terminal
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        <div
          ref={terminalRef}
          className="flex-1 bg-black/90 rounded-lg p-4 font-mono text-sm overflow-y-auto max-h-64 border border-primary/20"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line) => (
            <div key={line.id} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center text-primary">
            <User className="w-4 h-4 mr-2" />
            <span>dweller@pip-boy:~$</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono text-sm">{'>'}</span>
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="font-mono bg-background/50 border-primary/20 focus:border-primary"
              autoFocus
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};