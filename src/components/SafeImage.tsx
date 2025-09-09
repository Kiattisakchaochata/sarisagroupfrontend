// src/components/SafeImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useMemo } from 'react';
import { normalizeUnsplashUrl } from '@/lib/img';

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  normalizeUnsplash?: boolean;
  width?: number;
  height?: number;
};

export default function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://placehold.co/1600x900?text=Image+not+found',
  normalizeUnsplash = true,
  width = 1600,
  height = 900,
  className,
  ...rest
}: Props) {
  const [broken, setBroken] = useState(false);

  const finalSrc = useMemo(() => {
    if (!src || broken) return fallbackSrc;
    const isUnsplash = src.includes('images.unsplash.com');
    return normalizeUnsplash && isUnsplash
      ? normalizeUnsplashUrl(src, width, 80)
      : src;
  }, [src, broken, fallbackSrc, normalizeUnsplash, width]);

  return (
    <Image
      src={finalSrc}
      alt={alt || 'image'}
      width={width}
      height={height}
      onError={() => setBroken(true)}
      className={className}
      // ใช้ unoptimized เพื่อให้สลับ fallback ได้ทันทีแม้ 404
      unoptimized
      {...rest}
    />
  );
}