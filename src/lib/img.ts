// src/lib/img.ts
export function normalizeUnsplashUrl(url: string, w = 1600, q = 80) {
  if (!url) return url;

  try {
    const u = new URL(url);

    // ✅ จำกัดเฉพาะ domain unsplash เท่านั้น
    if (!u.hostname.includes('unsplash.com')) return url;

    // ✅ set/override params ที่เราต้องการ
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('w', String(w));
    u.searchParams.set('q', String(q));

    return u.toString();
  } catch {
    // ถ้า new URL ล้มเหลว (url ไม่ valid) → return เดิม
    return url;
  }
}