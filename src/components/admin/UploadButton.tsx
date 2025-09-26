// src/components/admin/UploadButton.tsx
'use client';

import { useRef, useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function UploadButton({
  onUploaded,
  label = 'อัปโหลด',
  accept = 'image/*',
  className = '',
}: {
  onUploaded: (url: string) => void;
  label?: string;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/admin/brand/upload`, { // ✅ ยิงไป backend
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json?.url) throw new Error('อัปโหลดไม่สำเร็จ');
      onUploaded(json.url as string);
    } catch (err: any) {
      alert(err?.message || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
      <button
        type="button"
        onClick={onPick}
        disabled={loading}
        className={className || 'rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm'}
      >
        {loading ? 'กำลังอัปโหลด…' : label}
      </button>
    </>
  );
}