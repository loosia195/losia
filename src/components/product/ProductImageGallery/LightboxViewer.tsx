// src/components/product/ProductImageGallery/LightboxViewer.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Cho phép truyền string[] hoặc object có src/url/main + alt */
export type LightboxItem =
  | string
  | {
      src?: string;
      url?: string;
      main?: string;
      alt?: string;
      id?: string;
      photoId?: string;
    };

export type LightboxViewerProps = {
  images: LightboxItem[];

  /** Uncontrolled mode */
  initialIndex?: number;

  /** Controlled mode */
  index?: number;
  onIndexChange?: (next: number) => void;

  onClose: () => void;
  loop?: boolean;               // default: true
  closeOnBackdrop?: boolean;    // default: true
  showThumbnails?: boolean;     // default: true
};

type Normalized = { src: string; alt?: string };

const LightboxViewer: React.FC<LightboxViewerProps> = ({
  images,
  initialIndex = 0,
  index: indexProp,
  onIndexChange,
  onClose,
  loop = true,
  closeOnBackdrop = true,
  showThumbnails = true,
}) => {
  // Chuẩn hoá dữ liệu ảnh
  const normalized: Normalized[] = useMemo(() => {
    const normOne = (it: LightboxItem): Normalized | null => {
      if (typeof it === 'string') return it ? { src: it } : null;
      const src = it.src ?? it.url ?? it.main;
      if (!src) return null;
      return { src, alt: it.alt };
    };
    return (images || []).map(normOne).filter(Boolean) as Normalized[];
  }, [images]);

  const total = normalized.length;

  // Hỗ trợ cả controlled & uncontrolled
  const isControlled = typeof indexProp === 'number' && typeof onIndexChange === 'function';
  const [uncontrolledIdx, setUncontrolledIdx] = useState(() => {
    const safe = Number.isFinite(initialIndex)
      ? Math.max(0, Math.min(initialIndex, Math.max(total - 1, 0)))
      : 0;
    return safe;
  });

  const index = isControlled
    ? // controlled
      Math.max(0, Math.min(indexProp as number, Math.max(total - 1, 0)))
    : // uncontrolled
      Math.max(0, Math.min(uncontrolledIdx, Math.max(total - 1, 0)));

  const setIndex = useCallback(
    (next: number | ((prev: number) => number)) => {
      const calc = typeof next === 'function' ? (next as (p: number) => number)(index) : next;
      const clamped = Math.max(0, Math.min(calc, Math.max(total - 1, 0)));
      if (isControlled) {
        onIndexChange?.(clamped);
      } else {
        setUncontrolledIdx(clamped);
      }
    },
    [index, total, isControlled, onIndexChange]
  );

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Mount portal + lock scroll
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus a11y
  useEffect(() => {
    imgRef.current?.focus();
  }, [index]);

  // Keyboard
  const go = useCallback(
    (dir: 1 | -1) => {
      if (!total) return;
      setIndex((i) => {
        const next = i + dir;
        if (loop) return (next + total) % total;
        return Math.max(0, Math.min(next, total - 1));
      });
    },
    [setIndex, total, loop]
  );

  const goTo = useCallback(
    (idx: number) => {
      if (!total) return;
      setIndex(idx);
    },
    [setIndex, total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) onClose();
  };

  if (!mounted || !total) return null;

  const canPrev = loop || index > 0;
  const canNext = loop || index < total - 1;
  const current = normalized[index];

  const content = (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Top bar */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 text-white select-none">
        <span className="text-sm md:text-base opacity-80">
          {index + 1} / {total}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full border border-white/30 bg-black/40 hover:bg-black/60 px-3 py-1 text-sm md:text-base"
        >
          ✕ Close
        </button>
      </div>

      {/* Main stage */}
      <div className="relative w-full max-w-5xl px-6 md:px-10">
        {/* Prev */}
        <button
          onClick={() => go(-1)}
          disabled={!canPrev}
          aria-label="Previous image"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center disabled:opacity-40"
        >
          ‹
        </button>

        {/* Image */}
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-white/10 bg-black/20">
          <img
            ref={imgRef}
            tabIndex={0}
            src={current.src}
            alt={current.alt ?? `Image ${index + 1} of ${total}`}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>

        {/* Next */}
        <button
          onClick={() => go(1)}
          disabled={!canNext}
          aria-label="Next image"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center disabled:opacity-40"
        >
          ›
        </button>
      </div>

      {/* Thumbnails */}
      {showThumbnails && total > 1 && (
        <div className="mt-4 max-w-5xl w-full overflow-x-auto px-6 md:px-10">
          <div className="flex gap-2 md:gap-3">
            {normalized.map((p, i) => {
              const active = i === index;
              return (
                <button
                  key={p.src + i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-lg ring-2 transition
                    ${active ? 'ring-white' : 'ring-white/20 hover:ring-white/50'}`}
                >
                  <img
                    src={p.src}
                    alt={p.alt ?? `Thumbnail ${i + 1}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default LightboxViewer;
export { LightboxViewer };
