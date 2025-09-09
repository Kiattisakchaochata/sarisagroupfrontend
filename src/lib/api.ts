export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8877';

export async function apiGet<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // หน้า Home ขอสด ๆ
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(`GET ${path} ${res.status}: ${text}`);
  }
  return res.json();
}