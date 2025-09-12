// src/components/ui/ToastProvider.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';

type ToastKind = 'success' | 'error' | 'info';
type ToastItem = { id: string; kind: ToastKind; title?: string; message: string; timeout?: number };

type ToastAPI = {
  success: (msg: string, opts?: Partial<ToastItem>) => void;
  error: (msg: string, opts?: Partial<ToastItem>) => void;
  info: (msg: string, opts?: Partial<ToastItem>) => void;
};

const ToastCtx = createContext<ToastAPI | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  // <<< สำคัญ: ผูก container หลัง mount เท่านั้น >>>
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // ป้องกัน SSR: มี window/document ก่อนค่อย set
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setContainer(document.body);
    }
  }, []);

  const push = useCallback((kind: ToastKind, message: string, opts?: Partial<ToastItem>) => {
    const id = String(++idRef.current);
    const item: ToastItem = { id, kind, message, timeout: 4200, ...opts };
    setItems((prev) => [...prev, item]);

    const t = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, item.timeout);
    return () => clearTimeout(t);
  }, []);

  const api = useMemo<ToastAPI>(
    () => ({
      success: (m, o) => void push('success', m, o),
      error: (m, o) => void push('error', m, o),
      info: (m, o) => void push('info', m, o),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* render portal เฉพาะเมื่อมี container (หลัง mount) */}
      {container &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-end px-3 sm:px-5">
            <div className="flex w-full max-w-sm flex-col gap-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className={[
                    'pointer-events-auto rounded-xl px-4 py-3 shadow-lg ring-1 backdrop-blur',
                    'animate-[toast-in_0.2s_ease-out]',
                    t.kind === 'success'
                      ? 'bg-emerald-50/90 ring-emerald-200 text-emerald-900'
                      : t.kind === 'error'
                      ? 'bg-red-50/90 ring-red-200 text-red-900'
                      : 'bg-sky-50/90 ring-sky-200 text-sky-900',
                  ].join(' ')}
                  role="status"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1',
                        t.kind === 'success'
                          ? 'bg-emerald-600 ring-emerald-700'
                          : t.kind === 'error'
                          ? 'bg-red-600 ring-red-700'
                          : 'bg-sky-600 ring-sky-700',
                      ].join(' ')}
                    >
                      <span className="text-[10px] text-white">!</span>
                    </span>
                    <div className="min-w-0">
                      {t.title ? <div className="font-semibold">{t.title}</div> : null}
                      <div className="text-[14px] leading-snug break-words">{t.message}</div>
                    </div>
                    <button
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                      className="ml-auto rounded-md p-1 text-slate-400 hover:text-slate-700"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>,
          container
        )}

      {/* keyframes สำหรับ animation */}
      <style jsx global>{`
        @keyframes toast-in {
          from {
            transform: translateY(-6px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}