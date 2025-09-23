// src/app/api/admin/stores/home/featured/route.ts
import { NextResponse } from 'next/server';


export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ดึง “ทุกร้าน” ที่เปิด featured พร้อมภาพที่ติ๊กแสดงหน้าแรก
    // ❗️ห้ามใส่ take ที่ระดับ query เพื่อไม่ตัดรวม
    const stores = await prisma.store.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' },
      include: {
        images: {
          where: { is_featured_home: true },
          orderBy: { featured_order: 'asc' },
          // no take here
        },
      },
    });

    // จำกัด 10 รูป "ต่อร้าน" ที่นี่เท่านั้น
    const groups = stores.map((s) => ({
      store_id: s.id,
      store_slug: s.slug,
      store_name: s.name,
      store_order: s.order ?? 999999,
      items: s.images.slice(0, 10).map((img) => ({
        image_id: img.id,
        image_url: img.url,
        menu_name: img.menu_name ?? null,
        price: img.price ?? null,
        featured_order: img.featured_order ?? null,
      })),
    }));

    // ให้หน้าแอดมินใช้ groups เท่านั้น เพื่อตัดปัญหา payload เก่า
    return NextResponse.json(
      { groups },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ groups: [] }, { status: 500 });
  }
}