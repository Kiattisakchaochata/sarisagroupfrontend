'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminGate({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    // ยังไม่ล็อกอิน → ส่งไปหน้า login พร้อม redirect กลับ /admin ทีหลังได้
    if (!user) {
      const redirectTo = '/admin';
      const q = new URLSearchParams({
        redirect: redirectTo,
        error: 'ต้องเข้าสู่ระบบก่อน',
      }).toString();
      router.replace(`/login?${q}`);
      return;
    }

    // ล็อกอินแล้วแต่ไม่ใช่ admin → กันเข้า
    if (user.role !== 'admin') {
      router.replace('/?error=ไม่มีสิทธิ์เข้าถึง');
    }
  }, [user, isLoading, router, search]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        กำลังตรวจสอบสิทธิ์…
      </div>
    );
  }

  return <>{children}</>;
}