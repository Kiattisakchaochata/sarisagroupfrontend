'use client';
import Image from 'next/image';
import Link from 'next/link';

type Store = {
  id: string;
  name: string;
  description?: string;
  cover_image?: string | null;
  category?: { name: string };
};

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/stores/${store.id}`} className="card bg-base-100 shadow hover:shadow-md transition rounded-2xl">
      <figure className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-base-200 relative">
        {store.cover_image ? (
          <Image src={store.cover_image} alt={store.name} fill className="object-cover" sizes="(min-width:1024px) 25vw, 50vw" />
        ) : (
          <div className="w-full h-full grid place-items-center opacity-70">ไม่มีรูป</div>
        )}
      </figure>
      <div className="card-body p-4">
        <h3 className="text-base font-semibold line-clamp-1">{store.name}</h3>
        {store.category?.name ? (
          <div className="badge badge-outline badge-sm">{store.category.name}</div>
        ) : null}
        {store.description ? (
          <p className="text-sm text-base-content/70 line-clamp-2 mt-1">{store.description}</p>
        ) : null}
      </div>
    </Link>
  );
}