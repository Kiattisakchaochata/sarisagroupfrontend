// src/lib/img.ts
export function normalizeUnsplashUrl(url: string, w = 1600, q = 80) {
  if (!url) return url;
  const hasQuery = url.includes('?');
  const params = `auto=format&fit=crop&w=${w}&q=${q}`;
  // ถ้า url มี query อยู่แล้ว -> เติมด้วย &
  return hasQuery ? `${url}&${params}` : `${url}?${params}`;
}