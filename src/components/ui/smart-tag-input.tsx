'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SmartTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  existingTags?: string[];
}

export function SmartTagInput({ 
  value, 
  onChange, 
  placeholder = "Enter tags separated by commas",
  className,
  existingTags = []
}: SmartTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 首字母大写处理
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // 获取当前正在输入的标签
  const getCurrentTag = (input: string): { beforeComma: string; currentTag: string; afterComma: string } => {
    const cursorPos = inputRef.current?.selectionStart || input.length;
    const beforeCursor = input.slice(0, cursorPos);
    const afterCursor = input.slice(cursorPos);
    
    const lastCommaIndex = beforeCursor.lastIndexOf(',');
    const nextCommaIndex = afterCursor.indexOf(',');
    
    const beforeComma = lastCommaIndex >= 0 ? beforeCursor.slice(0, lastCommaIndex + 1) : '';
    const currentTag = lastCommaIndex >= 0 ? beforeCursor.slice(lastCommaIndex + 1) : beforeCursor;
    const afterComma = nextCommaIndex >= 0 ? afterCursor.slice(nextCommaIndex) : afterCursor;
    
    return { beforeComma, currentTag: currentTag.trim(), afterComma };
  };

  // 获取建议标签
  const getSuggestions = (currentTag: string): string[] => {
    if (!currentTag || currentTag.length < 1) return [];
    
    const lowerCurrentTag = currentTag.toLowerCase();
    const currentTags = value.map(tag => tag.toLowerCase());
    
    return existingTags
      .filter(tag => {
        const lowerTag = tag.toLowerCase();
        return lowerTag.includes(lowerCurrentTag) && 
               !currentTags.includes(lowerTag) &&
               lowerTag !== lowerCurrentTag;
      })
      .slice(0, 5); // 限制建议数量
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const { currentTag } = getCurrentTag(newValue);
    const newSuggestions = getSuggestions(currentTag);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestionIndex(-1);
    
    // 当输入包含逗号时，才处理新标签的添加
    if (newValue.includes(',')) {
      const inputTags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const lastTag = inputTags[inputTags.length - 1];
      
      // 除了最后一个标签，其他的都添加到现有标签中
      const newTagsToAdd = inputTags.slice(0, -1).map(tag => capitalizeFirstLetter(tag));
      const existingTagsLower = value.map(tag => tag.toLowerCase());
      const uniqueNewTags = newTagsToAdd.filter(tag => !existingTagsLower.includes(tag.toLowerCase()));
      
      if (uniqueNewTags.length > 0) {
        onChange([...value, ...uniqueNewTags]);
      }
      
      // 更新输入框为最后一个未完成的标签
      setInputValue(lastTag || '');
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return; // 阻止继续处理
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        return; // 阻止继续处理
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        console.log('Keyboard selecting suggestion:', suggestions[selectedSuggestionIndex]);
        selectSuggestion(suggestions[selectedSuggestionIndex]);
        return; // 阻止继续处理
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        return; // 阻止继续处理
      }
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      // 处理回车键，完成当前标签输入
      const { currentTag } = getCurrentTag(inputValue);
      if (currentTag) {
        const capitalizedTag = capitalizeFirstLetter(currentTag);
        // 检查是否已存在相同标签（大小写不敏感）
        const existingTagsLower = value.map(tag => tag.toLowerCase());
        if (!existingTagsLower.includes(capitalizedTag.toLowerCase())) {
          console.log('Adding tag via Enter key:', capitalizedTag);
          onChange([...value, capitalizedTag]);
        }
        setInputValue('');
        setShowSuggestions(false);
      }
    }
    
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // 如果输入框为空，删除最后一个标签
      const newTags = value.slice(0, -1);
      onChange(newTags);
    }
  };

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    console.log('Selecting suggestion:', suggestion, 'Current tags:', value);
    // 直接添加建议的标签到现有标签中
    const existingTagsLower = value.map(tag => tag.toLowerCase());
    if (!existingTagsLower.includes(suggestion.toLowerCase())) {
      const newTags = [...value, suggestion];
      console.log('Adding new tags:', newTags);
      onChange(newTags);
    } else {
      console.log('Tag already exists:', suggestion);
    }
    
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    // 延迟重新聚焦，确保状态更新完成
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  // 处理失焦
  const handleBlur = () => {
    // 延迟隐藏建议，以便点击建议项
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      
      // 处理未完成的标签输入
      const { currentTag } = getCurrentTag(inputValue);
      if (currentTag) {
        const capitalizedTag = capitalizeFirstLetter(currentTag);
        // 检查是否已存在相同标签（大小写不敏感）
        const existingTagsLower = value.map(tag => tag.toLowerCase());
        if (!existingTagsLower.includes(capitalizedTag.toLowerCase())) {
          console.log('Adding tag on blur:', capitalizedTag);
          onChange([...value, capitalizedTag]);
        }
        setInputValue('');
      }
    }, 200);
  };

  // 处理获得焦点
  const handleFocus = () => {
    const { currentTag } = getCurrentTag(inputValue);
    if (currentTag) {
      const newSuggestions = getSuggestions(currentTag);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }
  };

  return (
    <div className="relative">
      {/* 已选择的标签 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="p-0.5 hover:bg-accent-foreground/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn(
          "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm",
          className
        )}
      />
      
      {/* 建议列表 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // 防止触发input的onBlur
                selectSuggestion(suggestion);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                index === selectedSuggestionIndex && "bg-accent text-accent-foreground"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}