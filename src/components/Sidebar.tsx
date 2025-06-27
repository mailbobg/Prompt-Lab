// version 1.0.0
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Hash, Archive, X, FileText, MessageSquare } from 'lucide-react';
import { UI_TEXT, DEFAULT_TAGS, STORAGE_KEYS } from '@/constants';
import { cn } from '@/lib/utils';

import { SearchBar } from './ui/search-bar';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Prompt } from '@/types';
import { storage } from '@/lib/utils';
import { InteractiveHoverButton } from './ui/interactive-hover-button';

interface SidebarProps {
  activeTab: 'prompts' | 'agents';
  onTabChange: (tab: 'prompts' | 'agents') => void;
  onNewPrompt?: (prompt: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  dataVersion?: number;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onNewPrompt,
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  dataVersion
}: SidebarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const [availableTags, setAvailableTags] = useState<Array<{tag: string, count: number}>>([]);

  // 动态获取所有可用标签并按使用频率排序
  useEffect(() => {
    const prompts = storage.get<Prompt[]>(STORAGE_KEYS.prompts, []);
    const tagCount: Record<string, number> = {};
    
    // 统计所有标签的使用频率
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // 将预设标签也加入，即使使用频率为0
    DEFAULT_TAGS.forEach(tag => {
      if (!tagCount[tag]) {
        tagCount[tag] = 0;
      }
    });

    // 转换为数组并按使用频率排序
    const sortedTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        // 先按使用频率排序，频率相同的按字母顺序
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.tag.localeCompare(b.tag);
      });

    setAvailableTags(sortedTags);
  }, [dataVersion]); // 监听dataVersion变化

  const toggleTag = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };



  return (
    <div className="sidebar">
      {/* Tab switcher */}
      <div className="px-4 pb-4 pt-6">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'prompts' | 'agents')}>
          <TabsList className="h-auto rounded-none border-b border-border bg-transparent p-0 w-full">
            <TabsTrigger
              value="prompts"
              className="relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary flex-1"
            >
              <FileText className="mb-1.5 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
              {UI_TEXT.nav.prompts}
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary flex-1"
            >
              <MessageSquare className="mb-1.5 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
              {UI_TEXT.nav.agents}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* New button - 只在prompts标签页显示 */}
      {activeTab === 'prompts' && (
        <div className="p-4 flex justify-center">
          <InteractiveHoverButton
            text={UI_TEXT.nav.newPrompt}
            className="w-full"
            onClick={onNewPrompt}
          />
        </div>
      )}

      {/* Search - 只在prompts标签页显示 */}
      {activeTab === 'prompts' && (
        <div className="p-4">
          <SearchBar
            placeholder="Search"
            value={searchQuery}
            onChange={(query) => onSearchChange(query)}
            onSearch={(query) => onSearchChange(query)}
          />
        </div>
      )}

      {/* Filters */}
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
                {/* Tag filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      {UI_TEXT.prompts.tags}
                    </h4>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={clearAllTags}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        清除全部
                      </button>
                    )}
                  </div>
                  
                  {/* 已选择的标签 */}
                  {selectedTags.length > 0 && (
                    <div className="mb-3 p-2 bg-muted/50 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">已选择：</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs hover:bg-primary/90 transition-colors"
                          >
                            {tag}
                            <X className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 可选择的标签 */}
                  <div className="flex flex-wrap gap-1">
                    {availableTags
                      .filter(({tag}) => !selectedTags.includes(tag))
                      .map(({ tag, count }) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors border',
                            count > 0 
                              ? 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80' 
                              : 'bg-muted text-muted-foreground border-muted hover:bg-muted/80'
                          )}
                        >
                          {tag}
                          {count > 0 && (
                            <span className="text-xs opacity-60">
                              {count}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                  
                  {availableTags.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      暂无可用标签
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent tools */}
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
              <h4 className="text-sm font-medium mb-2">Tool Selection</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="search" defaultChecked />
                  <label htmlFor="search">Search</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="generate" defaultChecked />
                  <label htmlFor="generate">Generate</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="analyze" defaultChecked />
                  <label htmlFor="analyze">Analyze</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 