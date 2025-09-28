// src/components/store/StoreCard.tsx
import Link from "next/link";
import Image from "next/image";

export type StoreCardData = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  image_fit?: "cover" | "contain"; // ✅ เพิ่มเพื่อบังคับการแสดงผลรูป
};

export default function StoreCard({ store }: { store: StoreCardData }) {
  const fitClass =
    store.image_fit === "contain" ? "object-contain" : "object-cover";

  return (
    <Link
      href={`/stores/${store.id}/featured`}
      className="card bg-base-100 shadow hover:shadow-md transition rounded-2xl"
    >
      <figure className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-base-200 relative">
        {store.cover_image ? (
          <Image
            src={store.cover_image}
            alt={store.name}
            fill
            className={fitClass}             // ✅ ใช้ค่าจาก image_fit
            sizes="(min-width:1024px) 25vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            ไม่มีภาพ
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-lg">{store.name}</h2>
        <p className="text-sm text-gray-500 line-clamp-2">
          {store.description || "ไม่มีคำอธิบาย"}
        </p>
      </div>
    </Link>
  );
}