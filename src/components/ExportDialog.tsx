'use client';

import { useState } from 'react';
import { X, Download, Database, MessageSquare, Settings } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import type { ExportOptions } from '@/types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
}

export function ExportDialog({ isOpen, onClose, onConfirm }: ExportDialogProps) {
  const [exportPrompts, setExportPrompts] = useState(true);
  const [exportChats, setExportChats] = useState(true);
  const [exportSettings, setExportSettings] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      exportPrompts,
      exportChats,
      exportSettings,
    });
    onClose();
  };

  const resetToDefaults = () => {
    setExportPrompts(true);
    setExportChats(true);
    setExportSettings(true);
  };

  const selectAll = () => {
    setExportPrompts(true);
    setExportChats(true);
    setExportSettings(true);
  };

  const selectNone = () => {
    setExportPrompts(false);
    setExportChats(false);
    setExportSettings(false);
  };

  const getFilenameSuffix = () => {
    const selected = [];
    if (exportPrompts) selected.push('Prompts');
    if (exportChats) selected.push('Chats');
    if (exportSettings) selected.push('Settings');
    
    if (selected.length === 3) return 'All Data';
    if (selected.length === 0) return 'No Data';
    return selected.join(' + ');
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
            <Download className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">{UI_TEXT.importExport.selectiveExport}</h2>
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
          {/* Quick Actions */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            >
              {UI_TEXT.importExport.selectAll}
            </button>
            <button
              onClick={selectNone}
              className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
            >
              {UI_TEXT.importExport.selectNone}
            </button>
            <button
              onClick={resetToDefaults}
              className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
            >
              {UI_TEXT.importExport.resetDefaults}
            </button>
          </div>

          {/* Data Types */}
          <div>
            <label className="text-sm font-medium mb-3 block">{UI_TEXT.importExport.dataTypes}</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-accent/50 border border-transparent hover:border-border">
                <input
                  type="checkbox"
                  checked={exportPrompts}
                  onChange={(e) => setExportPrompts(e.target.checked)}
                  className="text-blue-600"
                />
                <Database className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Prompts</div>
                  <div className="text-xs text-muted-foreground">
                    All prompt data: titles, content, tags, categories, usage statistics
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-accent/50 border border-transparent hover:border-border">
                <input
                  type="checkbox"
                  checked={exportChats}
                  onChange={(e) => setExportChats(e.target.checked)}
                  className="text-blue-600"
                />
                <MessageSquare className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Chat History</div>
                  <div className="text-xs text-muted-foreground">
                    All conversation history: messages, timestamps, associated prompts
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md hover:bg-accent/50 border border-transparent hover:border-border">
                <input
                  type="checkbox"
                  checked={exportSettings}
                  onChange={(e) => setExportSettings(e.target.checked)}
                  className="text-blue-600"
                />
                <Settings className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">App Settings</div>
                  <div className="text-xs text-muted-foreground">
                    Theme, language, auto-save and other preferences
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="text-sm font-medium mb-1">{UI_TEXT.importExport.exportPreview}</div>
            <div className="text-xs text-muted-foreground">
              {UI_TEXT.importExport.filename}: <span className="font-mono">prompt-stash-{getFilenameSuffix().toLowerCase().replace(/\s+/g, '-')}-YYYY-MM-DD.json</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {UI_TEXT.importExport.dataContent}: {getFilenameSuffix()}
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium">{UI_TEXT.importExport.securityNote}</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {UI_TEXT.importExport.apiKeyNotExported}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm bg-muted border border-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors"
            >
              {UI_TEXT.importExport.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!exportPrompts && !exportChats && !exportSettings}
              className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {UI_TEXT.importExport.startExport}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 