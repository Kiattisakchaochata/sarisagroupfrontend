// src/app/providers.tsx
'use client'

import { DefaultSeo } from 'next-seo'
import SEO from '@/seo/nextSeoConfig'      // <- ตามโครงที่เราจัดไว้ src/seo/nextSeoConfig.ts
import GA from '@/lib/pixels/GA'
import GTM from '@/lib/pixels/GTM'
import FacebookPixel from '@/lib/pixels/FacebookPixel'
import TiktokPixel from '@/lib/pixels/TiktokPixel'

export default function Providers() {
  return (
    <>
      <DefaultSeo {...SEO} />
      <GA />
      <GTM />
      <FacebookPixel />
      <TiktokPixel />
    </>
  )
}