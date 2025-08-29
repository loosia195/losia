// src/components/product/ProductImageGallery/ProductImageSection.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainImage from './MainImage';
import ThumbnailList from './ThumbnailList';
import type { ThumbSource } from './ThumbnailItem';
import LightboxViewer from './LightboxViewer'; // tuỳ anh có dùng Lightbox hay không

// Tránh dùng Array<...> trong TSX; dùng [] cho an toàn
type FeatureTag = '360' | 'tape' | 'mannequin';

type ProductImage = {
  id: string;
  alt: string;
  main?: string;
  thumb?: string;
  photoId?: string;
  features?: FeatureTag[];
  blur?: string;
  sprite?: string;
};

// Input linh hoạt: string[] hoặc object[]
type AnyImg =
  | string
  | {
      id?: string;
      alt?: string;
      main?: string;
      src?: string;
      url?: string;
      thumb?: string;
      photoId?: string;
      features?: FeatureTag[];
      blur?: string;
      sprite?: string;
    };

type Props = {
  images: AnyImg[];
  productId?: string;   // để reset index khi đổi sản phẩm
  title?: string;       // fallback alt
  initialIndex?: number;
  className?: string;
  lightbox?: boolean;
};

export default function ProductImageSection({
  images,
  productId,
  title,
  initialIndex = 0,
  className,
  lightbox = true,
}: Props) {
  // 1) Chuẩn hoá -> ProductImage[]
  const normalized: ProductImage[] = useMemo(() => {
    const list = Array.isArray(images) ? images : [];
    return list
      .map((img, idx): ProductImage | null => {
        if (typeof img === 'string') {
          return {
            id: `s-${idx}`,
            alt: title || 'Product image',
            main: img,
            thumb: img,
          };
        }
        const main = img.main || img.src || img.url;
        const thumb = img.thumb || main;
        if (!main && !img.photoId) return null;
        return {
          id: img.id || `i-${idx}`,
          alt: img.alt || title || 'Product image',
          main,
          thumb,
          photoId: img.photoId,
          features: img.features,
          blur: img.blur,
          sprite: img.sprite,
        };
      })
      .filter(Boolean) as ProductImage[];
  }, [images, title]);

  // 2) Fallback nếu không có ảnh
  if (!normalized.length) {
    return <div>Không có hình ảnh để hiển thị</div>;
  }

  // 3) Index + clamp
  const clamp = (i: number) => Math.max(0, Math.min(normalized.length - 1, i));
  const [selectedIndex, setSelectedIndex] = useState(() => clamp(initialIndex));

  // 4) Reset index khi đổi sản phẩm/danh sách ảnh
  useEffect(() => {
    setSelectedIndex(clamp(initialIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, normalized.length, initialIndex]);

  // 5) Dữ liệu thumbnails
  const thumbs: ThumbSource[] = useMemo(
    () =>
      normalized.map((img) => ({
        id: img.id,
        alt: img.alt,
        thumb: img.thumb,
        main: img.main,
        photoId: img.photoId,
        features: img.features,
      })),
    [normalized]
  );

  // 6) Điều hướng + selected
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < normalized.length - 1;
  const goPrev = () => setSelectedIndex((i) => clamp(i - 1));
  const goNext = () => setSelectedIndex((i) => clamp(i + 1));
  const selected = normalized[selectedIndex];

  // 7) Lightbox state
  const [open, setOpen] = useState(false);

  return (
    <div className={className ?? 'grid grid-cols-12 gap-4'}>
      {/* Thumbnails */}
      <div className="col-span-12 lg:col-span-2">
        <ThumbnailList
          images={thumbs}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          preloadAdjacent
          orientation="auto"
          controlsId="pdp-main-image"
        />
      </div>

      {/* Main image */}
      <div className="col-span-12 lg:col-span-10 relative">
        <MainImage
          photoId={selected.photoId}
          src={selected.main}
          alt={selected.alt}
          priority
          hoverZoom
          zoomScale={2}
          blur={selected.blur}
          onPrev={canGoPrev ? goPrev : undefined}
          onNext={canGoNext ? goNext : undefined}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] w-full max-w-[612px] mx-auto"
        />

        {/* Ví dụ nút mở Lightbox (tuỳ anh bật dùng) */}
        {/* <button
          className="absolute top-3 left-3 bg-white/80 backdrop-blur px-2 py-1 rounded-md shadow"
          onClick={() => setOpen(true)}
        >
          View
        </button> */}
      </div>

      {lightbox && open && (
        <LightboxViewer
          images={normalized.map((img) => ({
            id: img.id,
            alt: img.alt,
            main: img.main,
            photoId: img.photoId,
          }))}
          index={selectedIndex}
          onClose={() => setOpen(false)}
          onIndexChange={setSelectedIndex}
        />
      )}
    </div>
  );
}
