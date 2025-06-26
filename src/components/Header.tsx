'use client';

import { useState } from 'react';
import { Moon, Sun, Settings, Download, Upload } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ImportDialog } from './ImportDialog';
import { ExportDialog } from './ExportDialog';
import { APP_CONFIG, UI_TEXT } from '@/constants';
import { dataUtils } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { ImportOptions, ExportOptions } from '@/types';

interface HeaderProps {
  onSettings?: () => void;
  onDataChange?: () => void;
}

export function Header({ onSettings, onDataChange }: HeaderProps = {}) {
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleExportData = () => {
    setShowExportDialog(true);
  };

  const handleConfirmExport = (options: ExportOptions) => {
    try {
      dataUtils.exportSelectiveData(options);
      success(UI_TEXT.importExport.exportSuccess);
    } catch (err) {
      error(UI_TEXT.importExport.exportError);
      console.error('Export error:', err);
    }
  };

  const handleImportData = () => {
    setShowImportDialog(true);
  };

  const handleConfirmImport = async (options: ImportOptions) => {
    try {
      const importSuccess = await dataUtils.importSelectiveData(options);
      if (importSuccess) {
        success(UI_TEXT.importExport.importSuccess);
        // Notify parent component that data has changed
        onDataChange?.();
        // Reload the page to reflect changes
        window.location.reload();
      }
    } catch (err) {
      error(UI_TEXT.importExport.importError + ': ' + (err as Error).message);
      console.error('Import error:', err);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="Prompt Stash Icon" 
              className="w-6 h-6"
            />
            <h1 className="text-sm font-bold">{APP_CONFIG.name}</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {APP_CONFIG.description}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <button
            onClick={handleImportData}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title={UI_TEXT.importExport.import}
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExportData}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title={UI_TEXT.importExport.export}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onSettings}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title={UI_TEXT.nav.toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleConfirmExport}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onConfirm={handleConfirmImport}
      />
    </>
  );
} 