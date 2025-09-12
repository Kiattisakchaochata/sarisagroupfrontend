// src/hooks/useAuth.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import useSWR from 'swr';

type User = { id: string; name: string; email: string; role: string } | null;

type AuthCtx = {
  user: User;
  isLoading: boolean; // true ระหว่างบูต/ดึง me
  error: unknown;
  mutate: () => Promise<unknown>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877';

/* ---------- token helpers ---------- */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
function setToken(raw: string) {
  const jwt = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;
  localStorage.setItem('token', jwt);
}
function clearToken() {
  try {
    localStorage.removeItem('token');
  } catch {}
}
function authHeader(): HeadersInit | undefined {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : undefined;
}

/* ---------- SWR fetcher ---------- */
const swrFetcher = async (path: string) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: authHeader(),
  });

  // ยังไม่ล็อกอิน → อย่า throw, คืน user:null พอ (กันคอนโซลฟ้อง/ลูป)
  if (res.status === 401) return { user: null };

  const text = await res.text();
  if (!res.ok) {
    try {
      const j = text ? JSON.parse(text) : {};
      throw new Error(j.message || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }

  // รองรับทั้ง { user: {...} } หรืออ็อบเจ็กต์ผู้ใช้ตรง ๆ
  const j = text ? JSON.parse(text) : {};
  if (j?.user) return { user: j.user as User };
  if (j?.id && (j?.email || j?.name)) return { user: j as User };
  return { user: null as User };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // รอจนอ่าน localStorage ได้ + เช็คว่ามี token ไหม
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setReady(true);
    setHasToken(!!getToken());
  }, []);

  // ยิง /me เฉพาะตอนพร้อม+มี token เท่านั้น → กัน 401 ช่วงแรก
  const key = ready && hasToken ? '/api/auth/me' : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ user: User }>(
    key,
    swrFetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1500,
      fallbackData: { user: null }, // กัน data undefined
      keepPreviousData: true,
    }
  );

  // sync token ข้ามแท็บ
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        setHasToken(!!e.newValue);
        // ถ้า token ถูกเพิ่ม/ลบ ให้รีเฟรชสถานะ user
        mutate();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [mutate]);

  /* ---------- actions ---------- */
  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();

      if (!res.ok) {
        try {
          const j = JSON.parse(text);
          throw new Error(j.message || 'เข้าสู่ระบบไม่สำเร็จ');
        } catch {
          throw new Error(text || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }

      const j = text ? JSON.parse(text) : {};
      if (j?.token) setToken(j.token);

      // อัปเดต UI ให้ไว: ถ้ามี user จาก login ก็ seed แคชเลย
      if (j?.user) {
        await mutate({ user: j.user as User }, { revalidate: false });
        setHasToken(true);
      } else {
        setHasToken(true); // ทำให้ key ไม่เป็น null
        await mutate(); // ดึง /me จาก token ที่เพิ่งตั้ง
      }
    },
    [mutate]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const text = await res.text();

      if (!res.ok) {
        try {
          const j = JSON.parse(text);
          const msg =
            j.message ||
            (res.status === 400 || res.status === 409 ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'สมัครสมาชิกไม่สำเร็จ');
          throw new Error(msg);
        } catch {
          const msg =
            res.status === 400 || res.status === 409 ? 'อีเมลนี้ถูกใช้งานแล้ว' : text || 'สมัครสมาชิกไม่สำเร็จ';
          throw new Error(msg);
        }
      }

      const j = text ? JSON.parse(text) : {};
      if (j?.token) setToken(j.token);

      if (j?.user) {
        await mutate({ user: j.user as User }, { revalidate: false });
        setHasToken(true);
      } else {
        setHasToken(true);
        await mutate();
      }
    },
    [mutate]
  );

  const logout = useCallback(async () => {
    // optimistic: เคลียร์ก่อน → UI เปลี่ยนทันที
    await mutate({ user: null }, { revalidate: false });
    clearToken();
    setHasToken(false);

    // fire-and-forget
    fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeader(),
    }).catch(() => {});
  }, [mutate]);

  const loadingForUI = (!!key && (isLoading || isValidating)) || !ready;

  const value = useMemo<AuthCtx>(
    () => ({
      user: data?.user ?? null,
      isLoading: loadingForUI,
      error,
      mutate: () => mutate(),
      login,
      register,
      logout,
    }),
    [data?.user, loadingForUI, error, mutate, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within <AuthProvider>');
  return c;
}