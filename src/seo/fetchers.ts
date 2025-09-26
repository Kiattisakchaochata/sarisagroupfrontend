// src/seo/fetchers.ts
const API = process.env.NEXT_PUBLIC_API_BASE!;
const ADMIN_TOKEN = process.env.SEO_ADMIN_TOKEN; // server-only

async function safeFetchJSON<T = any>(url: string): Promise<T | null> {
  // 👉 LOG ก่อนยิง
  console.log('[SEO] fetch:', url, 'token?', !!ADMIN_TOKEN);

  const res = await fetch(url, {
    headers: ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {},
    cache: 'no-store',
    // @ts-ignore
    next: { revalidate: 0 },
  });

  // 👉 LOG หลังยิง
  console.log('[SEO] status:', res.status, res.statusText);

  if (!res.ok) {
    // อ่าน body ออกมา log (ไม่ throw จะยังคืน null ต่อ)
    const text = await res.text().catch(() => null);
    console.log('[SEO] error body:', text);
    return null;
  }
  return res.json();
}

export const fetchSiteSeo = () => safeFetchJSON(`${API}/api/admin/seo/site`);
export const fetchPageSeoByPath = (path: string) =>
  safeFetchJSON(`${API}/api/admin/seo/page?path=${encodeURIComponent(path || '/')}`);

export async function buildSeoForPath(path: string) {
  const [site, page] = await Promise.all([
    fetchSiteSeo(),
    fetchPageSeoByPath(path || '/'),
  ]);
  return { site: site ?? {}, page: page ?? {} };
}