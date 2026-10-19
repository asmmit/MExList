import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'warning' | 'error';
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider Component
 * WHAT: Manages dynamic toast notifications across the application lifecycle.
 * WHY:  Provides immediate feedback for user actions (e.g. adding to watchlist, removing,
 *       or rolling back optimistic state) without jarring the layout.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'default') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Automatically dismiss after 3.2 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * WHAT: Accesses the toast dispatch functions from any component.
 * WHY:  Decouples visual feedback from domain logic and state reducers.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
