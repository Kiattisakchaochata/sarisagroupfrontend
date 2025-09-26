// src/app/admin/brand/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Swal } from '@/lib/swal';
import UploadButton from '@/components/admin/UploadButton';

type Brand = {
  brandName?: string|null;
  themeColor?: string|null;
  manifestUrl?: string|null;
  icon16?: string|null; icon32?: string|null;
  apple57?: string|null; apple60?: string|null; apple72?: string|null; apple76?: string|null;
  apple114?: string|null; apple120?: string|null; apple144?: string|null; apple152?: string|null; apple180?: string|null;
  ogDefault?: string|null;
};

export default function BrandingPage() {
  const [v, setV] = useState<Brand>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await apiFetch<{ item: Brand }>('/admin/brand'); // ✅ ถูกต้อง: ไม่ต้องมี /api
      setV(res.item || {});
    } catch (e:any) {
      Swal.fire({ icon:'error', title:'โหลดไม่สำเร็จ', text: e?.message || '' });
    }
  };

  useEffect(()=>{ load(); }, []);

  const save = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await apiFetch('/admin/brand', { // ✅ ถูกต้อง
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(v),
      });
      Swal.fire({ icon:'success', title:'บันทึกสำเร็จ' });
      load();
    } catch (e:any) {
      Swal.fire({ icon:'error', title:'บันทึกไม่สำเร็จ', text: e?.message || '' });
    } finally { setLoading(false); }
  };

  const Field = (p:{
    label:string; name: keyof Brand; placeholder?:string; suffix?: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{p.label}</label>
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-400"
          placeholder={p.placeholder}
          value={(v[p.name] as string) ?? ''}
          onChange={(e)=>setV(s=>({...s, [p.name]: e.target.value }))}
        />
        {p.suffix}
      </div>
    </div>
  );

  return (
    <main className="container mx-auto max-w-4xl px-4 md:px-6 py-10 text-white space-y-6">
      <h1 className="text-2xl font-semibold">Site Branding / Assets</h1>

      <div className="grid gap-5 rounded-2xl border border-white/10 bg-[#101317] p-6">
        <Field label="ชื่อแบรนด์ (แสดงใน title / JSON-LD)" name="brandName" placeholder="ครัวคุณจี๊ด" />
        <Field label="Theme Color (เช่น #000000)" name="themeColor" placeholder="#000000" />
        <Field label="Web Manifest URL" name="manifestUrl" placeholder="/site.webmanifest" />

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="favicon 16x16" name="icon16" placeholder="/favicon/favicon-16x16.png"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, icon16:url}))} label="อัปโหลด" />} />
          <Field label="favicon 32x32" name="icon32" placeholder="/favicon/favicon-32x32.png"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, icon32:url}))} label="อัปโหลด" />} />
          <Field label="apple-icon 57x57" name="apple57"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple57:url}))} />} />
          <Field label="apple-icon 60x60" name="apple60"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple60:url}))} />} />
          <Field label="apple-icon 72x72" name="apple72"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple72:url}))} />} />
          <Field label="apple-icon 76x76" name="apple76"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple76:url}))} />} />
          <Field label="apple-icon 114x114" name="apple114"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple114:url}))} />} />
          <Field label="apple-icon 120x120" name="apple120"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple120:url}))} />} />
          <Field label="apple-icon 144x144" name="apple144"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple144:url}))} />} />
          <Field label="apple-icon 152x152" name="apple152"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple152:url}))} />} />
          <Field label="apple-icon 180x180" name="apple180"
            suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, apple180:url}))} />} />
        </div>

        <Field label="OG Default (1200x630)" name="ogDefault" placeholder="/og-default.png"
          suffix={<UploadButton onUploaded={(url)=>setV(s=>({...s, ogDefault:url}))} label="อัปโหลด" />} />

        <div className="flex justify-end">
          <button onClick={save} disabled={loading}
            className="rounded-full bg-amber-500 px-5 py-2.5 font-semibold disabled:opacity-60">
            {loading ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>

      <p className="text-sm opacity-80">
        ใส่เป็นพาธภายใน (เช่น <code>/favicon/favicon-32x32.png</code>) หรือเป็น URL CDN/Cloudinary ก็ได้
      </p>
    </main>
  );
}