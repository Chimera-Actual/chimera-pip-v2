import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Tag, Edit2, Trash2 } from 'lucide-react';
import { useWidgetTags, WidgetTag } from '@/hooks/useWidgetTags';

interface TagManagerProps {
  selectedTagIds: string[];
  onTagSelectionChange: (tagIds: string[]) => void;
  allowCreate?: boolean;
  allowEdit?: boolean;
}

export const TagManager: React.FC<TagManagerProps> = ({
  selectedTagIds,
  onTagSelectionChange,
  allowCreate = true,
  allowEdit = false
}) => {
  const { tags, createTag, updateTag, deleteTag, isLoading } = useWidgetTags();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<WidgetTag | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    color: 'hsl(var(--pip-green-primary))',
    icon: ''
  });

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) return;

    const created = await createTag(newTag);
    if (created) {
      setNewTag({ name: '', description: '', color: 'hsl(var(--pip-green-primary))', icon: '' });
      setShowCreateForm(false);
      // Auto-select the newly created tag
      onTagSelectionChange([...selectedTagIds, created.id]);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !newTag.name.trim()) return;

    const success = await updateTag(editingTag.id, {
      name: newTag.name,
      description: newTag.description,
      color: newTag.color,
      icon: newTag.icon
    });

    if (success) {
      setEditingTag(null);
      setNewTag({ name: '', description: '', color: 'hsl(var(--pip-green-primary))', icon: '' });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId);
    // Remove from selection if it was selected
    onTagSelectionChange(selectedTagIds.filter(id => id !== tagId));
  };

  const toggleTagSelection = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagSelectionChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagSelectionChange([...selectedTagIds, tagId]);
    }
  };

  const startEditing = (tag: WidgetTag) => {
    setEditingTag(tag);
    setNewTag({
      name: tag.name,
      description: tag.description || '',
      color: tag.color,
      icon: tag.icon || ''
    });
    setShowCreateForm(false);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setShowCreateForm(false);
    setNewTag({ name: '', description: '', color: 'hsl(var(--pip-green-primary))', icon: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-pip-text-secondary font-pip-mono text-xs">Widget Tags</Label>
        {allowCreate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowCreateForm(true);
              setEditingTag(null);
            }}
            className="h-8 px-2 text-pip-text-secondary hover:text-pip-text-bright"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        )}
      </div>

      {/* Tag Selection */}
      <ScrollArea className="h-32 border border-pip-border rounded-lg p-3 bg-pip-bg-tertiary">
        {isLoading ? (
          <div className="text-pip-text-secondary font-pip-mono text-xs text-center py-4">
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="text-pip-text-secondary font-pip-mono text-xs text-center py-4">
            No tags available. Create your first tag!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              const canEdit = allowEdit && tag.user_id; // Only allow editing user-created tags
              
              return (
                <div key={tag.id} className="relative group">
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all text-xs ${
                      isSelected 
                        ? 'bg-primary/20 text-primary border-primary/30' 
                        : 'border-pip-border hover:border-primary/50'
                    }`}
                    style={{ 
                      borderColor: isSelected ? tag.color : undefined,
                      color: isSelected ? tag.color : undefined 
                    }}
                    onClick={() => toggleTagSelection(tag.id)}
                  >
                    {tag.icon && <span className="mr-1">{tag.icon}</span>}
                    <Tag className="w-2 h-2 mr-1" />
                    {tag.name}
                  </Badge>
                  
                  {canEdit && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(tag);
                          }}
                          className="h-4 w-4 p-0 text-pip-text-secondary hover:text-pip-text-bright"
                        >
                          <Edit2 className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTag(tag.id);
                          }}
                          className="h-4 w-4 p-0 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Create/Edit Tag Form */}
      {(showCreateForm || editingTag) && (
        <Card className="bg-pip-bg-secondary border-pip-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-pip-text-bright font-pip-display text-sm">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Tag Name</Label>
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter tag name..."
                className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-pip-text-secondary font-pip-mono text-xs">Description (Optional)</Label>
              <Textarea
                value={newTag.description}
                onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tag description..."
                rows={2}
                className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-pip-text-secondary font-pip-mono text-xs">Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border border-pip-border bg-pip-bg-tertiary cursor-pointer"
                  />
                  <Input
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary text-xs"
                    placeholder="hsl(var(--pip-green-primary))"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-pip-text-secondary font-pip-mono text-xs">Icon (Optional)</Label>
                <Input
                  value={newTag.icon}
                  onChange={(e) => setNewTag(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏷️"
                  className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                className="font-pip-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={editingTag ? handleUpdateTag : handleCreateTag}
                disabled={!newTag.name.trim()}
                className="font-pip-mono text-xs"
              >
                {editingTag ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};