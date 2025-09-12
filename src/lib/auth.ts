// src/lib/auth.ts
'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877';

/** ---------- token helpers (ฝั่ง client เท่านั้น) ---------- */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
function setToken(raw: string) {
  const jwt = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;
  try { localStorage.setItem('token', jwt); } catch {}
}
function clearToken() {
  try { localStorage.removeItem('token'); } catch {}
}
function authHeader(): HeadersInit | undefined {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : undefined;
}

/** ---------- types ---------- */
type User = { id: string; name: string; email: string; role: string };

/** ---------- API functions ที่ AuthContext.tsx เรียกใช้ ---------- */
export async function getMe(): Promise<User | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
    headers: authHeader(),
  });

  if (res.status === 401) return null;

  const text = await res.text();
  if (!res.ok) {
    // โยน error ที่อ่านง่ายเวลา dev
    try {
      const j = text ? JSON.parse(text) : {};
      throw new Error(j.message || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }

  const j = text ? JSON.parse(text) : {};
  // รองรับทั้ง { user: {...} } และ object ผู้ใช้ตรง ๆ
  if (j?.user) return j.user as User;
  if (j?.id && (j?.email || j?.name)) return j as User;
  return null;
}

export async function login(email: string, password: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  if (!res.ok) {
    try { const j = JSON.parse(text); throw new Error(j.message || 'เข้าสู่ระบบไม่สำเร็จ'); }
    catch { throw new Error(text || 'เข้าสู่ระบบไม่สำเร็จ'); }
  }

  const j = text ? JSON.parse(text) : {};
  if (j?.token) setToken(j.token);

  // ถ้า backend ส่ง user มาก็คืนให้เลย
  if (j?.user) return j.user as User;
  // ไม่งั้นค่อยเรียก /me อีกครั้งเพื่อดึง user (ปล่อยให้ caller ทำเอง)
  return null;
}

export async function logout(): Promise<void> {
  // fire-and-forget แจ้งเซิร์ฟเวอร์
  fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeader(),
  }).catch(() => {});

  clearToken();
}

/** ถ้าที่อื่นอยากใช้ helper ก็ export ไว้ (ไม่จำเป็นสำหรับ AuthContext.tsx) */
export { getToken, setToken, clearToken, authHeader };