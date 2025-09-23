// src/app/api/stores/home/featured/route.ts
import { NextResponse } from 'next/server';


export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    const items = stores.flatMap((s) =>
      s.images.slice(0, 10).map((img) => ({
        image_id: img.id,
        image_url: img.url,
        alt: img.alt ?? null,
        menu_name: img.menu_name ?? null,
        price: img.price ?? null,
        rating: img.rating ?? 0,
        rating_count: img.rating_count ?? 0,
        featured_order: img.featured_order ?? null,
        store_id: s.id,
        store_slug: s.slug,
        store_name: s.name,
      })),
    );

    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}