// src/app/robots.ts
import type { MetadataRoute } from 'next';

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://sarisagroup.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}