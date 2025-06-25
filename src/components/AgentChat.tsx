'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, Settings, Copy } from 'lucide-react';
import { UI_TEXT, STORAGE_KEYS } from '@/constants';
import { Chat, Message } from '@/types';
import { cn, formatDate, generateId, storage } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export function AgentChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      error('复制失败', '无法访问剪贴板');
    }
  };

  // Call DeepSeek API
  const callDeepSeekAPI = async (messages: Message[]): Promise<string> => {
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
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response:', data);
    
    // Handle DeepSeek response format
    const content = data.choices?.[0]?.message?.content || 
                   data.choices?.[0]?.text || 
                   'No response from API';
    
    console.log('Extracted content:', content);
    return content;
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
  }, [activeChat?.messages]);

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

    try {
      // Call DeepSeek API
      const aiResponse = await callDeepSeekAPI(updatedChat.messages);
      console.log('AI Response received:', aiResponse);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const chatWithResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      console.log('Updating chat with response:', chatWithResponse);
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Chat list */}
      <div className="w-1/3 min-w-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{UI_TEXT.agents.title}</h2>
            <button
              onClick={createNewChat}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title={UI_TEXT.agents.newChat}
            >
              <Plus className="w-4 h-4" />
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
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                      title={UI_TEXT.agents.deleteChat}
                    >
                      <Trash2 className="w-4 h-4" />
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
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{activeChat.title}</h3>
              <button
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Chat settings"
              >
                <Settings className="w-4 h-4" />
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
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className={cn(
                        "p-1 hover:bg-accent rounded transition-all duration-200",
                        copiedMessageId === message.id 
                          ? "opacity-100" 
                          : "opacity-0 group-hover:opacity-100"
                      )}
                      title="复制消息"
                    >
                      {copiedMessageId === message.id ? (
                        <span className="text-xs text-green-600 font-medium">Copied</span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="text-sm text-muted-foreground">
                    {UI_TEXT.common.loading}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={UI_TEXT.agents.messagePlaceholder}
                  className="flex-1 min-h-[60px] max-h-32 p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
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
} 