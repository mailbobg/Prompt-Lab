'use client';

import { useState, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PromptManager } from '@/components/PromptManager';
import { AgentChat } from '@/components/AgentChat';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'agents'>('prompts');
  const { toasts, removeToast } = useToast();
  const promptManagerRef = useRef<any>(null);

  const handleNewPrompt = (promptData: any) => {
    if (promptManagerRef.current && promptManagerRef.current.addNewPrompt) {
      promptManagerRef.current.addNewPrompt(promptData);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onNewPrompt={handleNewPrompt}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          {activeTab === 'prompts' ? (
            <PromptManager ref={promptManagerRef} />
          ) : (
            <AgentChat />
          )}
        </main>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
} 