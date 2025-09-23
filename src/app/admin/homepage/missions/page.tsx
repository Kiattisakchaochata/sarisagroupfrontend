// src/app/admin/homepage/missions/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import { v4 as uuid } from 'uuid';
import Link from 'next/link';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Mission = { id: string; title: string };

type RawAdminHomepage = {
  hero_title?: string | null;
  hero_subtitle?: string | null;
  missions?:
    | Array<string | { id?: string; title?: string | null }>
    | { subtitle?: string | null; items?: Array<string | { id?: string; title?: string | null }> }
    | null;
  missions_subtitle?: string | null;
  updated_at?: string;
} | null;

function cx(...cn: (string | false | undefined)[]) {
  return cn.filter(Boolean).join(' ');
}

function toArrayMissions(missions: any): { id: string; title: string }[] {
  if (!missions) return [];
  if (!Array.isArray(missions) && typeof missions === 'object' && Array.isArray(missions.items)) {
    missions = missions.items;
  }
  if (!Array.isArray(missions)) return [];
  return missions
    .map((m: any, i: number) => {
      if (typeof m === 'string') {
        const t = m.trim();
        return t ? { id: `m-${i + 1}`, title: t } : null;
      }
      if (m && typeof m === 'object') {
        const t = (m.title ?? '').toString().trim();
        if (!t) return null;
        return { id: m.id ?? `m-${i + 1}`, title: t };
      }
      return null;
    })
    .filter(Boolean) as { id: string; title: string }[];
}

export default function AdminHomepageMissionsPage() {
  // ครอบทั้งหน้าไว้ใน Suspense เพื่อให้ผ่านเงื่อนไข useSearchParams() CSR bailout ของ Next
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-4 md:p-6 text-white">กำลังโหลด…</div>}>
      <AdminHomepageMissionsPageInner />
    </Suspense>
  );
}

/* ===== เนื้อหาเดิมย้ายมาไว้ใน Inner โดยคง logic ทุกอย่างตามเดิม ===== */
function AdminHomepageMissionsPageInner() {
  const { data: raw, mutate, isLoading } = useSWR<RawAdminHomepage>(
    '/admin/homepage',
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false, dedupingInterval: 2000 },
  );

  // ===== SweetAlert2 helpers (กันหน้าเด้ง) =====
  const scrollYRef = useRef(0);
  const lockScroll = () => {
    if (typeof window === 'undefined') return;
    scrollYRef.current = window.scrollY;
    document.documentElement.style.scrollBehavior = 'auto';
    const b = document.body;
    b.style.position = 'fixed';
    b.style.top = `-${scrollYRef.current}px`;
    b.style.left = '0';
    b.style.right = '0';
    b.style.width = '100%';
  };
  const unlockScroll = () => {
    if (typeof window === 'undefined') return;
    const b = document.body;
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.width = '';
    window.scrollTo(0, scrollYRef.current);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = '';
    });
  };
  const Modal = Swal.mixin({
    heightAuto: false,
    scrollbarPadding: false,
    returnFocus: false,
  });

  // local state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [missionSubtitle, setMissionSubtitle] = useState('');
  const [items, setItems] = useState<Mission[]>([]);
  const [saving, setSaving] = useState(false);

  // hydrate
  useEffect(() => {
    if (!raw) return;

    setHeroTitle((raw?.hero_title ?? '').toString());
    setHeroSubtitle((raw?.hero_subtitle ?? '').toString());

    // อ่าน subtitle แบบปลอดภัยชนิด (กัน boolean => 'false')
    let sub = '';
    const sub1 = raw?.missions_subtitle;
    if (typeof sub1 === 'string') sub = sub1;
    else {
      const m = raw?.missions;
      if (m && typeof m === 'object' && !Array.isArray(m) && typeof m.subtitle === 'string') {
        sub = m.subtitle;
      }
    }
    setMissionSubtitle(sub);

    setItems(
      toArrayMissions(raw?.missions ?? []).map((m, idx) => ({
        id: m.id || `m-${idx + 1}`,
        title: m.title,
      })),
    );
  }, [raw]);

  // list ops
  const addItem = () => setItems((s) => [...s, { id: `new-${uuid()}`, title: '' }]);
  const updateItemAt = (idx: number, patch: Partial<Mission>) =>
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItemAt = (idx: number) => setItems((s) => s.filter((_, i) => i !== idx));
  const moveAt = (idx: number, dir: -1 | 1) =>
    setItems((s) => {
      const j = idx + dir;
      if (idx < 0 || j < 0 || idx >= s.length || j >= s.length) return s;
      const clone = [...s];
      const [a] = clone.splice(idx, 1);
      clone.splice(j, 0, a);
      return clone;
    });

  // ให้บันทึกได้แม้ยังไม่มีรายการ (แก้เฉพาะคำโปรย/ฮีโร่ได้)
  const canSave = useMemo(() => !saving, [saving]);

  const onSave = async () => {
    try {
      setSaving(true);

      // Loading modal
      Modal.fire({
        title: 'กำลังบันทึก…',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: lockScroll,
        didOpen: () => Swal.showLoading(),
      });

      // ส่งตามรูปแบบปัจจุบันของ BE
      await apiFetch('/admin/homepage', {
        method: 'PATCH',
        body: {
          hero_title: heroTitle.trim(),
          hero_subtitle: heroSubtitle.trim(),
          missions_subtitle: missionSubtitle.trim(),
          missions: items
            .filter((m) => (m.title ?? '').trim() !== '')
            .map((m, i) => ({
              id: m.id && !m.id.startsWith('new-') ? m.id : undefined,
              title: (m.title ?? '').trim(),
              order: i,
            })),
        },
      });

      await mutate(); // โหลดค่าล่าสุด

      Swal.close();
      await Modal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
        didClose: unlockScroll,
      });
    } catch (e) {
      console.error(e);
      Swal.close();
      await Modal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'โปรดลองใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
        didClose: unlockScroll,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">ตั้งค่าหน้าแรก</h1>
          <p className="text-sm text-gray-400">แก้หัวข้อ Hero และ “พันธกิจของเรา”</p>
        </div>
        <Link href="/" target="_blank" className="text-sm underline underline-offset-2 text-gray-300 hover:text-white">
          เปิดดูหน้าเว็บ
        </Link>
      </header>

      {/* HERO */}
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="text-lg font-medium">หัวข้อ Hero</div>
        <div className="grid gap-3">
          <label className="space-y-1">
            <div className="text-sm text-gray-300">Title</div>
            <input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full rounded bg-white/10 px-3 py-2"
              placeholder="เช่น ธุรกิจเพื่อชุมชน – ขาดทุนไม่ว่า เสียชื่อไม่ได้"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm text-gray-300">Subtitle</div>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full rounded bg-white/10 px-3 py-2 min-h-[70px]"
              placeholder="เช่น ร้านอาหาร • คาเฟ่ • เสริมสวย • คาร์แคร์ ฯลฯ ..."
            />
          </label>
        </div>
      </section>

      {/* MISSIONS */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">พันธกิจของเรา</div>
          <button onClick={addItem} className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm">
            + เพิ่มข้อใหม่
          </button>
        </div>

        {/* คำโปรยใต้หัวข้อพันธกิจ */}
        <label className="block space-y-1">
          <div className="text-sm text-gray-300">คำโปรย/คำบรรยายใต้หัวข้อ “พันธกิจของเรา”</div>
          <textarea
            value={missionSubtitle}
            onChange={(e) => setMissionSubtitle(e.target.value)}
            className="w-full rounded bg-white/10 px-3 py-2 min-h-[60px]"
            placeholder="เช่น เรายืนหยัดเรื่องคุณภาพ ความจริงใจ ฯลฯ"
          />
        </label>

        {isLoading ? (
          <div className="text-gray-300">กำลังโหลด…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">ยังไม่มีรายการ</div>
        ) : (
          <ul className="space-y-2">
            {items.map((m, idx) => (
              <li
                key={m.id || `mission-${idx}`}
                className="rounded-lg bg-white/5 border border-white/10 p-3 flex items-center gap-2"
              >
                <div className="text-xs w-6 text-center opacity-60">{idx + 1}</div>

                <input
                  value={m.title}
                  onChange={(e) => updateItemAt(idx, { title: e.target.value })}
                  className="flex-1 rounded bg-white/10 px-3 py-2"
                  placeholder="พิมพ์ข้อความพันธกิจ…"
                />

                <div className="flex items-center gap-1">
                  <button
                    title="ขึ้น"
                    onClick={() => moveAt(idx, -1)}
                    className={cx('rounded bg-white/10 px-2 py-1 text-xs', idx === 0 && 'opacity-30 pointer-events-none')}
                  >
                    ↑
                  </button>
                  <button
                    title="ลง"
                    onClick={() => moveAt(idx, +1)}
                    className={cx(
                      'rounded bg-white/10 px-2 py-1 text-xs',
                      idx === items.length - 1 && 'opacity-30 pointer-events-none',
                    )}
                  >
                    ↓
                  </button>
                  <button
                    title="ลบ"
                    onClick={() => removeItemAt(idx)}
                    className="rounded bg-red-600/80 hover:bg-red-700 px-2 py-1 text-xs"
                  >
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => mutate()} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm" disabled={saving}>
          โหลดค่าเดิม
        </button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className={cx('rounded-lg px-4 py-2 text-sm', canSave ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white/10 opacity-60')}
        >
          {saving ? 'กำลังบันทึก…' : 'บันทึก'}
        </button>
      </div>
    </div>
  );
}