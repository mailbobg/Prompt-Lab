import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { STORAGE_KEYS } from '@/constants';
import type { Prompt, Chat, AppSettings } from '@/types';

// CSS class name merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Local storage utility
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Prompt related utilities
export const promptUtils = {
  search: (prompts: Prompt[], query: string): Prompt[] => {
    if (!query.trim()) return prompts;
    const lowerQuery = query.toLowerCase();
    return prompts.filter(
      p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
  
  filterByCategory: (prompts: Prompt[], category: string): Prompt[] => {
    if (category === 'all') return prompts;
    return prompts.filter(p => p.category === category);
  },
  
  filterByTags: (prompts: Prompt[], tags: string[]): Prompt[] => {
    if (tags.length === 0) return prompts;
    return prompts.filter(p => 
      tags.some(tag => p.tags.includes(tag))
    );
  },
  
  sortByUsage: (prompts: Prompt[]): Prompt[] => {
    return [...prompts].sort((a, b) => b.usage - a.usage);
  },
  
  sortByDate: (prompts: Prompt[]): Prompt[] => {
    return [...prompts].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
};

// File import/export utilities
export const fileUtils = {
  downloadJson: (data: any, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importJson: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  },
};

// Data backup and restore utilities
export const dataUtils = {
  exportSelectiveData: (options: {
    exportPrompts: boolean;
    exportChats: boolean;
    exportSettings: boolean;
  }): void => {
    try {
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        appName: 'PROMPT STASH',
      };

      // Export prompts if selected
      if (options.exportPrompts) {
        exportData.prompts = storage.get<Prompt[]>(STORAGE_KEYS.prompts, []);
      }

      // Export chats if selected
      if (options.exportChats) {
        exportData.chats = storage.get<Chat[]>(STORAGE_KEYS.chats, []);
      }

      // Export settings if selected
      if (options.exportSettings) {
        exportData.settings = storage.get<AppSettings>(STORAGE_KEYS.settings, {
          theme: 'light',
          language: 'en',
          autoSave: true,
          agentSettings: {
            enableActions: false,
            tools: [],
            temperature: 0.7,
            maxTokens: 1000,
          },
        });
      }

      // Generate filename based on selected data types
      const timestamp = new Date().toISOString().split('T')[0];
      const dataTypes = [];
      if (options.exportPrompts) dataTypes.push('prompts');
      if (options.exportChats) dataTypes.push('chats');
      if (options.exportSettings) dataTypes.push('settings');
      
      const typesSuffix = dataTypes.length === 3 ? 'all' : dataTypes.join('-');
      const filename = `prompt-stash-${typesSuffix}-${timestamp}.json`;
      
      fileUtils.downloadJson(exportData, filename);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  },

  exportAllData: (): void => {
    dataUtils.exportSelectiveData({
      exportPrompts: true,
      exportChats: true,
      exportSettings: true,
    });
  },

  importSelectiveData: async (options: {
    importPrompts: boolean;
    importChats: boolean;
    importSettings: boolean;
    mode: 'replace' | 'merge';
  }): Promise<boolean> => {
    try {
      const data = await fileUtils.importJson();
      
      // Validate imported data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      const { prompts, chats, settings } = data;

      // Backup current data before import
      const backupData = {
        prompts: storage.get<Prompt[]>(STORAGE_KEYS.prompts, []),
        chats: storage.get<Chat[]>(STORAGE_KEYS.chats, []),
        settings: storage.get<AppSettings>(STORAGE_KEYS.settings, {
          theme: 'light',
          language: 'en',
          autoSave: true,
          agentSettings: {
            enableActions: false,
            tools: [],
            temperature: 0.7,
            maxTokens: 1000,
          },
        }),
      };
      
      const backupTimestamp = new Date().toISOString();
      storage.set(`backup-${backupTimestamp}`, backupData);

      // Import prompts
      if (options.importPrompts && Array.isArray(prompts)) {
        if (options.mode === 'replace') {
          storage.set(STORAGE_KEYS.prompts, prompts);
        } else {
          // Merge mode
          const existingPrompts = storage.get<Prompt[]>(STORAGE_KEYS.prompts, []);
          const mergedPrompts = [...existingPrompts];
          
          prompts.forEach((newPrompt: Prompt) => {
            const existingIndex = mergedPrompts.findIndex(p => p.id === newPrompt.id);
            if (existingIndex >= 0) {
              // Update existing prompt
              mergedPrompts[existingIndex] = newPrompt;
            } else {
              // Add new prompt
              mergedPrompts.push(newPrompt);
            }
          });
          
          storage.set(STORAGE_KEYS.prompts, mergedPrompts);
        }
      }

      // Import chats
      if (options.importChats && Array.isArray(chats)) {
        if (options.mode === 'replace') {
          storage.set(STORAGE_KEYS.chats, chats);
        } else {
          // Merge mode
          const existingChats = storage.get<Chat[]>(STORAGE_KEYS.chats, []);
          const mergedChats = [...existingChats];
          
          chats.forEach((newChat: Chat) => {
            const existingIndex = mergedChats.findIndex(c => c.id === newChat.id);
            if (existingIndex >= 0) {
              // Update existing chat
              mergedChats[existingIndex] = newChat;
            } else {
              // Add new chat
              mergedChats.push(newChat);
            }
          });
          
          storage.set(STORAGE_KEYS.chats, mergedChats);
        }
      }

      // Import settings
      if (options.importSettings && settings) {
        if (options.mode === 'replace') {
          storage.set(STORAGE_KEYS.settings, settings);
        } else {
          // Merge mode - merge settings with existing ones
          const existingSettings = storage.get<AppSettings>(STORAGE_KEYS.settings, {
            theme: 'light',
            language: 'en',
            autoSave: true,
            agentSettings: {
              enableActions: false,
              tools: [],
              temperature: 0.7,
              maxTokens: 1000,
            },
          });
          
          const mergedSettings = {
            ...existingSettings,
            ...settings,
            agentSettings: {
              ...existingSettings.agentSettings,
              ...settings.agentSettings,
            },
          };
          
          storage.set(STORAGE_KEYS.settings, mergedSettings);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  },

  clearAllData: (): void => {
    try {
      storage.remove(STORAGE_KEYS.prompts);
      storage.remove(STORAGE_KEYS.chats);
      storage.remove(STORAGE_KEYS.settings);
      storage.remove(STORAGE_KEYS.openAIKey);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Failed to clear data');
    }
  },
};

// Clipboard utilities
export const clipboardUtils = {
  copy: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },
  
  paste: async (): Promise<string> => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return '';
    }
  },
};

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
} 