'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface JsonFormatterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  readOnly?: boolean;
}

export function JsonFormatter({ 
  value, 
  onChange, 
  placeholder = "Enter JSON or any text format", 
  className,
  minRows = 4,
  readOnly = false
}: JsonFormatterProps) {
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [jsonError, setJsonError] = useState<string>('');
  const [showFormatted, setShowFormatted] = useState(false);
  const [hasAutoFormatted, setHasAutoFormatted] = useState(false);

  // Check if the content is valid JSON
  const validateJson = (text: string) => {
    if (!text.trim()) {
      setIsValidJson(null);
      setJsonError('');
      return;
    }

    try {
      JSON.parse(text);
      setIsValidJson(true);
      setJsonError('');
    } catch (error) {
      setIsValidJson(false);
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  useEffect(() => {
    validateJson(value);
    
    // Auto-format JSON on first load if valid and not already formatted
    if (value.trim() && !hasAutoFormatted && onChange !== (() => {})) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        if (formatted !== value && !readOnly) {
          // Only auto-format in edit mode
          onChange(formatted);
          setHasAutoFormatted(true);
        } else if (readOnly) {
          // In read-only mode, just mark as processed to avoid infinite loop
          setHasAutoFormatted(true);
        }
      } catch (error) {
        // Not JSON or invalid, ignore
        setHasAutoFormatted(true);
      }
    }
  }, [value, hasAutoFormatted, onChange, readOnly]);

  const formatJson = () => {
    if (isValidJson && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange(formatted);
      } catch (error) {
        // Should not happen since we already validated
        console.error('Formatting error:', error);
      }
    }
  };

  const minifyJson = () => {
    if (isValidJson && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const minified = JSON.stringify(parsed);
        onChange(minified);
      } catch (error) {
        // Should not happen since we already validated
        console.error('Minifying error:', error);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      // Could add a toast notification here if needed
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Check if content might be JSON (more flexible detection)
  const mightBeJson = value.trim() && (
    value.trim().startsWith('{') || 
    value.trim().startsWith('[') ||
    (value.includes('"') && value.includes(':')) // Contains quotes and colons
  );

  // Get formatted display value for read-only mode
  const getDisplayValue = () => {
    if (readOnly && isValidJson && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        return value;
      }
    }
    return value;
  };

  return (
    <div className="space-y-2">
      {/* JSON Tools - show for any content that might be JSON or if we have content */}
      {value.trim() && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isValidJson === true ? "bg-green-500" :
              isValidJson === false && mightBeJson ? "bg-red-500" : "bg-gray-300"
            )} />
            <span className={cn(
              "text-xs",
              isValidJson === true ? "text-green-600 dark:text-green-400" :
              isValidJson === false && mightBeJson ? "text-red-600 dark:text-red-400" : "text-gray-500"
            )}>
              {isValidJson === true ? "Valid JSON" :
               isValidJson === false && mightBeJson ? "Invalid JSON" : "Text"}
            </span>
          </div>
          
          <div className="flex gap-1">
            {isValidJson && !readOnly && (
              <>
                <button
                  type="button"
                  onClick={formatJson}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={minifyJson}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Minify
                </button>
              </>
            )}
            {value.trim() && (
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {isValidJson === false && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
          {jsonError}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={getDisplayValue()}
        onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring text-xs font-mono",
          isValidJson === false ? "border-red-300 dark:border-red-700" : "",
          readOnly ? "cursor-default" : "",
          className
        )}
        rows={Math.max(minRows, getDisplayValue().split('\n').length)}
        style={{ 
          minHeight: `${minRows * 1.5}rem`,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
        }}
      />

      {/* Helper text - only show in edit mode */}
      {!readOnly && (
        <div className="text-xs text-muted-foreground">
          Supports JSON format with validation and formatting tools, or any other text format
        </div>
      )}
    </div>
  );
} 