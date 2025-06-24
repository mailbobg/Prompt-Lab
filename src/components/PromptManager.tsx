'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit, Trash2, Copy, Star, Archive, Play } from 'lucide-react';
import { UI_TEXT, STORAGE_KEYS } from '@/constants';
import { Prompt } from '@/types';
import { cn, formatDate, generateId, storage } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

export const PromptManager = forwardRef<any, {}>(function PromptManager(props, ref) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    category: 'other',
  });

  const { success, error } = useToast();

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
    setSelectedPrompt(null);
    setEditForm({ title: '', content: '', tags: [], category: 'other' });
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

  const incrementUsage = (id: string) => {
    const newPrompts = prompts.map(p =>
      p.id === id ? { ...p, usage: p.usage + 1, updatedAt: new Date().toISOString() } : p
    );
    savePrompts(newPrompts);
    
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({ ...selectedPrompt, usage: selectedPrompt.usage + 1 });
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

  useImperativeHandle(ref, () => ({
    addNewPrompt,
  }));

  return (
    <div className="h-full flex">
      {/* Prompt list */}
      <div className="w-1/3 border-r border-border overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{UI_TEXT.prompts.title}</h2>
          
          {prompts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {UI_TEXT.prompts.noPrompts}
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
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
      <div className="flex-1 flex flex-col">
        {selectedPrompt ? (
          <>
            {/* Action bar */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{selectedPrompt.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    copyPrompt(selectedPrompt.content);
                    incrementUsage(selectedPrompt.id);
                  }}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Copy and record usage"
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
                  onClick={() => incrementUsage(selectedPrompt.id)}
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
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                  
                  <div className="flex gap-3">
                    <InteractiveHoverButton
                      onClick={handleSave}
                      text={UI_TEXT.prompts.save}
                      className="w-56 px-8"
                    />
                    <InteractiveHoverButton
                      onClick={handleCancel}
                      text={UI_TEXT.prompts.cancel}
                      className="w-56 px-8 bg-muted border-muted text-muted-foreground hover:bg-muted/80"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {UI_TEXT.prompts.promptContent}
                    </h4>
                    <div className="p-4 bg-muted rounded-md">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedPrompt.content}
                      </pre>
                    </div>
                  </div>
                  
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