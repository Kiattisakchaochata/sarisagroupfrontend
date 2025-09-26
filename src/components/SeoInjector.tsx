'use client';

import { useEffect, useState } from 'react';

export default function SeoInjector({ path }: { path: string }) {
  const [jsonld, setJsonld] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/seo/page?path=${encodeURIComponent(path)}`);
        if (res.ok) {
          const data = await res.json();
          setJsonld(data.jsonld);
        }
      } catch (err) {
        console.error('SEO load fail', err);
      }
    }
    load();
  }, [path]);

  if (!jsonld) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
    />
  );
}