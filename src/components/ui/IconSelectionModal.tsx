import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import { Search, X } from 'lucide-react';
import { iconMapping, iconCategories, type IconName } from '@/utils/iconMapping';

interface IconSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
  title?: string;
}

export const IconSelectionModal: React.FC<IconSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
  title = "Select Icon"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIcons = useMemo(() => {
    let icons = Object.entries(iconMapping);
    
    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryIcons = iconCategories[selectedCategory] || [];
      icons = icons.filter(([name]) => categoryIcons.includes(name as IconName));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter(([name]) => 
        name.toLowerCase().includes(query) ||
        name.toLowerCase().replace(/icon$/, '').includes(query)
      );
    }
    
    return icons;
  }, [searchQuery, selectedCategory]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-pip-bg-primary border-pip-border pip-glow">
        <DialogHeader className="border-b border-pip-border pb-4">
          <DialogTitle className="text-pip-green-primary font-pip-mono uppercase tracking-wide">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-secondary" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-pip-bg-secondary border-pip-border text-pip-text-primary placeholder-pip-text-secondary font-pip-mono"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pip-text-secondary hover:text-pip-green-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedCategory === 'all'
                  ? 'bg-pip-green-primary text-pip-bg-primary border-pip-green-primary'
                  : 'border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              All ({Object.keys(iconMapping).length})
            </Badge>
            {Object.entries(iconCategories).map(([category, icons]) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={`cursor-pointer transition-all capitalize ${
                  selectedCategory === category
                    ? 'bg-pip-green-primary text-pip-bg-primary border-pip-green-primary'
                    : 'border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({icons.length})
              </Badge>
            ))}
          </div>

          {/* Icons Grid */}
          <ScrollArea className="h-96 pr-4">
            <div className="grid grid-cols-12 gap-2">
              {filteredIcons.map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  type="button"
                  className={`aspect-square flex items-center justify-center p-2 rounded border transition-all pip-button-glow ${
                    selectedIcon === iconName
                      ? 'border-pip-green-primary bg-pip-green-primary/20 text-pip-green-primary pip-glow'
                      : 'border-pip-border bg-pip-bg-tertiary/40 text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary'
                  }`}
                  onClick={() => handleSelect(iconName)}
                  title={iconName.replace(/Icon$/, '').replace(/([A-Z])/g, ' $1').trim()}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-pip-text-secondary">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-pip-mono">No icons found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-pip-border">
            <p className="text-sm text-pip-text-secondary font-pip-mono">
              {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};