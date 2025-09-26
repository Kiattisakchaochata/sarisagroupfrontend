// src/components/VideoGallery.tsx
'use client';

import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { swrFetcher } from '@/lib/swrFetcher';

type Video = { id: string; title: string; youtube_url: string; thumbnail_url?: string | null };

const isLikelyImageUrl = (u?: string | null) => {
  if (!u) return false;
  try { return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(new URL(u).pathname); }
  catch { return typeof u === 'string' && u.startsWith('/'); }
};
const isExternalHttp = (u?: string | null) => typeof u === 'string' && /^https?:\/\//i.test(u);

/* breakpoint -> คอลัมน์จริง */
function useBreakpoint(): 'sm'|'md'|'xl' {
  const [bp, setBp] = useState<'sm'|'md'|'xl'>('sm');
  useEffect(() => {
    const qMd = window.matchMedia('(min-width:768px)');
    const qXl = window.matchMedia('(min-width:1280px)');
    const update = () => setBp(qXl.matches ? 'xl' : qMd.matches ? 'md' : 'sm');
    update();
    qMd.addEventListener('change', update);
    qXl.addEventListener('change', update);
    return () => { qMd.removeEventListener('change', update); qXl.removeEventListener('change', update); };
  }, []);
  return bp;
}

export default function VideoGallery({
  showHeader = false,
  headerTitle = 'วิดีโอรีวิว',
  allHref = '/videos',
}: { showHeader?: boolean; headerTitle?: string; allHref?: string }) {
  // ⬇️ hooks ต้องอยู่ top-level เสมอ
  const { data, error, isLoading } = useSWR<{ videos: Video[]; total: number }>(
    '/api/videos?active=1&take=24',
    swrFetcher
  );
  const videos = data?.videos ?? [];
  const bp = useBreakpoint();

  const cols = bp === 'xl' ? 4 : bp === 'md' ? 3 : 2;
  const pageSize = cols * 2;

  const pagesData = useMemo(() => {
    const out: Video[][] = [];
    for (let i = 0; i < videos.length; i += pageSize) {
      out.push(videos.slice(i, i + pageSize));
    }
    return out;
  }, [videos, pageSize]);

  const pages = Math.max(1, pagesData.length);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [pageSize, videos.length]);

  // ✅ hooks ที่เกี่ยวกับ scroll ต้องมาก่อนเงื่อนไข return
  const viewportRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = Math.round(el.scrollLeft / el.clientWidth);
        setPage(Math.max(0, Math.min(p, pages - 1)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', onScroll); };
  }, [pages]);

  const goTo = (p: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(p, pages - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' });
  };

  // ❗️หลังจากประกาศ hooks ครบแล้ว ค่อย early-return ได้
  if (error) return null;

  return (
    <section className="mt-6 relative">
      {showHeader && (
        <div className="section-header">
          <h2 className="section-title">{headerTitle}</h2>
          <Link href={allHref} className="link-pill">ดูทั้งหมด</Link>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={viewportRef}
            className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory touch-pan-x select-none no-scrollbar"
          >
            <div className="flex">
              {pagesData.map((pageItems, idx) => (
                <div key={idx} className="snap-center shrink-0 w-full px-0">
                  <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {pageItems.map((v) => (
                      <a
                        key={v.id}
                        href={v.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="card flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          {isLikelyImageUrl(v.thumbnail_url) ? (
                            isExternalHttp(v.thumbnail_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={v.thumbnail_url as string}
                                alt={v.title}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Image
                                src={v.thumbnail_url as string}
                                alt={v.title}
                                fill
                                className="object-cover"
                                sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-xs font-medium text-white/90">
                              <div className="px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                Video
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3 flex flex-col">
                          <h3 className="text-sm font-medium leading-5 line-clamp-2 overflow-hidden text-ellipsis">
                            {v.title}
                          </h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    page === i
                      ? 'bg-amber-600 scale-110 shadow-[0_0_0_4px_rgba(212,160,23,.15)]'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}