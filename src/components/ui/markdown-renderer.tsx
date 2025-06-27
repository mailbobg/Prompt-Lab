
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  searchQuery?: string;
  size?: 'xs' | 'sm' | 'base';
}

export function MarkdownRenderer({ content, className, searchQuery, size = 'sm' }: MarkdownRendererProps) {
  // Function to highlight search text in markdown
  const highlightSearchText = (text: string) => {
    if (!searchQuery?.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 text-yellow-900 px-0.5 rounded-sm">$1</mark>');
  };

  const processedContent = searchQuery ? highlightSearchText(content) : content;

  // Get size-specific classes for headings and text
  const getSizeClasses = (element: string) => {
    const sizeMap = {
      xs: {
        h1: 'text-lg',
        h2: 'text-base',
        h3: 'text-sm',
        h4: 'text-sm',
        h5: 'text-xs',
        h6: 'text-xs',
        p: 'text-xs',
        code: 'text-xs',
        li: 'text-xs'
      },
      sm: {
        h1: 'text-xl',
        h2: 'text-lg',
        h3: 'text-base',
        h4: 'text-base',
        h5: 'text-sm',
        h6: 'text-sm',
        p: 'text-sm',
        code: 'text-sm',
        li: 'text-sm'
      },
      base: {
        h1: 'text-2xl',
        h2: 'text-xl',
        h3: 'text-lg',
        h4: 'text-base',
        h5: 'text-sm',
        h6: 'text-sm',
        p: 'text-base',
        code: 'text-sm',
        li: 'text-base'
      }
    };
    return sizeMap[size][element as keyof typeof sizeMap[typeof size]] || '';
  };

  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for different elements with size-responsive fonts
          h1: ({ children }) => <h1 className={cn(getSizeClasses('h1'), "font-bold mb-4 text-foreground")}>{children}</h1>,
          h2: ({ children }) => <h2 className={cn(getSizeClasses('h2'), "font-semibold mb-3 text-foreground")}>{children}</h2>,
          h3: ({ children }) => <h3 className={cn(getSizeClasses('h3'), "font-semibold mb-2 text-foreground")}>{children}</h3>,
          h4: ({ children }) => <h4 className={cn(getSizeClasses('h4'), "font-semibold mb-2 text-foreground")}>{children}</h4>,
          h5: ({ children }) => <h5 className={cn(getSizeClasses('h5'), "font-semibold mb-1 text-foreground")}>{children}</h5>,
          h6: ({ children }) => <h6 className={cn(getSizeClasses('h6'), "font-semibold mb-1 text-foreground")}>{children}</h6>,
          p: ({ children }) => <p className={cn(getSizeClasses('p'), "text-foreground leading-relaxed")}>{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">{children}</ol>,
          li: ({ children }) => <li className={cn(getSizeClasses('li'), "text-foreground")}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-md">
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }: any) => {
            const inline = props.inline;
            if (inline) {
              return (
                <code 
                  className={cn(getSizeClasses('code'), "bg-muted px-1.5 py-0.5 rounded font-mono text-foreground border")}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className={cn(getSizeClasses('code'), "block bg-muted p-3 rounded-md font-mono overflow-x-auto text-foreground border", className)}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto border mb-4">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className={cn(getSizeClasses('p'), "border border-border px-3 py-2 text-left font-semibold text-foreground")}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(getSizeClasses('p'), "border border-border px-3 py-2 text-foreground")}>
              {children}
            </td>
          ),
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
