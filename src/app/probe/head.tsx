export default function Head() {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Sarisagroup';

  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: SITE_URL };
  const org     = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: SITE_URL };

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </>
  );
}