# Prompt Stash Deployment Guide

## Project Overview

Prompt Stash is a local-first prompt storage and management tool built with Next.js 14 and Tailwind CSS.

## Features

✅ **Prompt Management**
- Create, edit, delete prompts
- 5-star rating system
- Tag categorization
- Local storage for data security

✅ **User Interface**
- Responsive design
- Dark/light theme toggle
- Modern UI components
- Adaptive layout

✅ **AI Integration**
- Smart prompt generation
- Agent chat functionality
- Tool selection configuration

## Tech Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: LocalStorage
- **Type Checking**: TypeScript

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start
```

## Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Automatic deployment complete

## Directory Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── AgentChat.tsx    # AI agent chat
│   ├── Header.tsx       # Page header
│   ├── PromptManager.tsx # Prompt management
│   ├── Sidebar.tsx      # Sidebar
│   └── ...
├── constants/           # Constants configuration
├── hooks/              # Custom hooks
├── lib/                # Utility functions
└── types/              # TypeScript types
```

## Usage Instructions

### Creating Prompts
1. Click the "+" button on the left
2. Fill in title, content, and tags
3. Click "Create Prompt" to save

### Editing Prompts
1. Click on a prompt in the list
2. Click the edit button
3. Modify content and save

### Star Rating
- Click the stars in the top-right corner to set rating
- Supports 1-5 star rating system

### AI Agent
- Switch to "Agents" tab
- Start AI conversation
- Configure tool selection

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License 