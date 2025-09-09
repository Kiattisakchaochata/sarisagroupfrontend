'use client'

import {
  OrganizationJsonLd,
  WebPageJsonLd,
  SiteLinksSearchBoxJsonLd,
} from 'next-seo'

export default function HomeJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <>
      {/* โฮมเพจเป็นหน้า Landing หลักของเว็บ */}
      <WebPageJsonLd
        id={`${siteUrl}/#webpage`}
        description="โปรโมตธุรกิจชุมชน สร้างรายได้ยั่งยืน: ซักผ้าหยอดเหรียญ คาเฟ่ เสริมสวย ร้านอาหาร และคาร์แคร์พลังงานทดแทน"
        lastReviewed={new Date().toISOString()}
        url={siteUrl}
        name="Sarisagroup – รวมธุรกิจชุมชน"
        isPartOf={{ '@id': `${siteUrl}/#website` }}
      />

      {/* องค์กร/แบรนด์หลักของเว็บไซต์ */}
      <OrganizationJsonLd
        id={`${siteUrl}/#organization`}
        legalName="Sarisagroup"
        name="Sarisagroup"
        url={siteUrl}
        logo={`${siteUrl}/apple-touch-icon.png`}
        sameAs={[
          // เติมลิงก์จริงเมื่อพร้อม
          'https://www.facebook.com/yourpage',
          'https://www.tiktok.com/@yourhandle',
          'https://www.youtube.com/@yourchannel',
        ]}
      />

      {/* กล่องค้นหา Sitelinks ใน Google (ใส่ URL ค้นหาของคุณ) */}
      <SiteLinksSearchBoxJsonLd
        url={siteUrl}
        potentialActions={[
          {
            target: `${siteUrl}/search?q={search_term_string}`,
            queryInput: 'required name=search_term_string',
          },
        ]}
      />
    </>
  )
}