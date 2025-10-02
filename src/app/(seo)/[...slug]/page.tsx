// src/app/(seo)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchSiteSeo, fetchPageSeoByPath } from '@/seo/fetchers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ ต้อง await params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = '/' + slug.join('/');

  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath(path)]);
  if (!page) return {}; // ถ้าไม่เจอ ให้ตัวเพจไป notFound()

  const title = page.title || site?.meta_title || 'Sarisagroup';
  const description = page.description || site?.meta_description || '';
  const images = [
    ...(Array.isArray(page?.og_images) ? page.og_images : []),
    ...(Array.isArray(site?.og_images) ? site.og_images : []),
    ...(page?.og_image ? [page.og_image] : []),
    ...(site?.og_image ? [site.og_image] : []),
  ].filter(Boolean).map((url) => ({ url }));

  return {
    title,
    description,
    openGraph: { title, description, images, url: path, type: 'website' },
    robots: page.noindex ? { index: false, follow: false } : undefined,
    keywords: site?.keywords || undefined,
  };
}

// ✅ ต้อง await params
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = '/' + slug.join('/');

  const [site, page] = await Promise.all([fetchSiteSeo(), fetchPageSeoByPath(path)]);
  if (!page) return notFound();

  return (
    <>
      <Navbar />
      {/* เนื้อหาหน้าเพจจริงของคุณ เช่น แสดง title/description หรือ content ตาม page.jsonld */}
      <main className="container mx-auto max-w-5xl px-4 md:px-6 py-10 text-white">
        <h1 className="text-2xl font-semibold mb-2">{page.title || site?.meta_title || 'Sarisagroup'}</h1>
        {page.description && <p className="opacity-80">{page.description}</p>}
        {/* …render อื่น ๆ ตามต้องการ… */}
      </main>
      <Footer />
    </>
  );
}