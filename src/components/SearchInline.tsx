'use client';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

/* 👇 helper เหมือนไฟล์อื่น ๆ */
function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8877';
  const trimmed = raw.replace(/\/$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}
const API = getApiBase();

type Store = {
  id: string;
  name: string;
  description?: string;
  cover_image?: string | null;
  category?: { name: string };
};

export default function SearchInline({
  className = '',
  onSubmit,
}: {
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}) {
  const router = useRouter();
  const [rawQuery, setRawQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // debounce 300ms
  const [query, setQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  /* 🔁 SWR ใช้ URL จาก BE */
  const { data } = useSWR<{ stores: Store[] }>(
    query ? `${API}/stores/search?q=${encodeURIComponent(query)}` : null,
    async (url: string) => {
      const r = await fetch(url, { credentials: 'include' });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    { revalidateOnFocus: false }
  );
  const stores: Store[] = useMemo(() => data?.stores ?? [], [data]);

  /* ✅ กด Enter แล้วค้นหาทันที (ไม่รอ debounce) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);

    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    let list = stores;

    if (!list.length) {
      try {
        const r = await fetch(`${API}/stores/search?q=${encodeURIComponent(q)}`, {
          credentials: 'include',
        });
        if (r.ok) {
          const j = await r.json();
          list = Array.isArray(j?.stores) ? j.stores : [];
        }
      } catch {}
    }

    if (!list.length) return;

    const exact = list.find((s) => s.name?.toLowerCase() === q);
    const starts = list.find((s) => s.name?.toLowerCase().startsWith(q));
    const contains = list.find((s) => s.name?.toLowerCase().includes(q));
    const target = exact || starts || contains || list[0];

    router.push(`/stores/${target.id}/featured`);
  };

  const canClear = useMemo(() => rawQuery.length > 0, [rawQuery]);

  return (
    <form onSubmit={handleSubmit} className="m-0">
      <div
        className={[
          'flex items-center gap-2 rounded-full border border-black/10',
          'bg-white/90 backdrop-blur',
          'transition-all shadow-sm focus-within:shadow-md',
          focused ? 'ring-2 ring-indigo-500/20' : '',
          className || 'h-11 md:h-12 w-full',
          'px-4 md:px-5',
        ].join(' ')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gray-500">
          <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <input
          type="text"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="พิมพ์ชื่อร้านที่ต้องการค้นหา..."
          className="w-full bg-transparent outline-none text-[15px] md:text-base"
        />

        {canClear && (
          <button
            type="button"
            onClick={() => setRawQuery('')}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-gray-600 hover:bg-black/10"
            aria-label="ล้างข้อความ"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}