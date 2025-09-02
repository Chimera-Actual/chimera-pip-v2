import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderOpen, Lock, Bookmark, FileText, Image, Download } from 'lucide-react';

const inventoryItems = [
  { name: 'Secure Documents', type: 'encrypted', count: 23, icon: Lock },
  { name: 'Project Files', type: 'folder', count: 156, icon: FolderOpen },
  { name: 'Bookmarks', type: 'bookmark', count: 47, icon: Bookmark },
  { name: 'Media Library', type: 'media', count: 892, icon: Image },
  { name: 'Downloads', type: 'download', count: 34, icon: Download },
];

const recentFiles = [
  { name: 'Quarterly_Report_2287.pdf', size: '2.4 MB', modified: '2 hours ago', type: 'pdf' },
  { name: 'Project_Phoenix_Specs.docx', size: '1.8 MB', modified: '5 hours ago', type: 'doc' },
  { name: 'Wasteland_Map_Survey.jpg', size: '4.2 MB', modified: '1 day ago', type: 'image' },
  { name: 'Audio_Log_Entry_47.mp3', size: '12.1 MB', modified: '2 days ago', type: 'audio' },
];

export const InvTab = memo(() => {
  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <FolderOpen className="h-5 w-5" />
            <span>Digital Inventory</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="pip-special-stat p-4 rounded cursor-pointer hover:border-primary/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-pip-display font-semibold text-pip-text-bright">{item.name}</div>
                      <div className="text-xs text-pip-text-muted font-pip-mono">{item.count} items</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <FileText className="h-5 w-5" />
            <span>Recent Files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded border border-pip-border bg-pip-bg-secondary/50 hover:border-primary/40 transition-colors">
                <div className="flex-1">
                  <div className="font-pip-mono text-pip-text-bright">{file.name}</div>
                  <div className="text-xs text-pip-text-muted font-pip-mono">
                    {file.size} • Modified {file.modified}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs font-pip-mono">
                    {file.type.toUpperCase()}
                  </Badge>
                  <Button size="sm" variant="ghost" className="text-pip-text-secondary hover:text-primary">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="text-pip-text-bright font-pip-display">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-pip-display font-bold text-primary pip-text-glow">47.2 GB</div>
                <div className="text-sm text-pip-text-muted font-pip-mono">of 100 GB used</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-pip-mono">
                  <span className="text-pip-text-muted">Documents</span>
                  <span className="text-primary">12.4 GB</span>
                </div>
                <div className="flex justify-between text-sm font-pip-mono">
                  <span className="text-pip-text-muted">Media</span>
                  <span className="text-primary">28.7 GB</span>
                </div>
                <div className="flex justify-between text-sm font-pip-mono">
                  <span className="text-pip-text-muted">Other</span>
                  <span className="text-primary">6.1 GB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="text-pip-text-bright font-pip-display">Secure Vault</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <Lock className="h-12 w-12 text-primary mx-auto mb-2 pip-text-glow" />
                <div className="text-lg font-pip-display font-semibold text-pip-text-bright">23 Items</div>
                <div className="text-sm text-pip-text-muted font-pip-mono">Encrypted & Secured</div>
              </div>
              <Button className="w-full font-pip-display" variant="default">
                ACCESS VAULT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});