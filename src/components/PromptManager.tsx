'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit, Trash2, Copy, Star, Archive, Play } from 'lucide-react';
import { UI_TEXT, STORAGE_KEYS } from '@/constants';
import { Prompt } from '@/types';
import { cn, formatDate, generateId, storage } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface PromptManagerProps {
  searchQuery?: string;
  selectedTags?: string[];
  onToast?: {
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
  };
  onTestPrompt?: (content: string) => void;
}

export const PromptManager = forwardRef<any, PromptManagerProps>(function PromptManager(props, ref) {
  const { searchQuery = '', selectedTags = [], onToast, onTestPrompt } = props;
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    sample: '',
    tags: [] as string[],
    category: 'other',
  });

  const localToast = useToast();
  const { success, error } = onToast || localToast;

  // Load data from local storage
  useEffect(() => {
    const storedPrompts = storage.get<Prompt[]>(STORAGE_KEYS.prompts, []);
    
    // If no stored data exists, use default sample data
    if (storedPrompts.length === 0) {
      const defaultPrompts: Prompt[] = [
        {
          id: generateId(),
          title: 'Code Optimization Prompt',
          content: 'Please help me optimize the following code to make it more efficient and readable:\n\n[Paste your code here]',
          sample: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n\n// 优化后:\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n  return memo[n];\n}',
          tags: ['Programming', 'Optimization'],
          category: 'coding',
          isFavorite: true,
          isArchived: false,
          usage: 15,
          rating: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          title: 'Article Summary',
          content: 'Please write a concise summary of the following article, including main points and conclusions:\n\n[Paste article content here]',
          sample: '文章：《人工智能对教育的影响》\n\n摘要：本文探讨了人工智能技术在教育领域的应用和影响。主要观点包括：1. AI可以提供个性化学习体验；2. 智能辅导系统能够实时反馈学习进度；3. 需要关注数据隐私和教育公平问题。结论是AI将革命性地改变教育方式，但需要谨慎推进以确保技术服务于教育目标。',
          tags: ['Summary', 'Writing'],
          category: 'writing',
          isFavorite: false,
          isArchived: false,
          usage: 8,
          rating: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setPrompts(defaultPrompts);
      storage.set(STORAGE_KEYS.prompts, defaultPrompts);
    } else {
      setPrompts(storedPrompts);
    }
  }, []);

  // Save to local storage
  const savePrompts = (newPrompts: Prompt[]) => {
    setPrompts(newPrompts);
    storage.set(STORAGE_KEYS.prompts, newPrompts);
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditForm({
      title: prompt.title,
      content: prompt.content,
      sample: prompt.sample || '',
      tags: prompt.tags,
      category: prompt.category,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedPrompt) return;
    
    const updatedPrompt: Prompt = {
      ...selectedPrompt,
      ...editForm,
      updatedAt: new Date().toISOString(),
    };

    const newPrompts = prompts.map(p => 
      p.id === selectedPrompt.id ? updatedPrompt : p
    );
    
    savePrompts(newPrompts);
    setSelectedPrompt(updatedPrompt);
    setIsEditing(false);
    success('Saved successfully', 'Prompt has been updated');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 不要清空 selectedPrompt，保持当前选中的提示符以显示其内容
    setEditForm({ title: '', content: '', sample: '', tags: [], category: 'other' });
  };

  const handleDelete = (id: string) => {
    const newPrompts = prompts.filter(p => p.id !== id);
    savePrompts(newPrompts);
    
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null);
      setIsEditing(false);
    }
    
    success('Deleted successfully', 'Prompt has been deleted');
  };

  const toggleFavorite = (id: string) => {
    const newPrompts = prompts.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    savePrompts(newPrompts);
    
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({ ...selectedPrompt, isFavorite: !selectedPrompt.isFavorite });
    }
  };

  const setRating = (id: string, rating: number) => {
    const newPrompts = prompts.map(p =>
      p.id === id ? { ...p, rating, updatedAt: new Date().toISOString() } : p
    );
    savePrompts(newPrompts);
    
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({ ...selectedPrompt, rating });
    }
  };

  const copyPrompt = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      success('Copied successfully', 'Prompt content has been copied to clipboard');
    } catch (err) {
      error('Copy failed', 'Unable to access clipboard');
    }
  };

  const copyPromptWithSample = async (prompt: Prompt) => {
    try {
      let contentToCopy = prompt.content;
      
      // 如果有sample内容，则将其添加到复制内容中
      if (prompt.sample && prompt.sample.trim()) {
        contentToCopy = `${prompt.content}\n\n${prompt.sample}`;
      }
      
      await navigator.clipboard.writeText(contentToCopy);
      success('Copied', '', 1000);
    } catch (err) {
      error('Copy failed', 'Unable to access clipboard');
    }
  };

  const incrementUsage = (id: string) => {
    const newPrompts = prompts.map(p =>
      p.id === id ? { ...p, usage: p.usage + 1, updatedAt: new Date().toISOString() } : p
    );
    savePrompts(newPrompts);
    
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({ ...selectedPrompt, usage: selectedPrompt.usage + 1 });
    }
  };

  const handleTestPrompt = async (prompt: Prompt) => {
    // 增加使用次数
    incrementUsage(prompt.id);
    
    // 准备要复制的内容
    let contentToCopy = prompt.content;
    if (prompt.sample && prompt.sample.trim()) {
      contentToCopy = `${prompt.content}\n\n${prompt.sample}`;
    }
    
    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(contentToCopy);
      success('Copied', '', 1000);
    } catch (err) {
      error('Copy failed', 'Unable to access clipboard');
      return;
    }
    
    // 调用回调函数跳转到agents页面并粘贴内容
    if (onTestPrompt) {
      onTestPrompt(contentToCopy);
    }
  };

  const addNewPrompt = (promptData: any) => {
    const newPrompt: Prompt = {
      ...promptData,
      id: generateId(),
      usage: 0,
      isArchived: false,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newPrompts = [...prompts, newPrompt];
    savePrompts(newPrompts);
    setSelectedPrompt(newPrompt);
    success('Created successfully', 'New prompt has been added');
  };

  // 过滤提示语
  const filteredPrompts = prompts.filter(prompt => {
    // 搜索查询过滤
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // 标签过滤
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => prompt.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  useImperativeHandle(ref, () => ({
    addNewPrompt,
  }));

  return (
    <div className="h-full flex">
      {/* Prompt list */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] prompt-list border-r border-border overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{UI_TEXT.prompts.title}</h2>
          
          {filteredPrompts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {prompts.length === 0 ? UI_TEXT.prompts.noPrompts : '未找到匹配的提示语'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => {
                    // 如果正在编辑，先退出编辑状态，然后切换选中的提示符
                    if (isEditing) {
                      setIsEditing(false);
                      setEditForm({ title: '', content: '', sample: '', tags: [], category: 'other' });
                    }
                    setSelectedPrompt(prompt);
                  }}
                  className={cn(
                    'prompt-card',
                    selectedPrompt?.id === prompt.id && 'ring-2 ring-ring'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium truncate flex-1">{prompt.title}</h3>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <button
                          key={starIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRating(prompt.id, starIndex);
                          }}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <Star 
                            className="w-3 h-3" 
                            fill={starIndex <= prompt.rating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {prompt.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Used {prompt.usage} times</span>
                    <span>{formatDate(prompt.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prompt details/edit */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedPrompt ? (
          <>
            {/* Action bar */}
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-semibold">{selectedPrompt.title}</h3>
              <div className="flex items-center gap-2 prompt-actions">
                <button
                  onClick={() => {
                    copyPromptWithSample(selectedPrompt);
                    incrementUsage(selectedPrompt.id);
                  }}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Copy prompt content and sample"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(selectedPrompt)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title={UI_TEXT.prompts.edit}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTestPrompt(selectedPrompt)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title={UI_TEXT.prompts.test}
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedPrompt.id)}
                  className="p-2 hover:bg-accent rounded-md transition-colors text-destructive"
                  title={UI_TEXT.prompts.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col">
              {isEditing ? (
                <div className="h-full flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {UI_TEXT.prompts.promptTitle}
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium mb-2">
                      {UI_TEXT.prompts.promptContent}
                    </label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full flex-1 p-4 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sample</label>
                    <textarea
                      placeholder="输入示例内容"
                      value={editForm.sample}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sample: e.target.value }))}
                      className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {UI_TEXT.prompts.tags}
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={editForm.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                        setEditForm(prev => ({ ...prev, tags }));
                      }}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {editForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {editForm.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 prompt-form-buttons">
                    <InteractiveHoverButton
                      onClick={handleSave}
                      text={UI_TEXT.prompts.save}
                      className="w-52 px-7 bg-muted border-muted text-muted-foreground hover:bg-muted/80"
                    />
                    <InteractiveHoverButton
                      onClick={handleCancel}
                      text={UI_TEXT.prompts.cancel}
                      className="w-52 px-7 bg-muted border-muted text-muted-foreground hover:bg-muted/80"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {UI_TEXT.prompts.promptContent}
                    </h4>
                    <div className="p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedPrompt.content}
                      </pre>
                    </div>
                  </div>
                  
                  {selectedPrompt.sample && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Sample
                      </h4>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {selectedPrompt.sample}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {UI_TEXT.prompts.tags}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPrompt.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedPrompt.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usage count:</span>
                      <span>{selectedPrompt.usage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(selectedPrompt.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{formatDate(selectedPrompt.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a prompt to view details
          </div>
        )}
      </div>
    </div>
  );
}); 