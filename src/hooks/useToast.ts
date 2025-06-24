// version 1.0.0
'use client';

import { useState } from 'react';
import { Toast, ToastType } from '@/components/Toast';
import { generateId } from '@/lib/utils';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    type: ToastType,
    title: string,
    description?: string,
    duration?: number
  ) => {
    const toast: Toast = {
      id: generateId(),
      type,
      title,
      description,
      duration,
    };

    setToasts((prev) => [...prev, toast]);
    return toast.id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (title: string, description?: string, duration?: number) =>
    addToast('success', title, description, duration);

  const error = (title: string, description?: string, duration?: number) =>
    addToast('error', title, description, duration);

  const warning = (title: string, description?: string, duration?: number) =>
    addToast('warning', title, description, duration);

  const info = (title: string, description?: string, duration?: number) =>
    addToast('info', title, description, duration);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
} 