'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css'; // ✅ ให้มีสไตล์ของ SweetAlert2

type StoreLite = {
  id: string;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
  cover_image?: string | null;
};

type AdminConfig = {
  title: string;
  store_ids: string[];
  contain_ids: string[];
};

const cfgKey = '/admin/homepage/network';
const storesKey = '/admin/stores?limit=500';

const cx = (...cn: (string | false | null | undefined)[]) => cn.filter(Boolean).join(' ');

function normalizeStores(resp: any): StoreLite[] {
  if (!resp) return [];
  if (Array.isArray(resp.items)) return resp.items as StoreLite[];
  if (Array.isArray(resp.stores)) return resp.stores as StoreLite[];
  return [];
}

export default function AdminHomepageLogosPage() {
  const { data: cfg, mutate: mutateCfg } = useSWR<AdminConfig>(
    cfgKey,
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false }
  );

  const { data: storesResp, mutate: mutateStores } = useSWR<any>(
    storesKey,
    (url) => apiFetch(url, { method: 'GET' }),
    { revalidateOnFocus: false }
  );

  const storesAll = useMemo(() => normalizeStores(storesResp), [storesResp]);

  const [title, setTitle] = useState('ร้านในเครือของเรา');
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [containIds, setContainIds] = useState<string[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!cfg) return;
    setTitle(cfg.title ?? 'ร้านในเครือของเรา');
    setStoreIds(Array.isArray(cfg.store_ids) ? cfg.store_ids : []);
    setContainIds(Array.isArray(cfg.contain_ids) ? cfg.contain_ids : []);
  }, [cfg]);

  const storeMap = useMemo(() => {
    const m = new Map<string, StoreLite>();
    storesAll.forEach((s) => m.set(s.id, s));
    return m;
  }, [storesAll]);

  const selectedStores: StoreLite[] = useMemo(
    () => storeIds.map((id) => storeMap.get(id)).filter(Boolean) as StoreLite[],
    [storeIds, storeMap]
  );

  const togglePick = (id: string) => {
    setStoreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setStoreIds((arr) => {
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      const clone = [...arr];
      const [a] = clone.splice(idx, 1);
      clone.splice(j, 0, a);
      return clone;
    });
  };

  const toggleContain = (id: string) => {
    setContainIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // ---------- SweetAlert2 helpers ----------
  // ❌ ไม่ต้อง async/await
const showLoading = (title: string): void => {
  void Swal.fire({
    title,
    html: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
};

  const showSuccess = async (title: string) =>
    Swal.fire({ icon: 'success', title, timer: 1300, showConfirmButton: false });

  const showError = async (title: string, text = 'ลองใหม่อีกครั้ง') =>
    Swal.fire({ icon: 'error', title, text });

  // ---------- save config ----------
const onSave = async () => {
  showLoading('กำลังบันทึก…');        // ✅ ห้าม await
  try {
    await apiFetch('/admin/homepage/network', {
      method: 'PATCH',
      body: { title, store_ids: storeIds, contain_ids: containIds },
    });
    await showSuccess('บันทึกสำเร็จ');
    await mutateCfg();
  } catch (e) {
    console.error(e);
    await showError('บันทึกไม่สำเร็จ');
  } finally {
    Swal.close();                       // ✅ ปิด modal เสมอ
  }
};

// ---------- upload logo ----------
const onUploadLogo = async (storeId: string, file: File) => {
  setUploadingId(storeId);
  showLoading('กำลังอัปโหลดโลโก้…');  // ✅ ห้าม await
  try {
    const form = new FormData();
    form.append('file', file);

    const resp = await fetch(`/api/admin/stores/${storeId}/logo`, {
      method: 'PATCH',
      body: form,
      credentials: 'include',
    });
    if (!resp.ok) throw new Error('upload failed');

    await showSuccess('อัปโหลดโลโก้สำเร็จ');
    await mutateStores();
    await globalMutate(storesKey);
  } catch (e) {
    console.error(e);
    await showError('อัปโหลดโลโก้ไม่สำเร็จ');
  } finally {
    setUploadingId(null);
    Swal.close();                       // ✅ ปิด modal เสมอ
  }
};

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ✅ ดัน z-index ของ SweetAlert2 ให้สูงกว่าส่วนอื่น ๆ ในเพจ */}
      <style jsx global>{`
        .swal2-container {
          z-index: 99999 !important;
        }
      `}</style>

      <header>
        <h1 className="text-xl md:text-2xl font-semibold">โลโก้ “ร้านในเครือของเรา”</h1>
        <p className="text-sm text-gray-400">ตั้งชื่อส่วน + เลือกร้าน + อัปโหลดโลโก้</p>
      </header>

      {/* Title */}
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="text-sm text-gray-300">Title</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded bg-white/10 px-3 py-2"
          placeholder="ร้านในเครือของเรา"
        />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {/* เลือกร้านทั้งหมด */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-medium mb-2">เลือกร้านที่จะแสดง</div>
          <div className="max-h-[520px] overflow-auto space-y-2 pr-1">
            {storesAll.length === 0 ? (
              <div className="text-sm text-gray-400">ยังไม่มีร้านในระบบ หรือรูปแบบผลลัพธ์ API ไม่ตรง</div>
            ) : (
              storesAll.map((s) => {
                const picked = storeIds.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center justify-between gap-2 text-sm rounded bg-white/5 p-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={picked} onChange={() => togglePick(s.id)} />
                      <span>{s.name}</span>
                    </div>
                    <span className="opacity-50 text-xs">{s.slug ?? s.id}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* ลำดับ + upload + preview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-medium mb-2">ลำดับที่จะแสดง + อัปโหลดโลโก้</div>

          {selectedStores.length === 0 ? (
            <div className="text-sm text-gray-400">ยังไม่ได้เลือกร้าน</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedStores.map((s, idx) => {
                const contain = containIds.includes(s.id);
                const img = s.logo_url || s.cover_image || '';
                return (
                  <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="relative w-full aspect-[16/12] bg-white">
                      {img ? (
                        <Image
                          src={img}
                          alt={s.name}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className={cx(contain ? 'object-contain p-6' : 'object-cover')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                          ยังไม่มีโลโก้
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{idx + 1}. {s.name}</div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => move(idx, -1)}
                            className="px-2 py-1 rounded bg-white/10 text-xs disabled:opacity-40"
                            disabled={idx === 0}
                            title="ขึ้น"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => move(idx, +1)}
                            className="px-2 py-1 rounded bg-white/10 text-xs disabled:opacity-40"
                            disabled={idx === selectedStores.length - 1}
                            title="ลง"
                          >
                            ↓
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={contain} onChange={() => toggleContain(s.id)} />
                          <span>แสดงแบบ object-contain</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center justify-center px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/20 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const f = e.currentTarget.files?.[0];
                                if (f) onUploadLogo(s.id, f);
                                e.currentTarget.value = '';
                              }}
                            />
                            {/* แสดงข้อความคงที่ ปุ่มจะไม่โชว์ "กำลังอัปโหลด…" อีกต่อไป เพราะเราใช้ SweetAlert2 แทน */}
                            อัปโหลดโลโก้
                          </label>

                          <Link
                            href={`/stores/${s.id}/featured`}
                            target="_blank"
                            className="px-3 py-1.5 text-xs rounded-full bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50"
                          >
                            เยี่ยมชมร้านเราดูก่อนได้
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={onSave} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm">
          บันทึก
        </button>
      </div>
    </div>
  );
}