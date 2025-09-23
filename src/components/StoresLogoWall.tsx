// src/components/StoresLogoWall.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

type StoreLogo = {
  id: string;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
  contain?: boolean; // ✅ ควบคุม object-contain ต่อการ์ด
};

export default function StoresLogoWall({
  items = [],
  title = 'ร้านในเครือของเรา',
}: {
  items?: StoreLogo[];
  title?: string;
}) {
  const stores: StoreLogo[] = Array.isArray(items) ? items : [];

  return (
    <section className="mt-12">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {stores.length === 0 ? (
        <div className="text-sm text-gray-500">ยังไม่มีรายการโลโก้</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stores.map((s) => {
            const imgClass = s.contain ? 'object-contain p-4' : 'object-cover';
            const href = `/stores/${s.id}/featured`; // ✅ ลิงก์ด้วย id เสมอ

            return (
              <div
                key={s.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white"
              >
                {/* ✅ ทำให้รูปคลิกได้ไปที่หน้า featured */}
                {s.logo_url ? (
                  <Link href={href} prefetch={false} aria-label={`เยี่ยมชม ${s.name}`}>
                    <div className="relative w-full aspect-[16/12] hover:opacity-95 transition">
                      <Image
                        src={s.logo_url}
                        alt={s.name}
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className={imgClass}
                      />
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={href}
                    prefetch={false}
                    className="h-36 md:h-40 flex items-center justify-center text-sm opacity-60 hover:opacity-80 transition"
                    aria-label={`เยี่ยมชม ${s.name}`}
                  >
                    LOGO
                  </Link>
                )}

                {/* ปุ่มลิงก์ไปหน้า featured (แยกบล็อก ไม่ซ้อน <a> บนกัน) */}
                <div className="p-3 flex justify-center">
                  <Link
                    href={href}
                    prefetch={false}
                    className="px-4 py-2 rounded-full bg-white text-gray-800 text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                    aria-label={`เยี่ยมชม ${s.name}`}
                    title={`เยี่ยมชม ${s.name}`}
                  >
                    เยี่ยมชมร้านเราดูก่อนได้
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}