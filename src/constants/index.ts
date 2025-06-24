// 应用常量配置
export const APP_CONFIG = {
  name: 'Prompt Stash',
  description: '本地优先的提示语存储和管理工具',
  version: '1.0.0',
} as const;

// UI 文本常量
export const UI_TEXT = {
  // 导航
  nav: {
    newPrompt: '新建提示语',
    toggleTheme: '切换主题',
    prompts: '提示语',
    agents: '代理',
  },
  // 提示语管理
  prompts: {
    title: '提示语',
    edit: '编辑',
    test: '测试',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    newPrompt: '新建提示语',
    searchPlaceholder: '搜索提示语...',
    noPrompts: '暂无提示语',
    promptTitle: '提示语标题',
    promptContent: '提示语内容',
    tags: '标签',
  },
  // 代理功能
  agents: {
    title: 'Prompt Agent',
    enableActions: '启用 AI Actions',
    newChat: '新建聊天',
    deleteChat: '删除聊天',
    sendMessage: '发送消息',
    messagePlaceholder: '输入消息...',
    filters: '过滤器',
  },
  // 通用
  common: {
    loading: '加载中...',
    error: '出错了',
    success: '成功',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    search: '搜索',
    all: '全部',
  },
} as const;

// 主题配置
export const THEME = {
  light: 'light',
  dark: 'dark',
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  prompts: 'prompt-stash-prompts',
  chats: 'prompt-stash-chats',
  theme: 'prompt-stash-theme',
  settings: 'prompt-stash-settings',
} as const;

// 提示语分类
export const PROMPT_CATEGORIES = [
  'coding',
  'writing',
  'analysis',
  'creative',
  'business',
  'education',
  'other',
] as const;

// 默认标签
export const DEFAULT_TAGS = [
  'AI',
  '编程',
  '写作',
  '分析',
  '创意',
  '商业',
  '教育',
  '翻译',
  '总结',
  '生成',
] as const;

// API配置
export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
} as const;

// 文件配置
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['text/plain', 'application/json'],
} as const; 