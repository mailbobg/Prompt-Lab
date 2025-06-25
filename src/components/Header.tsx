'use client';

import { Moon, Sun, Settings, Download, Upload } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { APP_CONFIG, UI_TEXT } from '@/constants';

interface HeaderProps {
  onSettings?: () => void;
}

export function Header({ onSettings }: HeaderProps = {}) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">{APP_CONFIG.name}</h1>
        <span className="text-sm text-muted-foreground">
          {APP_CONFIG.description}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Import/Export */}
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Import data"
        >
          <Upload className="w-4 h-4" />
        </button>
        
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Export data"
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
  );
} 