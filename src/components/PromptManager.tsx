'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit, Trash2, Copy, Star, Archive, Play, FileText, Eye, Search } from 'lucide-react';
import { UI_TEXT, STORAGE_KEYS } from '@/constants';
import { Prompt } from '@/types';
import { cn, formatDate, generateId, storage, promptUtils } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { JsonFormatter } from '@/components/ui/json-formatter';
import { SmartTagInput } from '@/components/ui/smart-tag-input';

interface PromptManagerProps {
  searchQuery?: string;
  selectedTags?: string[];
  onToast?: {
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
  };
  onTestPrompt?: (content: string) => void;
  onDataChange?: () => void;
}

export const PromptManager = forwardRef<any, PromptManagerProps>(function PromptManager(props, ref) {
  const { searchQuery = '', selectedTags = [], onToast, onTestPrompt, onDataChange } = props;
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(true); // Default to markdown for content

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    sample: '',
    comments: '',
    tags: [] as string[],
    category: 'other',
  });

  const localToast = useToast();
  const { success, error } = onToast || localToast;

  // 获取所有现有的标签
  const existingTags = Array.from(new Set(prompts.flatMap(prompt => prompt.tags)));

  // Function to highlight search text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) {
      return text;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark 
            key={index} 
            className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 text-yellow-900 px-0.5 rounded-sm"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // 计算prompt中匹配搜索条件的数量
  const getMatchCount = (prompt: Prompt, searchQuery: string, selectedTags: string[]) => {
    if (!searchQuery?.trim() && selectedTags.length === 0) return 0;
    
    let count = 0;
    
    // 搜索词匹配计数
    if (searchQuery?.trim()) {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      // 在各个字段中计算匹配数量
      count += (prompt.title.match(regex) || []).length;
      count += (prompt.content.match(regex) || []).length;
      count += (prompt.sample?.match(regex) || []).length;
      count += (prompt.comments?.match(regex) || []).length;
      count += (prompt.category.match(regex) || []).length;
      
      // 标签中的匹配
      prompt.tags.forEach(tag => {
        count += (tag.match(regex) || []).length;
      });
    }
    
    // 选中标签的匹配计数
    if (selectedTags.length > 0) {
      selectedTags.forEach(selectedTag => {
        if (prompt.tags.includes(selectedTag)) {
          count += 1;
        }
      });
    }
    
    return count;
  };

  // Load data from local storage
  useEffect(() => {
    const storedPrompts = storage.get<Prompt[]>(STORAGE_KEYS.prompts, []);
    
    // If no stored data exists, use default sample data
    if (storedPrompts.length === 0) {
      const defaultPrompts: Prompt[] = [
        {
          id: generateId(),
          title: 'Code Optimization Prompt',
          content: '# Code Optimization Request\n\nPlease help me optimize the following code to make it more **efficient** and **readable**:\n\n## Requirements:\n- Improve performance\n- Enhance readability\n- Follow best practices\n- Add proper documentation\n\n```\n[Paste your code here]\n```\n\n## Expected Output:\n1. Optimized code\n2. Explanation of changes\n3. Performance improvements',
          sample: '## Original Code:\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n```\n\n## Optimized Code:\n```javascript\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n  return memo[n];\n}\n```\n\n### Improvements:\n- **Memoization**: Caches computed values\n- **Time Complexity**: O(n) instead of O(2^n)\n- **Space Efficiency**: Reduces redundant calculations',
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
          content: '# Article Summary Request\n\nPlease write a **concise summary** of the following article, including main points and conclusions:\n\n## Analysis Requirements:\n- Extract key themes and arguments\n- Identify supporting evidence\n- Summarize conclusions\n- Highlight important insights\n\n---\n\n**Article Content:**\n```\n[Paste article content here]\n```\n\n## Expected Format:\n### Main Points:\n1. Point 1\n2. Point 2\n3. Point 3\n\n### Key Insights:\n- Insight 1\n- Insight 2\n\n### Conclusion:\n[Summary of conclusions]',
          sample: '{\n  "article_title": "The Impact of Artificial Intelligence on Education",\n  "summary": {\n    "main_points": [\n      {\n        "point": "Personalized Learning",\n        "description": "AI can provide customized learning experiences tailored to individual student needs"\n      },\n      {\n        "point": "Intelligent Tutoring", \n        "description": "Real-time feedback systems help track and improve learning progress"\n      },\n      {\n        "point": "Equity Considerations",\n        "description": "Important to address data privacy and educational access issues"\n      }\n    ],\n    "key_insights": [\n      "AI technology has transformative potential in education",\n      "Implementation requires careful consideration of ethical implications",\n      "Balance needed between technological advancement and human-centered education"\n    ],\n    "conclusion": "AI will revolutionize education by enabling personalized, efficient learning experiences. However, successful implementation requires thoughtful planning to ensure technology serves educational goals while maintaining equity and privacy standards.",\n    "confidence_score": 0.85,\n    "word_count": 156\n  }\n}',
          tags: ['Summary', 'Writing'],
          category: 'writing',
          isFavorite: false,
          isArchived: false,
          usage: 8,
          rating: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          title: 'API Documentation Generator',
          content: '# API Documentation Generator\n\nGenerate comprehensive API documentation for the following endpoint:\n\n## Input Requirements:\n- **HTTP Method**: [GET/POST/PUT/DELETE]\n- **Endpoint URL**: `/api/example`\n- **Description**: Brief description of functionality\n- **Parameters**: Request parameters and body\n- **Response**: Expected response format\n\n---\n\n### Endpoint Details:\n```\n[Paste your API endpoint details here]\n```\n\n## Documentation Format:\n\n### Overview\n[Brief description]\n\n### Request\n- **Method**: \n- **URL**: \n- **Headers**: \n- **Body**: \n\n### Response\n- **Status Codes**: \n- **Response Body**: \n\n### Examples\n**Request Example:**\n```json\n{\n  "key": "value"\n}\n```\n\n**Response Example:**\n```json\n{\n  "success": true,\n  "data": {}\n}\n```',
          sample: '# POST /api/users\n\n## Overview\nCreates a new user account in the system.\n\n## Request\n- **Method**: `POST`\n- **URL**: `/api/users`\n- **Headers**: \n  - `Content-Type: application/json`\n  - `Authorization: Bearer <token>`\n- **Body**: User registration data\n\n## Parameters\n| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n| `name` | string | Yes | Full name |\n| `email` | string | Yes | Email address |\n| `password` | string | Yes | Password (min 8 chars) |\n\n## Response\n- **Status Codes**: \n  - `201`: User created successfully\n  - `400`: Invalid input data\n  - `409`: Email already exists\n\n## Examples\n\n**Request:**\n```json\n{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "password": "securepass123"\n}\n```\n\n**Response (201):**\n```json\n{\n  "success": true,\n  "data": {\n    "id": "123",\n    "name": "John Doe",\n    "email": "john@example.com",\n    "created_at": "2024-01-01T00:00:00Z"\n  }\n}\n```',
          comments: '## Usage Notes\n\n- This prompt works best for **REST APIs**\n- Supports multiple formats: JSON, XML, GraphQL\n- Include authentication requirements\n- Add rate limiting information if applicable\n\n### Tips:\n1. Be specific about data types\n2. Include all possible status codes\n3. Provide realistic examples\n4. Document error responses',
          tags: ['API', 'Documentation', 'Development'],
          category: 'coding',
          isFavorite: false,
          isArchived: false,
          usage: 3,
          rating: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          title: 'JSON Data Processor',
          content: '# JSON Data Processing\n\nProcess and transform the following data according to the specified requirements:\n\n## Input Data:\n```json\n[Paste your JSON data here]\n```\n\n## Processing Requirements:\n- **Validation**: Ensure data integrity and format correctness\n- **Transformation**: Apply specified data transformations\n- **Filtering**: Remove unwanted fields or records\n- **Aggregation**: Calculate summaries or statistics\n- **Output Format**: Structure according to requirements\n\n## Transformation Rules:\n1. Field mapping and renaming\n2. Data type conversions\n3. Value calculations and derivations\n4. Conditional logic applications\n5. Data validation and cleaning\n\n### Expected Output:\nReturn processed data in valid JSON format with:\n- Transformed structure\n- Clean and validated values\n- Summary statistics (if applicable)\n- Processing metadata',
          sample: '{\n  "input": {\n    "users": [\n      {"id": 1, "name": "John Doe", "age": 30, "email": "john@example.com", "status": "active"},\n      {"id": 2, "name": "Jane Smith", "age": 25, "email": "jane@example.com", "status": "inactive"},\n      {"id": 3, "name": "Bob Johnson", "age": 35, "email": "bob@example.com", "status": "active"}\n    ]\n  },\n  "output": {\n    "active_users": [\n      {\n        "user_id": 1,\n        "full_name": "John Doe",\n        "contact": "john@example.com",\n        "age_group": "30-39",\n        "profile_complete": true\n      },\n      {\n        "user_id": 3,\n        "full_name": "Bob Johnson", \n        "contact": "bob@example.com",\n        "age_group": "30-39",\n        "profile_complete": true\n      }\n    ],\n    "statistics": {\n      "total_users": 3,\n      "active_count": 2,\n      "inactive_count": 1,\n      "average_age": 30,\n      "completion_rate": 1.0\n    },\n    "metadata": {\n      "processed_at": "2024-01-01T00:00:00Z",\n      "transformations_applied": ["filter_active", "rename_fields", "calculate_age_groups"],\n      "validation_passed": true\n    }\n  }\n}',
          comments: '## JSON Processing Features\n\n### Supported Operations:\n- **Data Validation**: Schema validation and type checking\n- **Field Transformation**: Rename, combine, or split fields\n- **Filtering**: Apply conditions to include/exclude records\n- **Aggregation**: Sum, count, average, min/max calculations\n- **Nested Processing**: Handle complex nested JSON structures\n\n### Use Cases:\n- API response transformation\n- Data migration and ETL processes\n- Report generation from raw data\n- Data cleaning and normalization\n- Integration between different systems\n\n### Tips:\n- Always validate input JSON before processing\n- Use descriptive field names in output\n- Include metadata for tracking transformations\n- Handle edge cases and missing values\n- Preserve data relationships when transforming',
          tags: ['JSON', 'Data Processing', 'Transformation'],
          category: 'coding',
          isFavorite: false,
          isArchived: false,
          usage: 1,
          rating: 4,
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
    // 通知数据变化
    if (onDataChange) {
      onDataChange();
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditForm({
      title: prompt.title,
      content: prompt.content,
      sample: prompt.sample || '',
      comments: prompt.comments || '',
      tags: prompt.tags,
      category: prompt.category,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedPrompt) return;
    
    // 标签规范化处理
    const normalizedTags = promptUtils.normalizeTags(editForm.tags, prompts);
    
    const updatedPrompt: Prompt = {
      ...selectedPrompt,
      ...editForm,
      tags: normalizedTags,
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
    // Don't clear selectedPrompt, keep the currently selected prompt to display its content
    setEditForm({ title: '', content: '', sample: '', comments: '', tags: [], category: 'other' });
  };

  // Handle keyboard shortcuts for better paste support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enable Ctrl+V (Cmd+V on Mac) paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      return; // Let the default paste behavior work
    }
    // Enable Ctrl+A (Cmd+A on Mac) select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      return;
    }
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
      
      // If there's sample content, add it to the copied content
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
    // Increment usage count
    incrementUsage(prompt.id);
    
    // Prepare content to copy
    let contentToCopy = prompt.content;
    if (prompt.sample && prompt.sample.trim()) {
      contentToCopy = `${prompt.content}\n\n${prompt.sample}`;
    }
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(contentToCopy);
      success('Copied', '', 1000);
    } catch (err) {
      error('Copy failed', 'Unable to access clipboard');
      return;
    }
    
    // Call callback function to navigate to agents page and paste content
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

  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => {
      // Search query filter - extended to search all fields
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prompt.sample && prompt.sample.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (prompt.comments && prompt.comments.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => prompt.tags.includes(tag));

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      // 按更新时间降序排列，最新的在最上面
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  useImperativeHandle(ref, () => ({
    addNewPrompt,
  }));

  return (
    <div className="h-full flex">
      {/* Prompt list */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] prompt-list border-r border-border overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{UI_TEXT.prompts.title}</h2>
            {(searchQuery || selectedTags.length > 0) && (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                <Search className="w-3 h-3" />
                <span>{filteredPrompts.length} results</span>
              </div>
            )}
          </div>
          
          {filteredPrompts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {prompts.length === 0 ? UI_TEXT.prompts.noPrompts : 'No matching prompts found'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => {
                    // Exit editing mode first if currently editing, then switch to selected prompt
                    if (isEditing) {
                      setIsEditing(false);
                      setEditForm({ title: '', content: '', sample: '', comments: '', tags: [], category: 'other' });
                    }
                    setSelectedPrompt(prompt);
                  }}
                  className={cn(
                    'prompt-card',
                    selectedPrompt?.id === prompt.id && 'ring-2 ring-ring'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-medium truncate">{highlightText(prompt.title, searchQuery)}</h3>
                      {(searchQuery || selectedTags.length > 0) && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex-shrink-0">
                          {getMatchCount(prompt, searchQuery, selectedTags)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
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
                    {highlightText(prompt.content, searchQuery)}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {highlightText(tag, searchQuery)}
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
              <h3 className="font-semibold">{highlightText(selectedPrompt.title, searchQuery)}</h3>
              <div className="flex items-center gap-2 prompt-actions">
                <button
                  onClick={() => setShowMarkdown(!showMarkdown)}
                  className={cn(
                    "p-2 hover:bg-accent rounded-md transition-colors",
                    showMarkdown ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                  title={showMarkdown ? "Show raw text" : "Show markdown preview"}
                >
                  {showMarkdown ? <FileText className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                      onKeyDown={handleKeyDown}
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
                      onKeyDown={handleKeyDown}
                      className="w-full flex-1 p-4 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sample</label>
                    <JsonFormatter
                      value={editForm.sample}
                      onChange={(value) => setEditForm(prev => ({ ...prev, sample: value }))}
                      placeholder="Enter sample usage example (JSON, Markdown, or any text format)"
                      minRows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <textarea
                      placeholder="Enter additional comments or notes"
                      value={editForm.comments}
                      onChange={(e) => setEditForm(prev => ({ ...prev, comments: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {UI_TEXT.prompts.tags}
                    </label>
                    <SmartTagInput
                      value={editForm.tags}
                      onChange={(tags) => setEditForm(prev => ({ ...prev, tags }))}
                      placeholder="Enter tags separated by commas"
                      existingTags={existingTags}
                    />
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
                    <div className="p-4 border border-border rounded-md bg-muted/20">
                      {showMarkdown ? (
                        <MarkdownRenderer 
                          content={selectedPrompt.content} 
                          searchQuery={searchQuery}
                          size="xs"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap text-xs font-mono">
                          {highlightText(selectedPrompt.content, searchQuery)}
                        </pre>
                      )}
                    </div>
                  </div>
                  
                  {selectedPrompt.sample && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Sample
                      </h4>
                      <div className="border border-border rounded-md bg-muted/20 p-2">
                        <JsonFormatter
                          value={selectedPrompt.sample || ''}
                          onChange={() => {}} // Read-only in preview mode
                          placeholder=""
                          className="bg-transparent border-0"
                          readOnly={true}
                        />
                      </div>
                    </div>
                  )}

                  {selectedPrompt.comments && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Comments
                      </h4>
                      <div className="p-4 border border-border rounded-md bg-muted/20">
                        {showMarkdown ? (
                          <MarkdownRenderer 
                            content={selectedPrompt.comments || ''} 
                            searchQuery={searchQuery}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {highlightText(selectedPrompt.comments || '', searchQuery)}
                          </pre>
                        )}
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
                          {highlightText(tag, searchQuery)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span>{highlightText(selectedPrompt.category, searchQuery)}</span>
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