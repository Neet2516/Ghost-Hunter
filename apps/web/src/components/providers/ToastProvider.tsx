'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, durationMs = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, description, durationMs };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  const toast = {
    success: useCallback((title: string, description?: string) => {
      showToast({ type: 'success', title, description });
    }, [showToast]),
    error: useCallback((title: string, description?: string) => {
      showToast({ type: 'error', title, description, durationMs: 6000 });
    }, [showToast]),
    warning: useCallback((title: string, description?: string) => {
      showToast({ type: 'warning', title, description });
    }, [showToast]),
    info: useCallback((title: string, description?: string) => {
      showToast({ type: 'info', title, description });
    }, [showToast]),
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-moss',
          borderAccent: 'border-l-4 border-l-moss',
          badge: 'bg-emerald-50 text-moss border-emerald-300',
          label: 'SUCCESS',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-signal',
          borderAccent: 'border-l-4 border-l-signal',
          badge: 'bg-red-50 text-signal border-red-300',
          label: 'SYSTEM ALERT',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          borderAccent: 'border-l-4 border-l-amber-600',
          badge: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'WARNING',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: 'text-ash',
          borderAccent: 'border-l-4 border-l-ink',
          badge: 'bg-bone text-ash border-ink/20',
          label: 'SENTINEL',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, dismissToast }}>
      {children}

      {/* Floating Snackbar Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
        aria-label="System notifications"
      >
        {toasts.map((t) => {
          const config = getToastConfig(t.type);
          const Icon = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-paper hairline shadow-hard p-4 ${config.borderAccent} transition-all duration-200 transform translate-y-0 opacity-100 flex items-start justify-between gap-3`}
              role="alert"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} aria-hidden="true" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 hairline ${config.badge}`}>
                      {config.label}
                    </span>
                    <h4 className="font-display font-bold text-sm text-ink leading-tight">
                      {t.title}
                    </h4>
                  </div>
                  {t.description && (
                    <p className="font-sans text-xs text-ink/75 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-ash hover:text-ink p-1 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
