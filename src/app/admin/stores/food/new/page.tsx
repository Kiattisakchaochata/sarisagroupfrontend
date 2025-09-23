// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import StoreForm, { type StorePayload } from '@/components/admin/store/StoreForm';
// import { apiFetch } from '@/lib/api';

// type CategoryLite = { id: string; name: string };

// export default function NewStorePage() {
//   const [cats, setCats] = useState<CategoryLite[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await apiFetch<CategoryLite[]>('/admin/categories-lite');
//         setCats(data);
//       } catch {
//         setCats([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   return (
//     <main className="max-w-5xl mx-auto">
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">สร้างร้านค้า</h1>
//         <Link href="/admin" className="rounded-full bg-white/10 px-4 py-2 hover:bg-white/20">← กลับแดชบอร์ด</Link>
//       </div>

//       {loading ? (
//         <div className="text-slate-300">กำลังโหลด…</div>
//       ) : (
//         <StoreForm mode="create" categories={cats} />
//       )}
//     </main>
//   );
// }