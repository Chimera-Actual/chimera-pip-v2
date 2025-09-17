import React, { memo } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { APP_REGISTRY, getAppsByCategory } from '@/config/appRegistry';
import { getIconComponent } from '@/utils/iconMapping';
import { AppCategory } from '@/types/appManagement';

interface AppSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApp: (appId: string, settings?: any) => void;
  activeTab: string;
}

const CATEGORY_LABELS: Record<AppCategory, string> = {
  utility: 'Utility',
  data: 'Data & Information',
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  system: 'System'
};

export const AppSelectorModal = memo<AppSelectorModalProps>(({
  isOpen,
  onClose,
  onAddApp,
  activeTab
}) => {
  const handleAddApp = (appId: string) => {
    onAddApp(appId, {});
    onClose();
  };

  const categories: AppCategory[] = ['system', 'utility', 'data', 'productivity', 'entertainment'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-pip-bg-primary border-pip-border">
        <DialogHeader className="border-b border-pip-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-pip-text-bright">
              Add App to {activeTab}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-pip-text-muted hover:text-pip-text-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {categories.map((category) => {
              const categoryApps = getAppsByCategory(category);
              if (categoryApps.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-pip-text-secondary uppercase tracking-wide">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryApps.map((app) => {
                      const IconComponent = getIconComponent(app.icon);
                      
                      return (
                        <Card
                          key={app.id}
                          className="bg-pip-bg-secondary border-pip-border hover:border-pip-border-bright cursor-pointer transition-all hover:bg-pip-bg-tertiary group"
                          onClick={() => handleAddApp(app.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-5 w-5 text-pip-green-primary" />
                              <CardTitle className="text-sm text-pip-text-primary group-hover:text-pip-text-bright">
                                {app.name}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-pip-text-muted mb-3">
                              {app.description}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-pip-green-primary/10 border-pip-green-primary/30 text-pip-green-primary"
                            >
                              {CATEGORY_LABELS[app.category]}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});