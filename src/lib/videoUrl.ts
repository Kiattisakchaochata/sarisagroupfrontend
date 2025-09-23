// src/lib/videoUrl.ts
export type VideoKind = 'youtube' | 'tiktok';

const YT_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com',
  'youtu.be', 'www.youtu.be',
]);
const TT_HOSTS = new Set([
  'tiktok.com', 'www.tiktok.com', 'm.tiktok.com',
  'vm.tiktok.com', 'vt.tiktok.com',
]);

export function parseVideoUrl(input: string): { kind: VideoKind; id: string; url: string } | null {
  if (!input) return null;
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }

  const host = u.hostname.toLowerCase();

  // ---- YouTube ----
  if (YT_HOSTS.has(host)) {
    if (host.includes('youtu.be')) {
      const id = u.pathname.slice(1).split('/')[0];
      if (id) return { kind: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
      return null;
    }
    const path = u.pathname.replace(/\/+$/, '');
    if (path === '/watch') {
      const id = u.searchParams.get('v');
      if (id) return { kind: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
      return null;
    }
    const shorts = path.startsWith('/shorts/');
    const embed = path.startsWith('/embed/');
    if (shorts || embed) {
      const id = path.split('/')[2];
      if (id) return { kind: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
      return null;
    }
  }

  // ---- TikTok ----
  if (TT_HOSTS.has(host)) {
    const parts = u.pathname.split('/').filter(Boolean);
    const vidIndex = parts.findIndex((p) => p === 'video');
    if (vidIndex !== -1 && parts[vidIndex + 1]) {
      const id = parts[vidIndex + 1].split('?')[0];
      return { kind: 'tiktok', id, url: `https://www.tiktok.com/${parts.slice(0, vidIndex + 2).join('/')}` };
    }
    if (parts[0] === 't' && parts[1]) {
      return { kind: 'tiktok', id: parts[1], url: u.toString() };
    }
  }

  return null;
}