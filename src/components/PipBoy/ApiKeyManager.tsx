import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Key, Trash2, Edit, Eye, EyeOff, TestTube, ExternalLink } from 'lucide-react';

interface ApiKey {
  id: string;
  service_name: string;
  key_name: string;
  api_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  key_metadata: Record<string, any>;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    keyName: '',
    apiUrl: '',
    apiKey: '',
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'list' },
      });

      if (error) throw error;
      setApiKeys(data.data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyName || !formData.apiKey) {
      toast({
        title: 'Error',
        description: 'Key name and API key are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const action = editingKey ? 'update' : 'create';
      const body = editingKey 
        ? { action, keyId: editingKey, ...formData }
        : { action, ...formData };

      const { data, error } = await supabase.functions.invoke('api-key-manager', { body });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `API key ${editingKey ? 'updated' : 'created'} successfully`,
      });

      setFormData({ keyName: '', apiUrl: '', apiKey: '' });
      setShowAddForm(false);
      setEditingKey(null);
      await loadApiKeys();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingKey ? 'update' : 'create'} API key`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'delete', keyId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });

      await loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (keyId: string, apiUrl: string) => {
    try {
      setTestingKey(keyId);
      
      // First get the actual API key
      const { data: keyData, error: keyError } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'get', keyId },
      });

      if (keyError) throw keyError;

      // Test the connection
      const { data: testResult, error: testError } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'test', apiUrl, apiKey: keyData.data.apiKey },
      });

      if (testError) throw testError;

      toast({
        title: testResult.valid ? 'Success' : 'Failed',
        description: testResult.valid 
          ? 'API key is working correctly' 
          : `Connection failed: ${testResult.error || 'Invalid credentials'}`,
        variant: testResult.valid ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to test API key',
        variant: 'destructive',
      });
    } finally {
      setTestingKey(null);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading API keys...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Securely manage your external service API keys
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add API Key
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingKey ? 'Edit API Key' : 'Add New API Key'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="keyName" className="text-foreground">Key Name</Label>
                <Input
                  id="keyName"
                  value={formData.keyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                  placeholder="e.g., Production API Key"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="apiUrl" className="text-foreground">API URL (Optional)</Label>
                <Input
                  id="apiUrl"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="apiKey" className="text-foreground">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingKey(null);
                    setFormData({ keyName: '', apiUrl: '', apiKey: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingKey ? 'Update' : 'Create'} API Key
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {apiKeys.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any API keys yet. Add one to get started.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{apiKey.key_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {apiKey.service_name}
                      </Badge>
                      <Badge variant={apiKey.is_active ? "default" : "destructive"} className="text-xs">
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span>URL:</span>
                        <a
                          href={apiKey.api_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {apiKey.api_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div>Created: {formatDate(apiKey.created_at)}</div>
                      {apiKey.last_used_at && (
                        <div>Last used: {formatDate(apiKey.last_used_at)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTest(apiKey.id, apiKey.api_url)}
                      disabled={testingKey === apiKey.id}
                      title="Test connection"
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{apiKey.key_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(apiKey.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}