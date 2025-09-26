// src/components/SeoJsonLd.tsx
import 'server-only';
import JsonLd from '@/components/JsonLd';

type Props = {
  path: string;
  title: string;
  description?: string;
  images?: string[];
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function abs(u?: string) {
  if (!u) return undefined;
  try { return new URL(u, SITE_URL + '/').toString(); } catch { return undefined; }
}

export default function SeoJsonLd({ path, title, description = '', images = [] }: Props) {
  const url = abs(path || '/')!;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    headline: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sarisagroup' },
    image: images.filter(Boolean).map(abs).filter(Boolean),
  };

  return <JsonLd data={webPage as Record<string, unknown>} />;
}