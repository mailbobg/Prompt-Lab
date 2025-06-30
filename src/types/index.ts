// Basic types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Prompt types
export interface Prompt extends BaseEntity {
  title: string;
  content: string;
  sample?: string;
  comments?: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  usage: number;
  rating: number; // 1-5 star rating
}

// Chat related types
export interface Chat extends BaseEntity {
  title: string;
  messages: Message[];
  promptId?: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string; // For DeepSeek Reasoner model
  timestamp: string;
}

// Agent settings
export interface AgentSettings {
  enableActions: boolean;
  tools: string[];
  temperature: number;
  maxTokens: number;
}

// Application settings
export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  autoSave: boolean;
  agentSettings: AgentSettings;
}

// Filter types
export interface FilterOptions {
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

// Component Props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form related types
export interface PromptFormData {
  title: string;
  content: string;
  sample?: string;
  comments?: string;
  tags: string[];
  category: string;
}

export interface ChatFormData {
  title: string;
  promptId?: string;
}

// Import/export types
export interface ExportData {
  prompts: Prompt[];
  chats: Chat[];
  settings: AppSettings;
  exportedAt: string;
  version: string;
  appName: string;
}

export interface ImportOptions {
  importPrompts: boolean;
  importChats: boolean;
  importSettings: boolean;
  mode: 'replace' | 'merge';
}

export interface ExportOptions {
  exportPrompts: boolean;
  exportChats: boolean;
  exportSettings: boolean;
} 