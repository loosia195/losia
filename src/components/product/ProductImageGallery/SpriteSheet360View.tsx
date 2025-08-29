// src/app/(public)/components/product/ProductImageGallery/SpriteSheet360View.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type SpriteSheet360Props = {
  /** URL ảnh sprite 1 hàng, gồm N frame ghép ngang */
  spriteUrl: string;
  /** Tổng số frame trong sprite */
  frameCount?: number;           // default 26
  /** Aspect của khung hiển thị (CSS). Ví dụ '3/4' */
  aspectRatio?: string;          // default '3/4'
  /** Tự động quay 1 vòng khi vào viewport */
  autoRotateOnce?: boolean;      // default true
  /** Tốc độ auto-rotate: ms mỗi frame */
  autoRotateFrameMs?: number;    // default 60 ~ 16-60ms (mượt)
  /** Độ nhạy kéo: px cho 1 frame */
  dragSensitivity?: number;      // default 10
  /** className cho wrapper */
  className?: string;
  /** nhãn A11y */
  ariaLabel?: string;
};

export default function SpriteSheet360View({
  spriteUrl,
  frameCount = 26,
  aspectRatio = '3/4',
  autoRotateOnce = true,
  autoRotateFrameMs = 80,
  dragSensitivity = 10,
  className,
  ariaLabel = 'Xoay ảnh 360 độ',
}: SpriteSheet360Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // kích thước natural của sprite
  const [sheetW, setSheetW] = useState<number | null>(null);
  const [sheetH, setSheetH] = useState<number | null>(null);

  // kích thước viewport thực tế (để scale sprite)
  const [vw, setVW] = useState(0);
  const [vh, setVH] = useState(0);

  // trạng thái hiển thị
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // điều khiển khung hình
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const autoDone = useRef(false);

  // drag/pan
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startFrame = useRef(0);

  // ----- Load ảnh sprite (lazy khi in-view) -----
  useEffect(() => {
    if (!inView || loaded) return;
    const img = new Image();
    img.src = spriteUrl;
    img.decode?.().then(
      () => {
        setSheetW(img.width);
        setSheetH(img.height);
        setLoaded(true);
      },
      () => {
        // fallback onload nếu decode không hỗ trợ
        img.onload = () => {
          setSheetW(img.width);
          setSheetH(img.height);
          setLoaded(true);
        };
      }
    );
  }, [inView, loaded, spriteUrl]);

  // ----- Quan sát viewport -----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? false);
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ----- ResizeObserver để biết kích thước khung hiển thị -----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setVW(rect.width);
      setVH(rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frameW = sheetW ? sheetW / frameCount : 0;
  const frameH = sheetH ?? 0;

  // scale sprite lên vừa viewport (giống kỹ thuật scale bằng transform-origin: top-left)
  const scaleX = frameW ? vw / frameW : 1;
  const scaleY = frameH ? vh / frameH : 1;

  // ----- Auto rotate 1 vòng bằng rAF -----
  useEffect(() => {
    if (!inView || !loaded || !autoRotateOnce || autoDone.current) return;
    let start = performance.now();
    let lastStep = 0;
    function tick(ts: number) {
      const elapsed = ts - start;
      // số frame cần nhảy theo thời gian
      const step = Math.floor(elapsed / autoRotateFrameMs);
      if (step !== lastStep) {
        lastStep = step;
        const f = step % frameCount;
        setFrame(f);
        if (step >= frameCount - 1) {
          autoDone.current = true; // đủ 1 vòng
        }
      }
      if (!autoDone.current) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, loaded, autoRotateOnce, autoRotateFrameMs, frameCount]);

  // ----- Drag để xoay -----
  const onPointerDown: React.PointerEventHandler = (e) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    startX.current = e.clientX;
    startFrame.current = frame;
  };
  const onPointerUp: React.PointerEventHandler = () => {
    isDragging.current = false;
  };
  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!isDragging.current) return;
    if (!frameCount) return;
    const dx = e.clientX - startX.current;
    let deltaFrames = Math.floor(dx / dragSensitivity);
    // xoay modulo liên tục
    let nf = (startFrame.current + deltaFrames) % frameCount;
    if (nf < 0) nf += frameCount;
    setFrame(nf);
  };

  // ----- Background position theo frame -----
  const bgX = useMemo(() => {
    if (!frameW) return 0;
    return -(frame * frameW);
  }, [frame, frameW]);

  const wrapperClass =
    className ??
    `relative overflow-hidden rounded-xl bg-gray-100 aspect-[${aspectRatio}] w-full`;

  const isReady = loaded && frameW > 0 && frameH > 0;

  return (
    <div
      ref={wrapRef}
      className={wrapperClass}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {!isReady ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-gray-500">
          Loading 360°…
        </div>
      ) : (
        <div
          ref={stageRef}
          className="absolute top-0 left-0"
          style={{
            width: frameW,
            height: frameH,
            backgroundImage: `url(${spriteUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${bgX}px 0px`,
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: 'top left',
            willChange: 'transform, background-position',
            userSelect: 'none',
          }}
        />
      )}

      {/* Hint sau auto-rotate */}
      {autoDone.current && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-full bg-white/80">
          Kéo để xoay (360°)
        </div>
      )}
    </div>
  );
}
