'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Hash, Archive } from 'lucide-react';
import { UI_TEXT, DEFAULT_TAGS, PROMPT_CATEGORIES } from '@/constants';
import { cn } from '@/lib/utils';
import { NewPromptDialog } from './NewPromptDialog';

interface SidebarProps {
  activeTab: 'prompts' | 'agents';
  onTabChange: (tab: 'prompts' | 'agents') => void;
  onNewPrompt?: (prompt: any) => void;
}

export function Sidebar({ activeTab, onTabChange, onNewPrompt }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleNewPrompt = (promptData: any) => {
    if (onNewPrompt) {
      onNewPrompt(promptData);
    }
    setShowNewPromptDialog(false);
  };

  return (
    <div className="sidebar">
      {/* 标题和标签切换 */}
      <div className="p-4 border-b border-border">
        <div className="flex space-x-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => onTabChange('prompts')}
            className={cn(
              'flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors',
              activeTab === 'prompts'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {UI_TEXT.nav.prompts}
          </button>
          <button
            onClick={() => onTabChange('agents')}
            className={cn(
              'flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors',
              activeTab === 'agents'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {UI_TEXT.nav.agents}
          </button>
        </div>
      </div>

      {/* 新建按钮 */}
      <div className="p-4 border-b border-border flex justify-center">
        <button 
          onClick={() => setShowNewPromptDialog(true)}
          className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 搜索 */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={UI_TEXT.prompts.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* 过滤器 */}
      {activeTab === 'prompts' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
            >
              <Filter className="w-4 h-4" />
              {UI_TEXT.agents.filters}
            </button>

            {showFilters && (
              <div className="space-y-4">
                {/* 分类过滤 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">分类</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        'w-full text-left text-sm px-2 py-1 rounded transition-colors',
                        selectedCategory === 'all'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {UI_TEXT.common.all}
                    </button>
                    {PROMPT_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          'w-full text-left text-sm px-2 py-1 rounded transition-colors',
                          selectedCategory === category
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 标签过滤 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {UI_TEXT.prompts.tags}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          'tag text-xs transition-colors',
                          selectedTags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary/80'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent工具 */}
      {activeTab === 'agents' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{UI_TEXT.agents.enableActions}</span>
              <button className="w-10 h-6 bg-primary rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
              </button>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">工具选择</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="search" defaultChecked />
                  <label htmlFor="search">搜索</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="generate" defaultChecked />
                  <label htmlFor="generate">生成</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="analyze" defaultChecked />
                  <label htmlFor="analyze">分析</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新建提示词弹窗 */}
      <NewPromptDialog
        isOpen={showNewPromptDialog}
        onClose={() => setShowNewPromptDialog(false)}
        onSave={handleNewPrompt}
      />
    </div>
  );
} 