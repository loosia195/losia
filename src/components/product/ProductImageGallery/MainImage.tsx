// src/app/(public)/components/product/ProductImageGallery/MainImage.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import SmartImage from '@/components/media/SmartImage';

type MainImageProps = {
  photoId?: string;
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  hoverZoom?: boolean;
  zoomScale?: number;
  blur?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  has360?: boolean;
  similarHref?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export default function MainImage({
  photoId,
  src,
  alt,
  priority = true,
  className,
  hoverZoom = true,
  zoomScale = 2,
  blur,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
  has360 = false,
  similarHref,
  isFavorite = false,
  onToggleFavorite,
}: MainImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rAFRef = useRef<number | null>(null);
  const [hover, setHover] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const wrapperClass =
    className ??
    'relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] w-full max-w-[612px] mx-auto';

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverZoom || !frameRef.current) return;
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(() => {
      const rect = frameRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const clamp = (v: number) => Math.max(0, Math.min(100, v));
      setOrigin({ x: clamp(x), y: clamp(y) });
    });
  };

  useEffect(() => {
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setHover(false);
    else if (e.key === 'ArrowLeft' && onPrev) onPrev();
    else if (e.key === 'ArrowRight' && onNext) onNext();
    else if ((e.key === 'Enter' || e.key === ' ') && hoverZoom) {
      e.preventDefault();
      setHover((z) => !z);
    }
  };

  // double-tap zoom + swipe
  const pointerStart = useRef<{ x: number; t: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (hoverZoom && now - lastTapRef.current < 300) setHover((z) => !z);
    lastTapRef.current = now;
    pointerStart.current = { x: e.clientX, t: now };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dt = Date.now() - start.t;
    if (Math.abs(dx) > 48 && dt < 600) {
      if (dx > 0 && onPrev) onPrev();
      if (dx < 0 && onNext) onNext();
    }
  };

  const imgStyle: React.CSSProperties | undefined = hoverZoom
    ? {
        transformOrigin: `${origin.x}% ${origin.y}%`,
        transform: `scale(${hover ? zoomScale : 1})`,
        transition: hover ? 'transform 0s' : 'transform 150ms ease-out',
        willChange: 'transform',
      }
    : undefined;

  const btnFabWhite =
    'pointer-events-auto inline-flex items-center justify-center rounded-full ' +
    'bg-white text-neutral-900 shadow-lg ring-1 ring-black/5 ' +
    'hover:shadow-xl hover:ring-black/10 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition';

  const btnPillWhite =
    'pointer-events-auto inline-flex items-center gap-1 rounded-full ' +
    'bg-white text-neutral-900 shadow-lg ring-1 ring-black/5 ' +
    'hover:shadow-xl hover:ring-black/10 px-2.5 py-1.5 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition';

  return (
    <div
      ref={frameRef}
      className={wrapperClass}
      tabIndex={0}
      role="img"
      aria-label={alt}
      onKeyDown={onKeyDown}
      onMouseMove={onMove}
      onMouseEnter={() => hoverZoom && setHover(true)}
      onMouseLeave={() => hoverZoom && setHover(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Ảnh chính */}
      <SmartImage
        kind="product"
        photoId={photoId}
        src={src}
        preset="pdpMain"
        alt={alt}
        aspectRatio="3/4"
        priority={priority}
        sizes="(min-width:1024px) 612px, 100vw"
        imgClassName="object-cover"
        imgStyle={imgStyle}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur}
      />

      {/* Overlay — chỉ khi KHÔNG zoom & KHÔNG 360 */}
      {src && !has360 && !hover && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundPosition: '25.6536% 0.245098%',
            backgroundSize: 'cover',
            opacity: 0.18,
            filter: 'blur(12px)',
          }}
        />
      )}

      {/* Shop Similar & Favorite (không có "View") */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {similarHref && (
          <a
            href={similarHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shop similar"
            className={btnPillWhite}
          >
            <Image src="/assets/icons/shop-similar.svg" alt="Shop similar" width={24} height={24} loading="lazy" />
            <span className="hidden md:inline text-sm font-medium whitespace-nowrap">Shop similar</span>
          </a>
        )}
        <button
          type="button"
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          onClick={onToggleFavorite}
          className={btnFabWhite + ' h-10 w-10'}
        >
          <Image
            src={isFavorite ? '/assets/icons/heart-solid.svg' : '/assets/icons/heart-outline.svg'}
            alt="Favorite"
            width={20}
            height={20}
            loading="lazy"
          />
        </button>
      </div>

      {/* Arrow Prev/Next (nút trái mờ khi ở ảnh đầu) */}
      <div className="absolute right-4 bottom-4 z-10 flex gap-2 pointer-events-none">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-disabled={!canGoPrev}
          aria-label="Previous image"
          className={
            btnFabWhite +
            ' h-10 w-10 pointer-events-auto ' +
            (!canGoPrev ? 'opacity-35 cursor-not-allowed shadow-none ring-0 hover:shadow-none hover:ring-0' : '')
          }
        >
          <Image src="/assets/icons/arrow-left.svg" alt="Previous" width={20} height={20} loading="lazy" />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
          aria-label="Next image"
          className={
            btnFabWhite +
            ' h-10 w-10 pointer-events-auto ' +
            (!canGoNext ? 'opacity-35 cursor-not-allowed shadow-none ring-0 hover:shadow-none hover:ring-0' : '')
          }
        >
          <Image src="/assets/icons/arrow-right.svg" alt="Next" width={20} height={20} loading="lazy" />
        </button>
      </div>
    </div>
  );
}
