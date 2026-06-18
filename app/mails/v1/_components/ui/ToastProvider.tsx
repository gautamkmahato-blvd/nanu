// components/ui/toast.tsx
'use client';

import { createContext, useCallback, useContext, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed top-right */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {toasts.map((toast) => {
            const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
              success: { bg: '#052e16', border: '#22c55e30', text: '#22c55e' },
              error: { bg: '#450a0a', border: '#ef444430', text: '#ef4444' },
              info: { bg: '#172554', border: '#3b82f630', text: '#3b82f6' },
            };
            const c = colors[toast.type];

            return (
              <div
                key={toast.id}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 250,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  animation: 'slideIn 200ms ease-out',
                }}
              >
                <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
                <span>{toast.message}</span>
              </div>
            );
          })}
          <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
}
