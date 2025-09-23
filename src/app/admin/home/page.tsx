'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { HomePayload, HomeHero, Missions, HomeRow } from '@/types/home';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Saver<T> = (next: T) => Promise<void>;

export default function AdminHomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await apiFetch<HomePayload>('/admin/home', { method: 'GET' });
        if (on) setData(res);
      } catch (e) {
        if (on) setErr('โหลดข้อมูลไม่สำเร็จ');
      }
    })();
    return () => { on = false; };
  }, []);

  const save: Saver<HomePayload> = async (next) => {
    setSaving(true); setErr(null); setOk(null);
    try {
      await apiFetch('/admin/home', {
        method: 'PUT',
        body: JSON.stringify(next),
      });
      setOk('บันทึกแล้ว');
      setData(next);
    } catch (e) {
      setErr('บันทึกไม่สำเร็จ');
    } finally { setSaving(false); }
  };

  const onChangeHero = (patch: Partial<HomeHero>) => {
    if (!data) return;
    setData({ ...data, hero: { ...data.hero, ...patch } });
  };
  const onChangeMissions = (patch: Partial<Missions>) => {
    if (!data) return;
    setData({ ...data, missions: { ...data.missions, ...patch } });
  };
  const reorderRow = (from: number, to: number) => {
    if (!data) return;
    const rows = [...data.rows];
    const [item] = rows.splice(from, 1);
    rows.splice(to, 0, item);
    setData({ ...data, rows });
  };

  if (!data) {
    return <div className="p-6 text-white">กำลังโหลด…</div>;
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 md:px-6 py-8 text-white space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Homepage</h1>
          <p className="text-slate-300">ตั้งค่าข้อความส่วนหัว, พันธกิจ และแถวต่าง ๆ ของหน้าแรก</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" target="_blank" className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/20">
            เปิดหน้าเว็บ
          </Link>
          <button
            onClick={() => save(data)}
            disabled={saving}
            className="rounded-full bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </header>

      {ok && <div className="rounded-lg border border-emerald-400 bg-emerald-900/30 px-4 py-2 text-emerald-100">{ok}</div>}
      {err && <div className="rounded-lg border border-red-400 bg-red-900/30 px-4 py-2 text-red-100">{err}</div>}

      {/* HERO */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h2 className="text-xl font-semibold">Hero</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">หัวเรื่อง</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none"
              value={data.hero.title}
              onChange={(e) => onChangeHero({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">คำอธิบาย</label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none"
              value={data.hero.subtitle}
              onChange={(e) => onChangeHero({ subtitle: e.target.value })}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.hero.showSearch}
              onChange={(e) => onChangeHero({ showSearch: e.target.checked })}
            />
            แสดงช่องค้นหา
          </label>
        </div>
      </section>

      {/* MISSIONS */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h2 className="text-xl font-semibold">พันธกิจของเรา</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">หัวข้อ</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none"
              value={data.missions.title}
              onChange={(e) => onChangeMissions({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            {data.missions.items.map((it, idx) => (
              <div key={it.id} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none"
                  value={it.text}
                  onChange={(e) => {
                    const items = [...data.missions.items];
                    items[idx] = { ...it, text: e.target.value };
                    onChangeMissions({ items });
                  }}
                />
                <button
                  className="rounded-md bg-red-500/20 hover:bg-red-500/30 px-3 py-2"
                  onClick={() => {
                    const items = data.missions.items.filter((x) => x.id !== it.id);
                    onChangeMissions({ items });
                  }}
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              className="mt-2 rounded-full bg-white/10 px-4 py-2 hover:bg-white/20"
              onClick={() =>
                onChangeMissions({
                  items: [
                    ...data.missions.items,
                    { id: crypto.randomUUID(), text: 'ข้อความใหม่' },
                  ],
                })
              }
            >
              + เพิ่มข้อ
            </button>
          </div>
        </div>
      </section>

      {/* ROWS */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">แถวบนหน้าแรก</h2>
          <button
            className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/20"
            onClick={() => setData({
              ...data,
              rows: [
                ...data.rows,
                {
                  id: crypto.randomUUID(),
                  kind: 'custom',
                  title: 'แถวใหม่',
                  visible: true,
                } as HomeRow,
              ],
            })}
          >
            + เพิ่มแถว
          </button>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, idx) => (
            <article key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg bg-white/10 border border-white/10 px-2 py-1"
                    value={row.kind}
                    onChange={(e) => {
                      const rows = [...data.rows];
                      rows[idx] = { ...row, kind: e.target.value as HomeRow['kind'] };
                      setData({ ...data, rows });
                    }}
                  >
                    <option value="food">ร้านอาหารเด่น</option>
                    <option value="cafe">คาเฟ่ & เครื่องดื่ม</option>
                    <option value="beauty">ร้านเสริมสวย</option>
                    <option value="carcare">คาร์แคร์ & คาเฟ่</option>
                    <option value="events">กิจกรรม</option>
                    <option value="videos">วิดีโอรีวิว</option>
                    <option value="network">ร้านในเครือ</option>
                    <option value="custom">คัสตอม</option>
                  </select>
                  <input
                    className="rounded-lg bg-white/10 border border-white/10 px-3 py-1"
                    value={row.title}
                    onChange={(e) => {
                      const rows = [...data.rows];
                      rows[idx] = { ...row, title: e.target.value };
                      setData({ ...data, rows });
                    }}
                  />
                  <label className="text-sm inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!row.visible}
                      onChange={(e) => {
                        const rows = [...data.rows];
                        rows[idx] = { ...row, visible: e.target.checked };
                        setData({ ...data, rows });
                      }}
                    />
                    แสดงผล
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={idx === 0}
                    onClick={() => reorderRow(idx, idx - 1)}
                    className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    disabled={idx === data.rows.length - 1}
                    onClick={() => reorderRow(idx, idx + 1)}
                    className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => {
                      const rows = data.rows.filter((x) => x.id !== row.id);
                      setData({ ...data, rows });
                    }}
                    className="rounded-md bg-red-500/20 hover:bg-red-500/30 px-3 py-1"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              {/* ตัวเลือกเสริมของแต่ละ kind (ใช้เท่าที่จำเป็น) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  placeholder="ปุ่มดูทั้งหมด (เช่น ดูทั้งหมด)"
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                  value={row.ctaText || ''}
                  onChange={(e) => {
                    const rows = [...data.rows];
                    rows[idx] = { ...row, ctaText: e.target.value };
                    setData({ ...data, rows });
                  }}
                />
                <input
                  placeholder="ลิงก์ปุ่ม (เช่น /stores?cat=food)"
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                  value={row.ctaHref || ''}
                  onChange={(e) => {
                    const rows = [...data.rows];
                    rows[idx] = { ...row, ctaHref: e.target.value };
                    setData({ ...data, rows });
                  }}
                />
                <input
                  placeholder="อ้างอิง storeIds หรือ videoIds (คั่นด้วย , )"
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-2"
                  value={(row.storeIds || row.videoIds || []).join(',')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    const rows = [...data.rows];
                    if (row.kind === 'videos') rows[idx] = { ...row, videoIds: ids };
                    else rows[idx] = { ...row, storeIds: ids };
                    setData({ ...data, rows });
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}