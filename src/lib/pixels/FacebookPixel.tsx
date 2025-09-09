// src/lib/pixels/FacebookPixel.tsx
'use client';
import { useEffect } from 'react';

type FBQ = ((event: string, ...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FBQ;
    _fbq?: FBQ;
  }
}

export default function FacebookPixel() {
  const FB_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    if (!FB_ID || typeof window === 'undefined') return;

    (function (f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return;

      // สร้าง fbq ที่ type-safe
      const n = (function (...args: unknown[]) {
        if ((n as FBQ).callMethod) {
          (n as FBQ).callMethod!(...args);
        } else {
          (n as FBQ).queue.push(args);
        }
      }) as FBQ;

      f.fbq = n;
      if (!f._fbq) f._fbq = n;

      // ❗ แก้จุดที่ทำให้บิลด์พัง: ให้ push เป็น "ฟังก์ชัน" ไม่ใช่ตัว n เอง
      n.push = (...args: unknown[]) => {
        n.queue.push(args);
      };
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];

      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    try {
      window.fbq?.('init', FB_ID);
      window.fbq?.('track', 'PageView');
    } catch {
      // เงียบไว้ ไม่ให้พังหน้า
    }
  }, [FB_ID]);

  return null;
}