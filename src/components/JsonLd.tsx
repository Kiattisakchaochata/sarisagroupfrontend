// server component ได้ ไม่ใช้ hooks
export default function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      // ไม่ใช้ hooks, แปะ JSON-LD ตรง ๆ
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}