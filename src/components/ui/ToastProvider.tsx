"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ─────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return no-ops when outside provider (e.g., landing page)
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

/* ── Provider ──────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error   = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info    = useCallback((msg: string) => addToast('info', msg), [addToast]);

  const iconMap: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const colorMap: Record<ToastType, string> = {
    success: '#00FF88',
    error: '#FF4D4D',
    info: '#6DB5FF',
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'rgba(17, 17, 17, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                minWidth: 220,
                maxWidth: 380,
              }}
            >
              <span
                style={{
                  color: colorMap[toast.type],
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {iconMap[toast.type]}
              </span>
              <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
