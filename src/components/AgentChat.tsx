// version 1.0.0
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, Settings } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import { Chat, Message } from '@/types';
import { cn, formatDate, generateId } from '@/lib/utils';

export function AgentChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial chat data
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: '1',
        title: 'Code Optimization Discussion',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Help me optimize this Python code',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'I\'d be happy to help you optimize your Python code. Please share your code, and I\'ll analyze it and provide improvement suggestions.',
            timestamp: new Date().toISOString(),
          },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setChats(mockChats);
    setActiveChat(mockChats[0]);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Mock AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'This is a mock AI response. In a real application, this would call an actual AI API to generate responses.',
        timestamp: new Date().toISOString(),
      };

      const chatWithResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      setActiveChat(chatWithResponse);
      setChats(prev => prev.map(c => c.id === activeChat.id ? chatWithResponse : c));
      setIsLoading(false);
    }, 1000);
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
      <div className="w-1/3 border-r border-border flex flex-col">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{chat.title}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {chat.messages[chat.messages.length - 1]?.content || 'New chat'}
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
      <div className="flex-1 flex flex-col">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'chat-message',
                    message.role === 'user' ? 'user' : 'assistant'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {formatDate(message.timestamp)}
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