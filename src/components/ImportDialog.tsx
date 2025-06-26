'use client';

import { useState } from 'react';
import { X, FileUp, Database, MessageSquare, Settings } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import type { ImportOptions } from '@/types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ImportOptions) => void;
}

export function ImportDialog({ isOpen, onClose, onConfirm }: ImportDialogProps) {
  const [importPrompts, setImportPrompts] = useState(true);
  const [importChats, setImportChats] = useState(true);
  const [importSettings, setImportSettings] = useState(true);
  const [mode, setMode] = useState<'replace' | 'merge'>('merge');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      importPrompts,
      importChats,
      importSettings,
      mode,
    });
    onClose();
  };

  const resetToDefaults = () => {
    setImportPrompts(true);
    setImportChats(true);
    setImportSettings(true);
    setMode('merge');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{UI_TEXT.importExport.selectiveImport}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Import Mode */}
          <div>
            <label className="text-sm font-medium mb-2 block">{UI_TEXT.importExport.importMode}</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={(e) => setMode(e.target.value as 'merge')}
                  className="text-blue-600"
                />
                <span className="text-sm">
                  <strong>{UI_TEXT.importExport.mergeMode}</strong> - Keep existing data, add new data
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={(e) => setMode(e.target.value as 'replace')}
                  className="text-blue-600"
                />
                <span className="text-sm">
                  <strong>{UI_TEXT.importExport.replaceMode}</strong> - Clear existing data, import new data
                </span>
              </label>
            </div>
          </div>

          {/* Data Types */}
          <div>
            <label className="text-sm font-medium mb-2 block">{UI_TEXT.importExport.dataTypes}</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-accent/50">
                <input
                  type="checkbox"
                  checked={importPrompts}
                  onChange={(e) => setImportPrompts(e.target.checked)}
                  className="text-blue-600"
                />
                <Database className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Prompts</div>
                  <div className="text-xs text-muted-foreground">All prompt data</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-accent/50">
                <input
                  type="checkbox"
                  checked={importChats}
                  onChange={(e) => setImportChats(e.target.checked)}
                  className="text-blue-600"
                />
                <MessageSquare className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Chat History</div>
                  <div className="text-xs text-muted-foreground">All conversation history</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-accent/50">
                <input
                  type="checkbox"
                  checked={importSettings}
                  onChange={(e) => setImportSettings(e.target.checked)}
                  className="text-blue-600"
                />
                <Settings className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">App Settings</div>
                  <div className="text-xs text-muted-foreground">Theme, language and other preferences</div>
                </div>
              </label>
            </div>
          </div>

          {/* Warning */}
          {mode === 'replace' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-medium">Warning</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                {UI_TEXT.importExport.replaceWarning} {UI_TEXT.importExport.currentDataBackup}
              </p>
            </div>
          )}

          {/* Security Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium">{UI_TEXT.importExport.securityNote}</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {UI_TEXT.importExport.apiKeyNotImported}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={resetToDefaults}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {UI_TEXT.importExport.resetDefaults}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm bg-muted border border-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors"
            >
              {UI_TEXT.importExport.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!importPrompts && !importChats && !importSettings}
              className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {UI_TEXT.importExport.startImport}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 