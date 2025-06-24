// 基础类型
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 提示语类型
export interface Prompt extends BaseEntity {
  title: string;
  content: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  usage: number;
  rating: number; // 1-5星评级
}

// 聊天相关类型
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
  timestamp: string;
}

// 代理设置
export interface AgentSettings {
  enableActions: boolean;
  tools: string[];
  temperature: number;
  maxTokens: number;
}

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  autoSave: boolean;
  agentSettings: AgentSettings;
}

// 过滤器类型
export interface FilterOptions {
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

// 组件Props类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 表单相关类型
export interface PromptFormData {
  title: string;
  content: string;
  tags: string[];
  category: string;
}

export interface ChatFormData {
  title: string;
  promptId?: string;
}

// 导入导出类型
export interface ExportData {
  prompts: Prompt[];
  chats: Chat[];
  settings: AppSettings;
  exportedAt: string;
  version: string;
} 