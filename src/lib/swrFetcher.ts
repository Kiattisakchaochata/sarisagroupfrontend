// src/lib/swrFetcher.ts
export const apiBase =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:8877';

export async function swrFetcher(input: string, init?: RequestInit) {
  const url = input.startsWith('http')
    ? input
    : `${apiBase}${input.startsWith('/') ? input : `/${input}`}`;

  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// alias (บางไฟล์ใช้ชื่อ fetcher)
export const fetcher = swrFetcher;