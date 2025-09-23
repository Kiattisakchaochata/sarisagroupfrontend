'use client';

import StoreForm from '@/components/admin/store/StoreForm';

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <StoreForm mode="create" />
    </div>
  );
}