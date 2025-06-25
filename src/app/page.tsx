// version 1.0.0
'use client';

import { useState, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PromptManager } from '@/components/PromptManager';
import { AgentChat } from '@/components/AgentChat';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { SettingsDialog } from '@/components/SettingsDialog';
import { NewPromptDialog } from '@/components/NewPromptDialog';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'agents'>('prompts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewPromptOpen, setIsNewPromptOpen] = useState(false);
  const [prefilledPromptData, setPrefilledPromptData] = useState<any>(null);
  const { toasts, removeToast, success, error } = useToast();
  const promptManagerRef = useRef<any>(null);
  const agentChatRef = useRef<any>(null);

  const handleNewPrompt = (promptData: any) => {
    if (promptManagerRef.current && promptManagerRef.current.addNewPrompt) {
      promptManagerRef.current.addNewPrompt(promptData);
    }
    setIsNewPromptOpen(false);
    setPrefilledPromptData(null);
  };

  const handleNewPromptFromChat = (promptData: any) => {
    setActiveTab('prompts'); // Switch to prompts tab
    setPrefilledPromptData(promptData); // Set prefilled data
    setIsNewPromptOpen(true); // Open dialog
  };

  const handleTestPrompt = (content: string) => {
    setActiveTab('agents'); // Switch to agents tab
    // 使用setTimeout确保tab切换完成后再粘贴内容
    setTimeout(() => {
      if (agentChatRef.current && agentChatRef.current.pasteContent) {
        agentChatRef.current.pasteContent(content);
      }
    }, 100);
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onNewPrompt={() => setIsNewPromptOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />
              <div className="flex-1 min-w-0 flex flex-col">
          <Header onSettings={() => setIsSettingsOpen(true)} />
          <main className="flex-1 overflow-hidden">
          {activeTab === 'prompts' ? (
            <PromptManager 
              ref={promptManagerRef}
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              onToast={{ success, error }}
              onTestPrompt={handleTestPrompt}
            />
          ) : (
            <AgentChat 
              ref={agentChatRef}
              onNewPrompt={handleNewPromptFromChat} 
            />
          )}
        </main>
              </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
                <SettingsDialog 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <NewPromptDialog
          isOpen={isNewPromptOpen}
          onClose={() => {
            setIsNewPromptOpen(false);
            setPrefilledPromptData(null);
          }}
          onSave={handleNewPrompt}
          prefilledData={prefilledPromptData}
        />
      </div>
    );
  } 