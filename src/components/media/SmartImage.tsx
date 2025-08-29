// src/components/media/SmartImage.tsx
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type ProductPreset = 'homeCard' | 'plp' | 'pdpMain' | 'pdpZoom' | 'pdpThumb' | 'sellerWidget';
type ProductVariant = 'thumb' | 'medium' | 'complimentary' | 'grid' | 'xlarge' | 'retina';

type SmartImageProps =
  | {
      kind: 'product';
      alt: string;
      photoId?: string;
      src?: string;
      preset?: ProductPreset;
      variant?: ProductVariant;
      aspectRatio?: '3/4' | '1/1' | '16/9';
      priority?: boolean;
      className?: string;     // wrapper
      imgClassName?: string;  // ảnh bên trong (áp dụng hover, transition…)
      imgStyle?: CSSProperties; // phục vụ hover zoom
      // ✅ blur LQIP
      blurDataURL?: string;
      placeholder?: 'blur' | 'empty';
      sizes?: string;

    }
  | {
      kind: 'illustration';
      alt: string;
      sources: { mobile: string; desktop: string };
      sizes?: string;
      aspectRatio?: '16/9' | '3/4';
      priority?: boolean;
      className?: string;
    }
  | {
      kind: 'icon';
      src: string;
      alt: string;
      size?: number;
      className?: string;
    };

const PRESET_MAP: Record<ProductPreset, { variant: ProductVariant; sizes: string }> = {
  homeCard: { variant: 'complimentary', sizes: '(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw' },
  plp: { variant: 'grid', sizes: '(max-width:640px) 45vw, (max-width:1024px) 200px, 240px' },
  pdpMain: { variant: 'xlarge', sizes: '(max-width:768px) 100vw, 60vw' },
  pdpZoom: { variant: 'retina', sizes: '100vw' },
  pdpThumb: { variant: 'medium', sizes: '96px' },
  sellerWidget: { variant: 'medium', sizes: '(max-width:640px) 45vw, 180px' },
};

function buildProductUrlFromId(photoId: string, variant: ProductVariant) {
  const root = (process.env.NEXT_PUBLIC_IMG_CDN || 'https://cdn.losia.vn/assets').replace(/\/+$/, '');
  return `${root}/${photoId}/${variant}.jpg`;
}

export default function SmartImage(props: SmartImageProps) {
  const [err, setErr] = useState(false);

  if (props.kind === 'product') {
    const {
      photoId, src, alt, preset = 'homeCard', variant,
      aspectRatio = '3/4', priority, className, imgClassName, imgStyle,
      blurDataURL, placeholder,
    } = props;

    const { sizes, finalUrl } = useMemo(() => {
      const map = PRESET_MAP[preset] ?? PRESET_MAP.homeCard;
      const v = variant || map.variant;
      const url = src || (photoId ? buildProductUrlFromId(photoId, v) : '/assets/images/main/product1.jpg');
      return { sizes: map.sizes, finalUrl: url };
    }, [src, photoId, preset, variant]);

    const [w, h] = aspectRatio.split('/').map(Number);
    const padTop = `${(h / w) * 100}%`;

    return (
      <div className={className} style={{ position: 'relative', width: '100%', paddingTop: padTop }}>
        <Image
          src={err ? '/assets/images/main/product1.jpg' : finalUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErr(true)}
          className={imgClassName ?? 'object-cover'}
          style={imgStyle}
          // ✅ bật LQIP khi có blur
          placeholder={placeholder ?? (blurDataURL ? 'blur' : 'empty')}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }

  if (props.kind === 'illustration') {
    const { sources, alt, sizes = '100vw', aspectRatio = '16/9', priority, className } = props;
    const [w, h] = aspectRatio.split('/').map(Number);
    const padTop = `${(h / w) * 100}%`;

    return (
      <div className={className} style={{ position: 'relative', width: '100%', paddingTop: padTop }}>
        <picture>
          <source media="(max-width:768px)" srcSet={sources.mobile} />
          <Image src={sources.desktop} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </picture>
      </div>
    );
  }

  if (props.kind === 'icon') {
    const { src, alt, size = 24, className } = props;
    return <Image src={src} alt={alt} width={size} height={size} className={className} />;
  }

  return null;
}
