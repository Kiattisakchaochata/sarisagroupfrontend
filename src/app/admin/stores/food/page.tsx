// 'use client';

// import { useState, useEffect } from 'react';
// import { apiFetch } from '@/lib/api';
// import Link from 'next/link';

// type Store = {
//   id: string;
//   name: string;
//   desc?: string;
//   images: { id: string; url: string }[];
//   avgRating?: number;
// };

// export default function FoodAdminPage() {
//   const [stores, setStores] = useState<Store[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await apiFetch<Store[]>('/admin/stores?type=food');
//         setStores(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   return (
//     <main className="container mx-auto px-4 py-8 text-white">
//       <header className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">จัดการร้านอาหาร</h1>
//         <Link
//           href="/admin/stores/food/new"
//           className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
//         >
//           + เพิ่มร้านอาหาร
//         </Link>
//       </header>

//       {loading && <p>กำลังโหลด...</p>}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {stores.map((s) => (
//           <Link
//             key={s.id}
//             href={`/admin/stores/food/${s.id}`}
//             className="rounded-xl bg-white/5 p-4 hover:shadow-lg transition"
//           >
//             <div className="font-semibold text-lg mb-2">{s.name}</div>
//             <div className="text-sm text-gray-400 line-clamp-2">{s.desc}</div>

//             {/* แสดงแค่ 10 รูป */}
//             <div className="mt-2 grid grid-cols-5 gap-2">
//               {s.images.slice(0, 10).map((img) => (
//                 <img
//                   key={img.id}
//                   src={img.url}
//                   alt={s.name}
//                   className="w-full h-16 object-cover rounded"
//                 />
//               ))}
//             </div>

//             <div className="mt-2 text-sm text-gray-300">
//               ⭐ {s.avgRating?.toFixed(1) ?? '-'} / 5
//             </div>
//           </Link>
//         ))}
//       </div>
//     </main>
//   );
// }