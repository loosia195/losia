// src/app/(public)/components/product/ProductImageGallery/ThumbnailItem.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import SmartImage from '@/components/media/SmartImage';

export type ThumbSource = {
  id: string;
  alt: string;
  thumb?: string;        // URL thumb nếu có
  main?: string;         // URL main (fallback nữa)
  photoId?: string;      // ✅ dùng SmartImage nếu không có thumb
  features?: Array<'360'|'tape'|'mannequin'>;
};

type Props = {
  img: ThumbSource;
  index: number;
  isSelected: boolean;
  onSelect: (idx: number) => void;
};

export default function ThumbnailItem({ img, index, isSelected, onSelect }: Props) {
  const iconOf = (f: string) =>
    f === '360' ? '/assets/icons/arrow-360.svg'
    : f === 'tape' ? '/assets/icons/tape-measure.svg'
    : f === 'mannequin' ? '/assets/icons/mannequin.svg'
    : null;

  const commonClass =
    'block rounded-md border overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-black';

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      onMouseEnter={() => onSelect(index)}
      className={`relative ${commonClass} ${isSelected ? 'border-black' : 'border-transparent'}`}
      role="option"
      aria-selected={isSelected}
      aria-label={`Xem ảnh: ${img.alt}`}
      tabIndex={0}
      // ✅ Khung cố định 60x80 như trước
      style={{ width: 60, height: 80 }}
    >
      {/* Lớp nền trắng + padding nhẹ để “thở” giống ThredUp */}
      <span className="absolute inset-0 bg-white">
        <span className="relative block w-full h-full">
          {img.thumb ? (
            // ⚙️ Dùng Image fill + object-contain để không méo ảnh
            <Image
              src={img.thumb}
              alt={img.alt}
              fill
              sizes="80px"
              className="object-contain"
              loading="lazy"
              // opacity áp lên ảnh, giữ nguyên hành vi cũ
              style={{ opacity: isSelected ? 1 : 0.6 }}
            />
          ) : img.photoId || img.main ? (
            // ✅ Fallback SmartImage – vẫn giữ preset & AR 3:4, nhưng đổi sang object-contain
            <SmartImage
              kind="product"
              photoId={img.photoId}
              src={img.main}
              preset="pdpThumb"
              alt={img.alt}
              aspectRatio="3/4"
              priority={false}
              imgClassName="object-contain"   // ⬅️ quan trọng: không bị kéo giãn
              placeholder="empty"
              // SmartImage tự chiếm full container nhờ wrapper relative phía trên
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 grid place-items-center text-xs text-gray-500">
              No image
            </div>
          )}
        </span>
      </span>

      {/* Feature icon (nếu có) */}
      {img.features?.map((f) => {
        const icon = iconOf(f);
        if (!icon) return null;
        return (
          <span
            key={f}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ transform: 'translate(-50%,-50%)', background: '#ffffffcc', padding: 6 }}
            aria-hidden
          >
            <Image src={icon} alt="" width={20} height={20} />
          </span>
        );
      })}
    </button>
  );
}
