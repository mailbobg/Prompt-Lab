// version 1.0.0
// Application configuration constants
export const APP_CONFIG = {
  name: 'Prompt Stash',
  description: 'Local-first prompt storage and management tool',
  version: '1.0.0',
} as const;

// UI text constants
export const UI_TEXT = {
  // Navigation
  nav: {
    newPrompt: 'New Prompt',
    toggleTheme: 'Toggle Theme',
    prompts: 'Prompts',
    agents: 'Agents',
  },
  // Prompt management
  prompts: {
    title: 'Prompts',
    edit: 'Edit',
    test: 'Test',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    newPrompt: 'New Prompt',
    searchPlaceholder: 'Search prompts...',
    noPrompts: 'No prompts yet',
    promptTitle: 'Prompt Title',
    promptContent: 'Prompt Content',
    tags: 'Tags',
  },
  // Agent functionality
  agents: {
    title: 'Prompt Agent',
    enableActions: 'Enable AI Actions',
    newChat: 'New Chat',
    deleteChat: 'Delete Chat',
    sendMessage: 'Send Message',
    messagePlaceholder: 'Type a message...',
    filters: 'Filters',
  },
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    all: 'All',
  },
} as const;

// Theme configuration
export const THEME = {
  light: 'light',
  dark: 'dark',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  prompts: 'prompt-stash-prompts',
  chats: 'prompt-stash-chats',
  theme: 'prompt-stash-theme',
  settings: 'prompt-stash-settings',
} as const;

// Prompt categories
export const PROMPT_CATEGORIES = [
  'coding',
  'writing',
  'analysis',
  'creative',
  'business',
  'education',
  'other',
] as const;

// Default tags
export const DEFAULT_TAGS = [
  'AI',
  'Programming',
  'Writing',
  'Analysis',
  'Creative',
  'Business',
  'Education',
  'Translation',
  'Summary',
  'Generation',
] as const;

// API configuration
export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
} as const;

// File configuration
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['text/plain', 'application/json'],
} as const; 