# Prompt Stash

一个本地优先的提示语存储和管理工具，受到 Anthropic Prompt Eval 工具启发。

## 功能特性

- 🏠 **本地优先**: 所有数据存储在本地，保护隐私
- 📝 **提示语管理**: 创建、编辑、组织和搜索提示语
- 🏷️ **标签系统**: 使用标签对提示语进行分类和过滤
- 🤖 **Agent 对话**: 内置 AI 代理功能，支持多种工具
- 🌙 **主题切换**: 支持亮色和暗色主题
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🔍 **强大搜索**: 快速搜索和过滤功能
- 📂 **分类管理**: 按类别组织提示语
- ⭐ **收藏功能**: 标记常用提示语
- 📊 **使用统计**: 跟踪提示语使用频率

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **存储**: LocalStorage
- **主题**: 支持系统主题检测

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 3. 打开浏览器

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── AgentChat.tsx      # 代理聊天组件
│   ├── Header.tsx         # 头部导航
│   ├── PromptManager.tsx  # 提示语管理
│   ├── Sidebar.tsx        # 侧边栏
│   └── ThemeProvider.tsx  # 主题提供者
├── constants/             # 常量配置
│   └── index.ts          # 应用常量
├── lib/                   # 工具函数
│   └── utils.ts          # 通用工具
└── types/                 # TypeScript 类型
    └── index.ts          # 类型定义
\`\`\`

## 主要功能

### 提示语管理

- 创建和编辑提示语
- 添加标签和分类
- 搜索和过滤功能
- 收藏和归档
- 使用统计

### Agent 对话

- 创建多个聊天会话
- 启用/禁用 AI Actions
- 工具选择配置
- 消息历史记录

### 主题系统

- 自动检测系统主题
- 手动切换亮色/暗色主题
- 主题状态持久化

### 数据管理

- 本地存储所有数据
- 支持数据导入导出
- 自动保存功能

## 开发命令

\`\`\`bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
\`\`\`

## 自定义配置

所有硬编码的文本和配置都存储在 \`src/constants/index.ts\` 中，便于维护和国际化。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 