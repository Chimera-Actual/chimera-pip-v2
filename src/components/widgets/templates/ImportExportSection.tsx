import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Download, 
  Upload, 
  Copy, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ImportExportSectionProps {
  onExport: () => string;
  onImport: (settingsJson: string) => boolean;
  onClose: () => void;
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({
  onExport,
  onImport,
  onClose
}) => {
  const { toast } = useToast();
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  const handleExport = () => {
    try {
      const exported = onExport();
      setExportText(exported);
      
      // Parse to validate and format nicely
      const parsed = JSON.parse(exported);
      const formatted = JSON.stringify(parsed, null, 2);
      setExportText(formatted);
      
      toast({
        title: "Settings exported successfully",
        description: "Your widget settings have been exported to JSON format.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: "No data to import",
        description: "Please paste your exported settings JSON first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate JSON format
      JSON.parse(importText);
      
      const success = onImport(importText);
      if (success) {
        toast({
          title: "Settings imported successfully",
          description: "Your widget settings have been restored from the backup.",
        });
        onClose();
      } else {
        toast({
          title: "Import failed",
          description: "The settings format is not compatible with this widget.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Invalid JSON format",
        description: "Please check that you've pasted valid JSON data.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Settings have been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File downloaded",
        description: `Settings saved as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download file. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border border-pip-border/30 rounded-lg bg-pip-bg-secondary/20 p-1 mb-6">
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-pip-mono transition-all",
            activeTab === 'export'
              ? "bg-primary/20 text-primary border border-primary/30 pip-text-glow"
              : "text-pip-text-muted hover:text-primary hover:bg-primary/5"
          )}
          onClick={() => setActiveTab('export')}
        >
          <Download className="h-4 w-4" />
          Export Settings
        </button>
        
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-pip-mono transition-all",
            activeTab === 'import'
              ? "bg-primary/20 text-primary border border-primary/30 pip-text-glow"
              : "text-pip-text-muted hover:text-primary hover:bg-primary/5"
          )}
          onClick={() => setActiveTab('import')}
        >
          <Upload className="h-4 w-4" />
          Import Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'export' ? (
          <div className="h-full flex flex-col">
            {/* Export Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
                  Export Settings
                </h3>
              </div>
              <p className="text-xs text-pip-text-muted font-pip-mono leading-relaxed">
                Export your current widget settings to JSON format. You can save this as a backup 
                or share it with others.
              </p>
            </div>

            {/* Export Actions */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleExport}
                variant="outline"
                className="font-pip-mono text-xs"
              >
                <Download className="h-3 w-3 mr-2" />
                Generate Export
              </Button>
            </div>

            {/* Export Content */}
            {exportText && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-pip-mono text-pip-text-muted">
                    Exported Settings JSON
                  </Label>
                  <Badge variant="secondary" className="text-xs font-pip-mono">
                    {exportText.length} characters
                  </Badge>
                </div>
                
                <Textarea
                  value={exportText}
                  readOnly
                  className="flex-1 bg-pip-bg-secondary/50 border-pip-border font-mono text-xs resize-none pip-scrollbar"
                />
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => copyToClipboard(exportText)}
                    variant="outline"
                    size="sm"
                    className="font-pip-mono text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  
                  <Button
                    onClick={() => downloadAsFile(exportText, 'widget-settings.json')}
                    variant="outline"
                    size="sm"
                    className="font-pip-mono text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Import Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
                  Import Settings
                </h3>
              </div>
              <p className="text-xs text-pip-text-muted font-pip-mono leading-relaxed">
                Paste exported settings JSON to restore your widget configuration. 
                This will replace your current settings.
              </p>
              
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-600 font-pip-mono">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span>This will overwrite your current settings. Consider exporting first as a backup.</span>
              </div>
            </div>

            {/* Import Content */}
            <div className="flex-1 flex flex-col">
              <Label className="text-xs font-pip-mono text-pip-text-muted mb-2">
                Paste Settings JSON
              </Label>
              
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your exported settings JSON here..."
                className="flex-1 bg-pip-bg-secondary/50 border-pip-border font-mono text-xs resize-none pip-scrollbar"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {importText.trim() && (
                    <Badge 
                      variant={(() => {
                        try {
                          JSON.parse(importText);
                          return "secondary";
                        } catch {
                          return "destructive";
                        }
                      })()} 
                      className="text-xs font-pip-mono"
                    >
                      {(() => {
                        try {
                          JSON.parse(importText);
                          return <><CheckCircle className="h-3 w-3 mr-1" />Valid JSON</>;
                        } catch {
                          return <><AlertTriangle className="h-3 w-3 mr-1" />Invalid JSON</>;
                        }
                      })()}
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="font-pip-mono text-xs"
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Import Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};