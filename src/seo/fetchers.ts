// src/seo/fetchers.ts
export async function fetchSiteSeo() {
  const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8877').replace(/\/$/, '');
  const API = /\/api$/.test(base) ? base : `${base}/api`;
  const res = await fetch(`${API}/admin/seo/site`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPageSeoByPath(path: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8877').replace(/\/$/, '');
  const API = /\/api$/.test(base) ? base : `${base}/api`;
  const res = await fetch(`${API}/admin/seo/page?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}