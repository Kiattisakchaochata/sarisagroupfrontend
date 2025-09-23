// src/app/page.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import HomeClient from '@/components/home/HomeClient';
import type { Metadata } from 'next';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8877').replace(/\/$/, '');
const API = /\/api$/.test(API_BASE) ? API_BASE : `${API_BASE}/api`;

// ⬅️ เพิ่มเฉพาะส่วนนี้
export async function generateMetadata(): Promise<Metadata> {
  let page: any = null;
  try {
    const res = await fetch(`${API}/admin/seo/page?path=/`, { cache: 'no-store' });
    if (res.ok) page = await res.json();
  } catch {}

  let site: any = null;
  try {
    const res = await fetch(`${API}/admin/seo/site`, { cache: 'no-store' });
    if (res.ok) site = await res.json();
  } catch {}

  const title = page?.title || site?.meta_title || 'Sarisagroup | รวมธุรกิจชุมชน';
  const description =
    page?.description || site?.meta_description || 'โปรโมตธุรกิจชุมชนอย่างยั่งยืน';
  const ogImage = page?.og_image || site?.og_image || '/og-default.jpg';

  return {
    title,
    description,
    robots: page?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: 'Sarisagroup',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Sarisagroup' }],
      locale: 'th_TH',
      type: 'website',
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  };
}
// ----------------------------

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'Sarisagroup',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sarisagroup',
    url: siteUrl,
    logo: `${siteUrl}/apple-touch-icon.png`,
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={orgJsonLd} />

      <Navbar />
      <HomeClient />
      <Footer />
    </>
  );
}