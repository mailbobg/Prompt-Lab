// version 1.0.0
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