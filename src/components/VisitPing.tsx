'use client';
import { useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';

export default function VisitPing() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return; // นับเฉพาะหน้าโฮม
    sent.current = true;
    apiFetch('/visitor/visit/website', { method: 'POST' }).catch(() => {});
  }, []);
  return null;
}