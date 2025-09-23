'use client';

import { useEffect, useMemo, useState } from 'react';
import { Swal } from '@/lib/swal';
import { apiFetch } from '@/lib/api';

type TrackingProvider = 'GA4' | 'GTM' | 'FacebookPixel' | 'TikTokPixel' | 'Custom';
type ScriptPlacement  = 'HEAD' | 'BODY_END';
type ScriptStrategy   = 'afterInteractive' | 'lazyOnload' | 'worker';

type TrackingScript = {
  id: string;
  provider: TrackingProvider;
  trackingId?: string | null;
  script?: string | null;
  placement: ScriptPlacement;
  strategy: ScriptStrategy;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminTrackingPage() {
  const [rows, setRows] = useState<TrackingScript[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [editing, setEditing] = useState<Partial<TrackingScript> | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoadErr('');
    try {
      const res = await apiFetch<{ items: TrackingScript[] }>('/admin/tracking');
      setRows(res.items ?? []);
    } catch (e: any) {
      setLoadErr(e?.message || 'โหลดข้อมูลไม่สำเร็จ');
    }
  };

  useEffect(() => { refresh(); }, []);

  const sorted = useMemo(
    () => rows.slice().sort((a,b) => a.provider.localeCompare(b.provider)),
    [rows]
  );

  const startNew = () => setEditing({
    provider: 'GA4',
    placement: 'HEAD',
    strategy: 'afterInteractive',
    enabled: true,
  });

  const onSave = async () => {
    if (!editing?.provider) { Swal.fire({ icon:'warning', title:'โปรดเลือก provider' }); return; }
    if (loading) return;
    setLoading(true);
    try {
      await apiFetch('/admin/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      await Swal.fire({ icon:'success', title:'บันทึกสำเร็จ', confirmButtonText:'ตกลง' });
      setEditing(null);
      await refresh();
    } catch (e:any) {
      Swal.fire({ icon:'error', title:'บันทึกไม่สำเร็จ', text: e?.message || '' });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = await Swal.fire({ icon:'warning', title:'ลบรายการนี้?', showCancelButton:true, confirmButtonText:'ลบ', cancelButtonText:'ยกเลิก' }).then(r=>r.isConfirmed);
    if (!ok) return;
    try {
      await apiFetch(`/admin/tracking/${id}`, { method: 'DELETE' });
      await refresh();
      Swal.fire({ icon:'success', title:'ลบสำเร็จ', timer:1200, showConfirmButton:false });
    } catch (e:any) {
      Swal.fire({ icon:'error', title:'ลบไม่สำเร็จ', text: e?.message || '' });
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 md:px-6 py-10 text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tracking Scripts</h1>
        <button onClick={startNew} className="rounded-full bg-amber-500 text-white px-5 py-2.5 font-semibold">
          + สร้าง
        </button>
      </div>

      {loadErr && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 p-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold">โหลดข้อมูลไม่สำเร็จ</div>
            <div className="text-sm opacity-90 break-all">{loadErr}</div>
            <div className="text-xs mt-1 opacity-70">ตรวจสอบว่า backend เปิด <code>/api/admin/tracking</code> แล้ว</div>
          </div>
          <button onClick={refresh} className="shrink-0 rounded-full bg-red-500/20 hover:bg-red-500/30 px-3 py-1 text-sm">ลองใหม่</button>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#111418] shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300">
                <th className="p-3 w-36">Provider</th>
                <th className="p-3">Tracking ID</th>
                <th className="p-3">Placement</th>
                <th className="p-3">Strategy</th>
                <th className="p-3">Enabled</th>
                <th className="p-3 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="p-3">{r.provider}</td>
                  <td className="p-3">{r.trackingId || (r.script ? '(custom snippet)' : '—')}</td>
                  <td className="p-3">{r.placement}</td>
                  <td className="p-3">{r.strategy}</td>
                  <td className="p-3">{r.enabled ? '✅' : '—'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(r)} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15">แก้ไข</button>
                      <button onClick={() => onDelete(r.id)} className="px-3 py-1 rounded-full bg-red-600/80 hover:bg-red-600">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && !loadErr && <tr><td className="p-4 text-gray-400" colSpan={6}>ยังไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditModal
          editing={editing}
          setEditing={setEditing}
          onSave={onSave}
          loading={loading}
        />
      )}
    </main>
  );
}

function EditModal({
  editing, setEditing, onSave, loading,
}: {
  editing: Partial<TrackingScript>;
  setEditing: (v: any) => void;
  onSave: () => void;
  loading: boolean;
}) {
  const providers: TrackingProvider[] = ['GA4', 'GTM', 'FacebookPixel', 'TikTokPixel', 'Custom'];
  const placements: ScriptPlacement[] = ['HEAD', 'BODY_END'];
  const strategies: ScriptStrategy[] = ['afterInteractive', 'lazyOnload', 'worker'];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1115] shadow-2xl">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold">{editing?.id ? 'แก้ไข' : 'สร้าง'} Tracking Script</h2>
        </div>

        <div className="px-6 pb-6 mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Provider">
            <select
              className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
              value={editing.provider ?? 'GA4'}
              onChange={(e) => setEditing((s:any)=>({ ...s, provider: e.target.value as TrackingProvider }))}
            >
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          {/* แสดงช่อง Tracking ID สำหรับ GA4/GTM/FB/TikTok */}
          {editing.provider !== 'Custom' && (
            <Field label="Tracking ID">
              <input
                className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                placeholder={editing.provider === 'GA4' ? 'G-XXXXXXX' :
                            editing.provider === 'GTM' ? 'GTM-XXXXXX' :
                            editing.provider === 'FacebookPixel' ? 'FB-PIXEL-ID' :
                            editing.provider === 'TikTokPixel' ? 'TT-PIXEL-ID' : ''}
                value={editing.trackingId ?? ''}
                onChange={(e)=>setEditing((s:any)=>({ ...s, trackingId: e.target.value }))}
              />
            </Field>
          )}

          {/* Custom snippet (ถ้าต้องการ) */}
          <Field label="Custom Script (optional)">
            <textarea
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none font-mono text-sm"
              placeholder="วาง <script>...</script> หรือโค้ดพิเศษ"
              value={editing.script ?? ''}
              onChange={(e)=>setEditing((s:any)=>({ ...s, script: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Placement">
              <select
                className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={editing.placement ?? 'HEAD'}
                onChange={(e)=>setEditing((s:any)=>({ ...s, placement: e.target.value as ScriptPlacement }))}
              >
                {placements.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Strategy">
              <select
                className="w-full rounded-lg border border-white/10 bg-[#1a1f27] px-3 py-2 outline-none"
                value={editing.strategy ?? 'afterInteractive'}
                onChange={(e)=>setEditing((s:any)=>({ ...s, strategy: e.target.value as ScriptStrategy }))}
              >
                {strategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Enabled">
              <div className="h-[42px] flex items-center">
                <input
                  type="checkbox"
                  checked={!!editing.enabled}
                  onChange={(e)=>setEditing((s:any)=>({ ...s, enabled: e.target.checked }))}
                />
                <span className="ml-2 text-sm">ใช้งาน</span>
              </div>
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0f1115] px-6 pb-6 pt-3 rounded-b-2xl flex justify-end gap-2">
          <button onClick={()=>setEditing(null)} className="rounded-full px-4 py-2 bg-white/10 hover:bg-white/15">ยกเลิก</button>
          <button onClick={onSave} disabled={loading} className="rounded-full px-5 py-2 bg-amber-500 text-white font-semibold disabled:opacity-60">
            {loading ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm">{label}</label>
      {children}
    </div>
  );
}