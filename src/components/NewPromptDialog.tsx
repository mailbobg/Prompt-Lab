'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import { Prompt } from '@/types';
import { generateId } from '@/lib/utils';

interface NewPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'usage' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
}

export function NewPromptDialog({ isOpen, onClose, onSave }: NewPromptDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    category: 'other',
    isFavorite: false,
    rating: 0,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    onSave(formData);
    
    // 重置表单
    setFormData({
      title: '',
      content: '',
      tags: [],
      category: 'other',
      isFavorite: false,
      rating: 0,
    });
    setTagInput('');
    onClose();
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    // 这里可以集成AI生成功能
    // 暂时使用模拟数据
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        title: '智能助手',
        content: '请告诉我您需要什么帮助？我会尽我所能为您提供支持。\n\n我可以帮助您：\n\n1. 分析问题和需求\n2. 提供专业建议和解决方案\n3. 协助完成相关任务',
        tags: ['AI助手', '通用'],
      }));
      setIsGenerating(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Add new prompt to your stash</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Manual or Generate */}
          <div>
            <h3 className="text-lg font-medium mb-2">Manual or Generate</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fill out the form below or generate a prompt using AI.<br />
              (zero shot, few shot, or chain of thought, etc)
            </p>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? '生成中...' : 'Generate with AI'}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <p className="text-sm text-muted-foreground mb-2">
              A descriptive title for your prompt.
            </p>
            <input
              type="text"
              placeholder="Enter a title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">提示语内容</label>
            <p className="text-sm text-muted-foreground mb-2">
              主要的提示语模板内容
            </p>
            <textarea
              placeholder="输入您的提示语模板"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={8}
              required
            />
          </div>



          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">标签</label>
            <p className="text-sm text-muted-foreground mb-2">
              输入相关标签，用逗号分隔
            </p>
            <input
              type="text"
              placeholder="输入标签，用逗号分隔"
              value={tagInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full py-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium"
          >
            Create Prompt
          </button>
        </form>
      </div>
    </div>
  );
} 