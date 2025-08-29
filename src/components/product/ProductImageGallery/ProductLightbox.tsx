// src/app/(public)/components/product/ProductImageGallery/ProductLightbox.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/media/SmartImage';
import ArrowLeft from '@/icons/arrow-left.svg';
import ArrowRight from '@/icons/arrow-right.svg';

type ImageSource = { photoId?: string; src?: string; alt: string };

type Props = {
  open: boolean;
  onClose: () => void;
  image: ImageSource;
  onPrev?: () => void;
  onNext?: () => void;
};

const ZOOM = 1.85; // mức zoom khi hover

export default function ProductLightbox({ open, onClose, image, onPrev, onNext }: Props) {
  const [isHover, setIsHover] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  // ESC để đóng + khoá scroll nền
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prevOverflow;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  // Pan theo chuột khi hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* PANEL TRẮNG RỘNG, GIỮA MÀN HÌNH */}
      <div
        className="relative mx-auto w-[min(96vw,2000px)] rounded-xl bg-white shadow-2xl p-4 sm:p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 rounded-full bg-white px-2 py-1 text-sm shadow ring-1 ring-black/10"
        >
          ✕
        </button>

        {/* KHUNG ẢNH 3:4 Ở CHÍNH GIỮA PANEL */}
        <div className="mx-auto max-h-[90vh]">
          <div
            ref={frameRef}
            className="
              relative aspect-[3/4]
              w-[min(68vw,500px)]
              md:w-[min(50vw,620px)]
              overflow-hidden rounded-lg ring-black/5
              mx-auto
            "
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {/* Lớp zoom: transform-origin theo chuột, scale khi hover */}
            <div
              ref={zoomRef}
              style={{
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transform: `scale(${isHover ? ZOOM : 1})`,
                transition: isHover ? 'transform 0s' : 'transform 150ms ease-out',
              }}
              className="absolute inset-0"
            >
              <SmartImage
                kind="product"
                photoId={image.photoId}
                src={image.src}
                preset="pdpZoom"       // ảnh lớn, sắc nét
                alt={image.alt}
                className="absolute inset-0"
                imgClassName="object-contain"
              />
            </div>
          </div>
        </div>

        {/* MŨI TÊN TRONG LIGHTBOX (tuỳ chọn) */}
        {onPrev && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Ảnh trước"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
        {onNext && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={onNext}
              aria-label="Ảnh tiếp theo"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
