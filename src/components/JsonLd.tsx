// src/components/JsonLd.tsx
import Script from "next/script";

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Script
      id={data['@type'] as string}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}