# Prompt Stash 部署指南

## 项目简介

Prompt Stash 是一个本地优先的提示语存储和管理工具，使用 Next.js 14 和 Tailwind CSS 构建。

## 功能特性

✅ **提示语管理**
- 创建、编辑、删除提示语
- 5星评级系统
- 标签分类管理
- 本地存储，数据安全

✅ **用户界面**
- 响应式设计
- 深色/浅色主题切换
- 现代化UI组件
- 自适应布局

✅ **AI集成**
- 智能提示语生成
- 代理聊天功能
- 工具选择配置

## 技术栈

- **前端框架**: Next.js 14
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks
- **存储**: LocalStorage
- **类型检查**: TypeScript

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署完成

## 目录结构

```
src/
├── app/                 # Next.js App Router
├── components/          # React 组件
│   ├── AgentChat.tsx    # AI代理聊天
│   ├── Header.tsx       # 页面头部
│   ├── PromptManager.tsx # 提示语管理
│   ├── Sidebar.tsx      # 侧边栏
│   └── ...
├── constants/           # 常量配置
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数
└── types/              # TypeScript类型
```

## 使用说明

### 创建提示语
1. 点击左侧的 "+" 按钮
2. 填写标题、内容和标签
3. 点击 "Create Prompt" 保存

### 编辑提示语
1. 点击列表中的提示语
2. 点击编辑按钮
3. 修改内容后保存

### 星级评分
- 点击提示语右上角的星星设置评级
- 支持1-5星评分系统

### AI代理
- 切换到 "代理" 标签
- 开始AI对话
- 配置工具选择

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 