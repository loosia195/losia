// src/app/(public)/components/product/ProductImageGallery/ThumbnailList.tsx
'use client';

import React, { useEffect } from 'react';
import ThumbnailItem, { ThumbSource } from './ThumbnailItem';

type Props = {
  images: ThumbSource[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
  /** Preload ảnh liền kề (mặc định bật) */
  preloadAdjacent?: boolean;
  /**
   * orientation:
   *  - 'auto': mobile ngang, desktop dọc
   *  - 'horizontal' | 'vertical' để ép 1 kiểu
   */
  orientation?: 'auto' | 'horizontal' | 'vertical';
  /** id của vùng main image để aria-controls (tùy chọn) */
  controlsId?: string;
  /** ✅ NEW: cho phép custom class container */
  className?: string;
};

export default function ThumbnailList({
  images,
  selectedIndex,
  onSelect,
  preloadAdjacent = true,
  orientation = 'auto',
  controlsId,
  className,
}: Props) {
  // ---- Preload ảnh ngay sát (selected±1) ----
  useEffect(() => {
    if (!preloadAdjacent) return;
    const idxs = [selectedIndex - 1, selectedIndex + 1].filter(
      (i) => i >= 0 && i < images.length
    );
    idxs.forEach((i) => {
      const url = images[i]?.thumb;
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    });
  }, [selectedIndex, images, preloadAdjacent]);

  // ---- A11y: announce thay đổi ----
  const liveMsg = `Đang chọn ảnh ${selectedIndex + 1} / ${images.length}`;

  // ---- Layout responsive ----
  const isVertical = orientation === 'vertical';
  const isHorizontal = orientation === 'horizontal';
  const autoVerticalClasses = 'hidden lg:block'; // desktop: dọc
  const autoHorizontalClasses = 'flex lg:hidden'; // mobile: ngang

  return (
    <div aria-controls={controlsId} className={className}>
      {/* Live region */}
      <p className="sr-only" aria-live="polite">
        {liveMsg}
      </p>

      {/* AUTO: mobile ngang */}
      {orientation === 'auto' && (
        <div
          className={`${autoHorizontalClasses} gap-2 overflow-x-auto -mx-4 px-4 pb-2`}
          role="listbox"
          aria-orientation="horizontal"
        >
          {images.map((img, i) => (
            <div key={img.id} className="shrink-0">
              <ThumbnailItem
                img={img}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}

      {/* AUTO: desktop dọc */}
      {orientation === 'auto' && (
        <div
          className={`${autoVerticalClasses} max-h-[680px] overflow-y-auto pr-1`}
          role="listbox"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <ThumbnailItem
                key={img.id}
                img={img}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* ÉP NGANG */}
      {isHorizontal && (
        <div
          className="flex gap-2 overflow-x-auto"
          role="listbox"
          aria-orientation="horizontal"
        >
          {images.map((img, i) => (
            <div key={img.id} className="shrink-0">
              <ThumbnailItem
                img={img}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}

      {/* ÉP DỌC */}
      {isVertical && (
        <div
          className="max-h-[680px] overflow-y-auto pr-1"
          role="listbox"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <ThumbnailItem
                key={img.id}
                img={img}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
