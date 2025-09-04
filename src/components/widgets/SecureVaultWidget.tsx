import React, { useState, useEffect, memo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { WidgetContainer } from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  Key,
  CreditCard,
  FileText,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface SecureVaultWidgetProps {
  widget: BaseWidget;
}

interface VaultEntry {
  id: string;
  type: 'password' | 'note' | 'card' | 'key';
  title: string;
  data: {
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    apiKey?: string;
  };
  createdAt: Date;
  lastAccessed: Date;
}

const entryIcons = {
  password: Key,
  note: FileText,
  card: CreditCard,
  key: Shield,
};

export const SecureVaultWidget: React.FC<SecureVaultWidgetProps> = memo(({ widget }) => {
  const { settings, collapsed, setCollapsed, isLoading } = useWidgetState(widget.id, widget.settings);
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: 'password' as VaultEntry['type'],
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  // Auto-lock timer
  useEffect(() => {
    if (!isLocked) {
      const timer = setTimeout(() => {
        setIsLocked(true);
        setVisiblePasswords(new Set());
        toast.info('Vault auto-locked for security');
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  const unlock = () => {
    // In a real implementation, this would verify against a hashed master password
    if (masterPassword === 'vault123' || masterPassword.length >= 8) {
      setIsLocked(false);
      setMasterPassword('');
      loadEntries();
      toast.success('Vault unlocked');
    } else {
      toast.error('Invalid master password');
    }
  };

  const lock = () => {
    setIsLocked(true);
    setVisiblePasswords(new Set());
    toast.info('Vault locked');
  };

  const loadEntries = () => {
    // Mock data - in real implementation, this would decrypt from secure storage
    const mockEntries: VaultEntry[] = [
      {
        id: '1',
        type: 'password',
        title: 'RobCo Terminal',
        data: {
          username: 'vault_dweller',
          password: 'password123',
          url: 'https://robco.example.com',
          notes: 'Main terminal access'
        },
        createdAt: new Date(Date.now() - 86400000),
        lastAccessed: new Date(),
      },
      {
        id: '2',
        type: 'note',
        title: 'Nuclear Codes',
        data: {
          notes: 'Launch codes: Alpha-7-7-9-9\nExpires: Never\nAuthorization: Overseer Level'
        },
        createdAt: new Date(Date.now() - 172800000),
        lastAccessed: new Date(Date.now() - 3600000),
      },
      {
        id: '3',
        type: 'key',
        title: 'CHIMERA-TEC API',
        data: {
          apiKey: 'vt_sk_live_51H8Z2K2zBqEa...',
          notes: 'Production API key for vault systems'
        },
        createdAt: new Date(Date.now() - 604800000),
        lastAccessed: new Date(Date.now() - 7200000),
      },
    ];
    
    setEntries(mockEntries);
  };

  const addEntry = () => {
    const entry: VaultEntry = {
      id: Date.now().toString(),
      type: newEntry.type,
      title: newEntry.title,
      data: {
        username: newEntry.username,
        password: newEntry.password,
        url: newEntry.url,
        notes: newEntry.notes,
      },
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    setEntries([entry, ...entries]);
    setNewEntry({ type: 'password', title: '', username: '', password: '', url: '', notes: '' });
    setShowAddForm(false);
    toast.success('Entry added to vault');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success('Entry deleted from vault');
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const togglePasswordVisibility = (entryId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(entryId)) {
      newVisible.delete(entryId);
    } else {
      newVisible.add(entryId);
    }
    setVisiblePasswords(newVisible);
  };

  if (isLocked) {
    return (
      <WidgetContainer
        title="Secure Vault"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className="pip-widget"
        widgetId={widget.id}
        widgetType={widget.type}
      >
        {!collapsed && (
          <div className="text-center space-y-4 py-8">
            <Lock className="h-12 w-12 text-pip-accent-amber mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-pip-mono text-pip-text">Vault Locked</h3>
              <p className="text-sm text-pip-text-muted font-pip-mono">
                Enter your master password to access your secure data
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Master Password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && unlock()}
                className="font-pip-mono"
              />
              <Button onClick={unlock} className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
            </div>
            <p className="text-xs text-pip-text-muted font-pip-mono">
              Demo: Use 'vault123' or any 8+ character password
            </p>
          </div>
        )}
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      title="Secure Vault"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      className="pip-widget"
      widgetId={widget.id}
      widgetType={widget.type}
    >
      {!collapsed && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={lock}>
              <Lock className="h-4 w-4 mr-1" />
              Lock
            </Button>
          </div>

          {/* Add Entry Form */}
          {showAddForm && (
            <Card className="pip-special-stat">
              <CardHeader>
                <CardTitle className="text-sm font-pip-mono">Add New Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {(['password', 'note', 'card', 'key'] as const).map(type => (
                    <Badge
                      key={type}
                      variant={newEntry.type === type ? "default" : "outline"}
                      className="cursor-pointer capitalize font-pip-mono"
                      onClick={() => setNewEntry({ ...newEntry, type })}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Entry title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="font-pip-mono"
                />
                {newEntry.type === 'password' && (
                  <>
                    <Input
                      placeholder="Username"
                      value={newEntry.username}
                      onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                      className="font-pip-mono"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newEntry.password}
                      onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                      className="font-pip-mono"
                    />
                    <Input
                      placeholder="URL (optional)"
                      value={newEntry.url}
                      onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                      className="font-pip-mono"
                    />
                  </>
                )}
                <Textarea
                  placeholder="Notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="font-pip-mono"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addEntry} disabled={!newEntry.title}>
                    Add Entry
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="text-center text-pip-text-muted font-pip-mono py-8">
                No entries in vault
              </div>
            ) : (
              entries.map(entry => {
                const IconComponent = entryIcons[entry.type];
                const isPasswordVisible = visiblePasswords.has(entry.id);
                
                return (
                  <Card key={entry.id} className="pip-special-stat">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-pip-accent-green" />
                          <CardTitle className="text-sm font-pip-mono">{entry.title}</CardTitle>
                          <Badge variant="outline" className="text-xs font-pip-mono capitalize">
                            {entry.type}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {entry.data.username && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-pip-text-muted font-pip-mono">Username:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-pip-mono">{entry.data.username}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(entry.data.username!, `${entry.id}-username`)}
                            >
                              {copiedField === `${entry.id}-username` ? 
                                <Check className="h-3 w-3 text-pip-accent-green" /> : 
                                <Copy className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {entry.data.password && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-pip-text-muted font-pip-mono">Password:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-pip-mono">
                              {isPasswordVisible ? entry.data.password : '••••••••'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={() => togglePasswordVisibility(entry.id)}
                            >
                              {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(entry.data.password!, `${entry.id}-password`)}
                            >
                              {copiedField === `${entry.id}-password` ? 
                                <Check className="h-3 w-3 text-pip-accent-green" /> : 
                                <Copy className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}

                      {entry.data.apiKey && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-pip-text-muted font-pip-mono">API Key:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-pip-mono">
                              {entry.data.apiKey.substring(0, 16)}...
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(entry.data.apiKey!, `${entry.id}-apikey`)}
                            >
                              {copiedField === `${entry.id}-apikey` ? 
                                <Check className="h-3 w-3 text-pip-accent-green" /> : 
                                <Copy className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      )}

                      {entry.data.notes && (
                        <div className="mt-2 p-2 bg-pip-bg-secondary rounded border border-pip-border">
                          <p className="text-xs text-pip-text-muted font-pip-mono whitespace-pre-wrap">
                            {entry.data.notes}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-pip-text-muted font-pip-mono pt-1">
                        Last accessed: {entry.lastAccessed.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </WidgetContainer>
  );
});

SecureVaultWidget.displayName = 'SecureVaultWidget';