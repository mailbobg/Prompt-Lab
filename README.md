# Prompt Stash

A local-first prompt storage and management tool, inspired by Anthropic Prompt Eval tool.

## Features

- 🏠 **Local-First**: All data stored locally, protecting privacy
- 📝 **Prompt Management**: Create, edit, organize and search prompts
- 🏷️ **Tag System**: Categorize and filter prompts using tags
- 🤖 **Agent Chat**: Built-in AI agent functionality with multiple tools
- 🌙 **Theme Toggle**: Support for light and dark themes
- 📱 **Responsive Design**: Adapts to various screen sizes
- 🔍 **Powerful Search**: Quick search and filtering capabilities
- 📂 **Category Management**: Organize prompts by categories
- ⭐ **Favorites**: Mark frequently used prompts
- 📊 **Usage Statistics**: Track prompt usage frequency

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage
- **Theme**: System theme detection support

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

### 3. Open Browser

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── AgentChat.tsx      # Agent chat component
│   ├── Header.tsx         # Header navigation
│   ├── PromptManager.tsx  # Prompt management
│   ├── Sidebar.tsx        # Sidebar
│   └── ThemeProvider.tsx  # Theme provider
├── constants/             # Constants configuration
│   └── index.ts          # Application constants
├── lib/                   # Utility functions
│   └── utils.ts          # Common utilities
└── types/                 # TypeScript types
    └── index.ts          # Type definitions
\`\`\`

## Main Features

### Prompt Management

- Create and edit prompts
- Add tags and categories
- Search and filter functionality
- Favorites and archiving
- Usage statistics

### Agent Chat

- Create multiple chat sessions
- Enable/disable AI Actions
- Tool selection configuration
- Message history

### Theme System

- Automatic system theme detection
- Manual light/dark theme toggle
- Theme state persistence

### Data Management

- Local storage of all data
- Data import/export support
- Auto-save functionality

## Development Commands

\`\`\`bash
# Development mode
npm run dev

# Build production version
npm run build

# Start production server
npm start

# Code linting
npm run lint
\`\`\`

## Custom Configuration

All hardcoded text and configuration are stored in \`src/constants/index.ts\` for easy maintenance and internationalization.

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 