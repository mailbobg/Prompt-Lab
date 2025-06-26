'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Send, Plus, Trash2, Settings, Copy, FileText } from 'lucide-react';
import { UI_TEXT, STORAGE_KEYS } from '@/constants';
import { Chat, Message } from '@/types';
import { cn, formatDate, generateId, storage } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface AgentChatProps {
  onNewPrompt?: (promptData: any) => void;
}

export const AgentChat = forwardRef<any, AgentChatProps>(function AgentChat({ onNewPrompt } = {}, ref) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  // Copy message content to clipboard
  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      // Clear the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      error('Copy failed', 'Unable to access clipboard');
    }
  };

  // Add message to prompts
  const addToPrompts = (content: string) => {
    if (onNewPrompt) {
      const promptData = {
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        content: content,
        sample: '',
        tags: ['AI Generated'],
        category: 'other',
        isFavorite: false,
        rating: 0,
      };
      onNewPrompt(promptData);
      success('Added successfully', 'Added to prompt library');
    }
  };

  // Call DeepSeek API
  const callDeepSeekAPIStream = async (messages: Message[], onChunk: (chunk: string) => void): Promise<void> => {
    const apiKey = storage.get<string>(STORAGE_KEYS.openAIKey, '');
    
    if (!apiKey) {
      throw new Error('API key not found. Please set your API key in settings.');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API call failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.warn('Failed to parse chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  // Load chats from localStorage
  useEffect(() => {
    const storedChats = storage.get<Chat[]>(STORAGE_KEYS.chats, []);
    
    if (storedChats.length === 0) {
      // Create initial chat if none exists
      const initialChat: Chat = {
        id: generateId(),
        title: 'New Chat',
        messages: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChats([initialChat]);
      setActiveChat(initialChat);
      storage.set(STORAGE_KEYS.chats, [initialChat]);
    } else {
      setChats(storedChats);
      const activeChat = storedChats.find(chat => chat.isActive) || storedChats[0];
      setActiveChat(activeChat);
    }
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, streamingMessage]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: `New Chat ${chats.length + 1}`,
      messages: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChats(prev => [newChat, ...prev.map(c => ({ ...c, isActive: false }))]);
    setActiveChat(newChat);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChat?.id === chatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      setActiveChat(remainingChats[0] || null);
    }
  };

  // Start editing chat title
  const startEditingTitle = () => {
    if (activeChat) {
      setIsEditingTitle(true);
      setEditingTitle(activeChat.title);
      // Focus input after state update
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 0);
    }
  };

  // Save edited title
  const saveTitle = () => {
    if (!activeChat || !editingTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    const updatedChat = {
      ...activeChat,
      title: editingTitle.trim(),
      updatedAt: new Date().toISOString(),
    };

    setActiveChat(updatedChat);
    setChats(prev => {
      const updatedChats = prev.map(c => c.id === activeChat.id ? updatedChat : c);
      storage.set(STORAGE_KEYS.chats, updatedChats);
      return updatedChats;
    });
    setIsEditingTitle(false);
  };

  // Cancel editing title
  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  // Handle title input key press
  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    setActiveChat(updatedChat);
    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setMessageInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    // 创建一个临时的助手消息ID
    const assistantMessageId = generateId();

    try {
      // Call DeepSeek API with streaming
      let fullResponse = '';
      
      await callDeepSeekAPIStream(updatedChat.messages, (chunk: string) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      });

      // 流式输出完成后，保存完整消息
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      };

      const chatWithResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      setActiveChat(chatWithResponse);
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === activeChat.id ? chatWithResponse : c);
        storage.set(STORAGE_KEYS.chats, updatedChats);
        return updatedChats;
      });
      
    } catch (err) {
      console.error('DeepSeek API error:', err);
      error('API Call Failed', err instanceof Error ? err.message : 'Please check your API key settings');
      
      // Restore original chat state if API call failed
      setActiveChat(activeChat);
      setChats(prev => {
        const restoredChats = prev.map(c => c.id === activeChat.id ? activeChat : c);
        storage.set(STORAGE_KEYS.chats, restoredChats);
        return restoredChats;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    pasteContent: (content: string) => {
      setMessageInput(content);
    }
  }));

  return (
    <div className="h-full flex">
      {/* Chat list */}
      <div className="w-1/3 min-w-0 border-r border-border flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{UI_TEXT.agents.title}</h2>
            <button
              onClick={createNewChat}
              className="p-2 hover:bg-accent rounded-md transition-all duration-150 hover:scale-125"
              title={UI_TEXT.agents.newChat}
            >
              <Plus className="w-4 h-4 transition-transform duration-150" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>{UI_TEXT.agents.enableActions}</span>
            <button className="w-10 h-6 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform"></div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {chats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No chat history
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    activeChat?.id === chat.id
                      ? 'bg-secondary border-ring'
                      : 'bg-card border-border hover:bg-accent'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-medium truncate">{chat.title}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1 break-words">
                        {chat.messages[chat.messages.length - 1]?.content?.substring(0, 50) + 
                         (chat.messages[chat.messages.length - 1]?.content?.length > 50 ? '...' : '') || 'New chat'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all duration-150 hover:scale-125"
                      title={UI_TEXT.agents.deleteChat}
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-150" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 flex items-center justify-between">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  onBlur={saveTitle}
                  className="font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5 flex-1 mr-2"
                  maxLength={100}
                />
              ) : (
                <h3 
                  className="font-semibold cursor-pointer hover:bg-accent rounded px-1 py-0.5 transition-colors flex-1 mr-2"
                  onDoubleClick={startEditingTitle}
                  title="Double-click to edit title"
                >
                  {activeChat.title}
                </h3>
              )}
              <button
                className="p-2 hover:bg-accent rounded-md transition-all duration-150 hover:scale-125"
                title="Chat settings"
              >
                <Settings className="w-4 h-4 transition-transform duration-150" />
              </button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'chat-message group relative',
                    message.role === 'user' ? 'user' : 'assistant'
                  )}
                  style={{maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'anywhere'}}
                >
                  <div className="text-sm whitespace-pre-wrap break-words" style={{wordWrap: 'break-word', overflowWrap: 'anywhere'}}>
                    {message.content}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {formatDate(message.timestamp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => addToPrompts(message.content)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all duration-150 hover:scale-125"
                        title="Add to prompts"
                      >
                        <FileText className="w-3 h-3 transition-transform duration-150" />
                      </button>
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className={cn(
                          "p-1 hover:bg-accent rounded transition-all duration-150 hover:scale-125",
                          copiedMessageId === message.id 
                            ? "opacity-100" 
                            : "opacity-0 group-hover:opacity-100"
                        )}
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-xs text-green-600 font-medium">Copied</span>
                        ) : (
                          <Copy className="w-3 h-3 transition-transform duration-150" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {isStreaming && streamingMessage && (
                <div className="chat-message assistant">
                  <div className="text-sm whitespace-pre-wrap break-words" style={{wordWrap: 'break-word', overflowWrap: 'anywhere'}}>
                    {streamingMessage}
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full ml-1 animate-pulse"></span>
                  </div>
                </div>
              )}
              
              {isLoading && !isStreaming && (
                <div className="chat-message assistant">
                  <div className="flex items-center justify-start">
                    <div className="flex space-x-1">
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          animation: 'heartbeat 1.5s ease-in-out infinite',
                          animationDelay: '0ms'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          animation: 'heartbeat 1.5s ease-in-out infinite',
                          animationDelay: '200ms'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          animation: 'heartbeat 1.5s ease-in-out infinite',
                          animationDelay: '400ms'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={UI_TEXT.agents.messagePlaceholder}
                  className="flex-1 p-3 border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring text-sm"
                  style={{ borderRadius: '18px', minHeight: '66px', maxHeight: '141px' }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:scale-125"
                >
                  <Send className="w-4 h-4 transition-transform duration-150" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a chat to start conversation
          </div>
        )}
      </div>
    </div>
  );
});