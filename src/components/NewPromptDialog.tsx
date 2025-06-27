// version 1.0.0
'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import { Prompt } from '@/types';
import { generateId } from '@/lib/utils';

interface NewPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'usage' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  prefilledData?: any;
}

export function NewPromptDialog({ isOpen, onClose, onSave, prefilledData }: NewPromptDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sample: '',
    tags: [] as string[],
    category: 'other',
    isFavorite: false,
    rating: 0,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Use prefilled data when dialog opens
  useEffect(() => {
    if (isOpen && prefilledData) {
      setFormData({
        title: prefilledData.title || '',
        content: prefilledData.content || '',
        sample: prefilledData.sample || '',
        tags: prefilledData.tags || [],
        category: prefilledData.category || 'other',
        isFavorite: prefilledData.isFavorite || false,
        rating: prefilledData.rating || 0,
      });
      setTagInput(prefilledData.tags ? prefilledData.tags.join(', ') : '');
    } else if (isOpen && !prefilledData) {
      // Reset form for new prompt
      setFormData({
        title: '',
        content: '',
        sample: '',
        tags: [],
        category: 'other',
        isFavorite: false,
        rating: 0,
      });
      setTagInput('');
    }
  }, [isOpen, prefilledData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    onSave(formData);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      sample: '',
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

  // Handle paste events explicitly
  const handlePaste = (e: React.ClipboardEvent, field: keyof typeof formData) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && typeof formData[field] === 'string') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: (prev[field] as string) + pastedText 
      }));
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    // Enable Ctrl+V (Cmd+V on Mac) paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // Let the default paste behavior work
      return;
    }
    
    // Enable Ctrl+A (Cmd+A on Mac) select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      return;
    }
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Title bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold pr-4">Add new prompt to your stash</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Manual or Generate */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-2">Manual or Generate</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Fill out the form below or generate a prompt using AI.<br className="hidden sm:inline" />
              (zero shot, few shot, or chain of thought, etc)
            </p>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50 text-sm w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              A descriptive title for your prompt.
            </p>
            <input
              type="text"
              placeholder="Enter a title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, 'title')}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Prompt Content</label>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              The main prompt template content
            </p>
            <textarea
              placeholder="Enter your prompt template"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, 'content')}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              rows={6}
              required
            />
          </div>

          {/* Sample */}
          <div>
            <label className="block text-sm font-medium mb-2">Sample</label>
            <textarea
              placeholder="Enter sample usage example"
              value={formData.sample}
              onChange={(e) => setFormData(prev => ({ ...prev, sample: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, 'sample')}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Enter relevant tags, separated by commas
            </p>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              value={tagInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              onKeyDown={(e) => {
                // Enable default paste behavior for tags
                if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                  return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  return;
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag text-xs sm:text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full sm:w-auto sm:px-8 py-2.5 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium text-sm"
          >
            Create Prompt
          </button>
        </form>
      </div>
    </div>
  );
} 