'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    setIsVisible(true);
    
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={cn(
        'pointer-events-auto w-auto overflow-hidden rounded-lg border shadow-lg transition-all duration-300',
        toastStyles[toast.type],
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <div className="p-2 flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

// Toast container component
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 flex flex-col items-end space-y-4 p-6">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
} 