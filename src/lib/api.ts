// src/lib/api.ts

// 🔧 คำนวณ BASE จากได้ทั้ง NEXT_PUBLIC_API_BASE และ NEXT_PUBLIC_API_URL
function computeBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';

  let base = raw.replace(/\/$/, '');
  if (!/\/api$/.test(base)) base += '/api';
  return base;
}

const API_BASE = computeBase();

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sg_token');
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  if (data && typeof data === 'object' && 'error' in data) {
    const m = (data as { error?: unknown }).error;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return fallback;
}

// 🧼 ลอก HTML ออกและยุบช่องว่าง
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// 🧠 map error ที่เจอบ่อย → ข้อความอ่านง่าย
function normalizeErrorText(raw: string): string {
  const s = stripHtml(raw);

  // Prisma unique slug
  if (
    /unique constraint failed/i.test(s) &&
    /(stores_slug_key|slug)/i.test(s)
  ) {
    return 'Slug นี้ถูกใช้แล้ว โปรดเปลี่ยนเป็นค่าอื่น';
  }

  return s;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const headers = new Headers(opts.headers || {});

  // แนบ Bearer token ถ้ามี
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // ถ้าเป็น body obj และไม่ใช่ FormData → แปลงเป็น JSON
  let body = opts.body as any;
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  if (body && !isFormData && typeof body === 'object' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  // join path ให้ถูก (กัน // ซ้อน)
  const url = `${API_BASE}/${String(path).replace(/^\/+/, '')}`;

  const res = await fetch(url, {
    ...opts,
    body,
    headers,
    credentials: 'include',
  });

  // OK (2xx)
  if (res.ok) {
    const text = await res.text();
    if (!text) return {} as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  // Error → พยายาม extract ข้อความจากทั้ง JSON/HTML
  let msg = `API ${res.status}`;
  let raw = '';

  try {
    raw = await res.text();
    if (raw) {
      try {
        const j = JSON.parse(raw);
        msg = getErrorMessage(j, msg);
      } catch {
        msg = normalizeErrorText(raw) || msg;
      }
    }
  } catch {
    // ignore
  }

  const err: any = new Error(msg);
  err.status = res.status;
  err.body = raw;
  throw err;
}