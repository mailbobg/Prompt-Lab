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
    
    // Reset form
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
    // Here you can integrate AI generation functionality
    // Using mock data for now
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        title: 'Smart Assistant',
        content: 'How can I help you today? I will do my best to provide support.\n\nI can help you with:\n\n1. Analyzing problems and requirements\n2. Providing professional advice and solutions\n3. Assisting with task completion',
        tags: ['AI Assistant', 'General'],
      }));
      setIsGenerating(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Title bar */}
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
              {isGenerating ? 'Generating...' : 'Generate with AI'}
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
            <label className="block text-sm font-medium mb-2">Prompt Content</label>
            <p className="text-sm text-muted-foreground mb-2">
              The main prompt template content
            </p>
            <textarea
              placeholder="Enter your prompt template"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={8}
              required
            />
          </div>



          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <p className="text-sm text-muted-foreground mb-2">
              Enter relevant tags, separated by commas
            </p>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
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

          {/* Submit button */}
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