'use client';

import { useState, useEffect } from 'react';
import { KeyRound, X, Globe, Info } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';
import { STORAGE_KEYS } from '@/constants';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useLocalStorage(STORAGE_KEYS.openAIKey, '');
  const [inputValue, setInputValue] = useState('');
  const { success } = useToast();

  useEffect(() => {
    if (isOpen) {
      setInputValue(apiKey);
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    setApiKey(inputValue);
    success('API Key Saved', 'Your API key has been securely stored locally.');
    onClose();
  };

  // Handle keyboard shortcuts for better paste support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enable Ctrl+V (Cmd+V on Mac) paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      return; // Let the default paste behavior work
    }
    // Enable Ctrl+A (Cmd+A on Mac) select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      return;
    }
  };

  // Handle click outside to close dialog
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackgroundClick}
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <div className="mt-6 space-y-4 text-left">
          <label htmlFor="api-key-input" className="font-semibold">
            API KEY
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="api-key-input"
              type="password"
              placeholder="sk-proj-..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-border bg-input py-2 pl-10 pr-4"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your API key should start with 'sk-proj-' followed by a series of characters and periods
          </p>
          <button
            onClick={handleSave}
            className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Save API Key
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <p>Your data is stored locally and never sent to our servers</p>
        </div>
      </div>
    </div>
  );
} 