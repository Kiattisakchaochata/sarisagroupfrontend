// src/app/admin/stores/new/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import StoreForm from '@/components/admin/store/StoreForm';

export default function NewStorePage() {
  return (
    <Suspense fallback={<div className="space-y-6">กำลังโหลด…</div>}>
      <div className="space-y-6">
        <StoreForm mode="create" />
      </div>
    </Suspense>
  );
}