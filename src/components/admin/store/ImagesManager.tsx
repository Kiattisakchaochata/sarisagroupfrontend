//src/components/store/ImagesManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type ImageItem = {
  id: string;
  image_url: string;
  order_number: number;
  alt_text?: string | null;
};

export default function ImagesManager({ storeId }: { storeId: string }) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [order, setOrder] = useState<number>(items.length + 1);
  const [thumbContain, setThumbContain] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ImageItem[]>(`/admin/stores/${storeId}/images`);
      setItems(data.sort((a, b) => a.order_number - b.order_number));
      setOrder(data.length + 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    await apiFetch(`/admin/stores/${storeId}/images`, {
      method: 'POST',
      body: JSON.stringify({
        image_url: imageUrl.trim(),
        alt_text: altText.trim() || null,
        order_number: order || items.length + 1,
      }),
    });
    setImageUrl('');
    setAltText('');
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('ลบรูปนี้?')) return;
    await apiFetch(`/admin/stores/${storeId}/images/${id}`, { method: 'DELETE' });
    await load();
  };

  const bump = async (id: string, dir: -1 | 1) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const newOrder = current.order_number + dir;
    await apiFetch(`/admin/stores/${storeId}/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ order_number: newOrder }),
    });
    await load();
  };

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-3">รูปภาพของร้าน</h3>

      <form onSubmit={add} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="block md:col-span-2">
            <div className="mb-1 text-sm text-slate-300">Image URL *</div>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              placeholder="https://cdn.example.com/.."
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-slate-300">Alt text</div>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="คำอธิบายภาพ"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-slate-300">Order</div>
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value || '1'))}
              min={1}
            />
          </label>
        </div>
        <button type="submit" className="rounded-full bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600">
          เพิ่มรูป
        </button>
      </form>
      {/* สลับโหมดแสดงผลรูปย่อย */}
<div className="mt-3">
  <label className="inline-flex items-center gap-2 text-sm text-slate-300">
    <input
      type="checkbox"
      checked={thumbContain}
      onChange={(e) => setThumbContain(e.target.checked)}
    />
    แสดงแบบ <code>object-contain</code>
  </label>
</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-slate-300">กำลังโหลด…</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400">ยังไม่มีรูป</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="aspect-[4/3] bg-white">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src={it.image_url}
    alt={it.alt_text ?? ''}
    className={`h-full w-full ${thumbContain ? 'object-contain' : 'object-cover'}`}
  />
</div>
              <div className="p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="text-slate-200">#{it.order_number}</div>
                  <div className="text-slate-400 truncate max-w-[220px]">{it.alt_text || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => bump(it.id, -1)} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">↑</button>
                  <button onClick={() => bump(it.id, +1)} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">↓</button>
                  <button onClick={() => remove(it.id)} className="rounded-lg bg-red-600 px-2 py-1 hover:bg-red-700">ลบ</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}