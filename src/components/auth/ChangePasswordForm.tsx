'use client';

import { useState } from 'react';

export default function ChangePasswordForm({ onSubmit }: { onSubmit: (oldPw: string, newPw: string) => Promise<void> }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      await onSubmit(oldPw, newPw);
      setOk('เปลี่ยนรหัสผ่านสำเร็จ');
      setOldPw('');
      setNewPw('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* ...input ต่าง ๆ ของเดิม... */}
    </form>
  );
}