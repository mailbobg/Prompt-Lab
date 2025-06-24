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

  // 模拟初始聊天数据
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: '1',
        title: '代码优化讨论',
        messages: [
          {
            id: '1',
            role: 'user',
            content: '帮我优化这段Python代码',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: '我很乐意帮你优化Python代码。请分享你的代码，我会分析并提供改进建议。',
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

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: `新聊天 ${chats.length + 1}`,
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

    // 添加用户消息
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    setActiveChat(updatedChat);
    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setMessageInput('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '这是一个模拟的AI回复。在实际应用中，这里会调用真实的AI API来生成回应。',
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
      {/* 聊天列表 */}
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
              暂无聊天记录
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
                        {chat.messages[chat.messages.length - 1]?.content || '新聊天'}
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

      {/* 聊天界面 */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* 聊天头部 */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{activeChat.title}</h3>
              <button
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="聊天设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* 消息列表 */}
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

            {/* 输入区域 */}
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
                按 Enter 发送，Shift + Enter 换行
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            选择或创建一个聊天开始对话
          </div>
        )}
      </div>
    </div>
  );
} 