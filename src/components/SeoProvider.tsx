'use client'

import dynamic from 'next/dynamic'
import SEO from '@/seo/nextSeoConfig'

// โหลด DefaultSeo แบบ client-only ปิด SSR เพื่อกัน hook error ใน SSR
const DefaultSeo = dynamic(
  () => import('next-seo').then((m) => m.DefaultSeo),
  { ssr: false }
)

export default function SeoProvider() {
  return <DefaultSeo {...SEO} />
}