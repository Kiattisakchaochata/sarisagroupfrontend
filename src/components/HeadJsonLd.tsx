// src/components/JsonLd.tsx
import 'server-only';

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // pretty-print ด้วยช่องว่าง 2 และกัน '<' แตก
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2).replace(/</g, '\\u003c'),
      }}
    />
  );
}