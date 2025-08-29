// src/components/home/HeroCarousel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface Slide {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

// Demo dữ liệu
const sampleSlides: Slide[] = [
  {
    title: "Tủ đầy? Dọn gọn thật dễ.",
    subtitle:
      "Gửi đồ đã qua yêu thương cho Losia — phần còn lại để tụi mình lo.",
    imageUrl: "/assets/images/home/free bag.png",
    ctaText: "Gửi đồ ngay",
    ctaLink: "",
  },
  {
    title: "Vô vàn phong cách. Chỉ một \"Mẫu duy nhất\".",
    subtitle:
      "Khám phá hàng ngàn món mới được thêm mỗi ngày, chọn đúng gu của bạn.",
    imageUrl: "/assets/images/home/styles.png",
    ctaText: "Mua sắm ngay",
    ctaLink: "",
  },
];

function DotIndicators({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="relative mt-3 flex w-full items-center justify-center">
      <div className="flex items-center gap-2 py-1">
        {Array.from({ length: total }).map((_, idx) => {
          const active = idx === current;
          return (
            <button
              key={idx}
              aria-label={`Chuyển đến slide ${idx + 1}`}
              onClick={() => onSelect(idx)}
              className={clsx(
                "h-1.5 w-8 rounded-full transition",
                active ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function HeroCarousel({
  slides = sampleSlides,
  intervalMs = 7000,
}: {
  slides?: Slide[];
  intervalMs?: number;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const last = slides.length - 1;

  // Auto slide
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((p) => (p === last ? 0 : p + 1));
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs, last, slides.length]);

  // Keyboard ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Touch swipe (mobile)
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx > 0 ? prev() : next();
    }
    touchStartX.current = null;
  };

  const prev = () => setCurrent((c) => (c === 0 ? last : c - 1));
  const next = () => setCurrent((c) => (c === last ? 0 : c + 1));
  const go = (idx: number) => setCurrent(idx);

  return (
    <section
      className="relative isolate w-full bg-white"
      aria-roledescription="carousel"
      aria-label="Hero Carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Khung full-bleed hình, nội dung canh giữa */}
      <div className="relative mx-auto w-full">
        {/* Wrapper cố định tỉ lệ & chiều cao */}
        <div className="relative h-[45vw] max-h-[420px] min-h-[300px] w-full overflow-hidden">
          {/* Slides */}
          {slides.map((slide, i) => {
            const active = i === current;
            return (
              <div
                key={i}
                className={clsx(
                  "absolute inset-0 transition-opacity duration-500",
                  active ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                {/* Ảnh nền */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  loading={active ? "eager" : "lazy"}
                  className="pointer-events-none h-full w-full object-cover"
                />

                {/* Link phủ toàn slide */}
                <Link
                  href={slide.ctaLink}
                  aria-label={slide.ctaText}
                  className="absolute inset-0"
                  tabIndex={-1}
                />

                {/* Overlay content */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="pointer-events-auto mx-auto w-4/5 max-w-6xl px-4 text-center">
                    <h2 className="text-2xl font-semibold text-white drop-shadow md:text-5xl">
                      {slide.title}
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm text-white/95 md:mt-3 md:text-lg">
                      {slide.subtitle}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center justify-center rounded border border-black bg-white px-5 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white md:px-6 md:py-2.5"
                      >
                        {slide.ctaText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Prev */}
          <button
            aria-label="Slide trước"
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-black bg-white/90 p-2 shadow-sm backdrop-blur transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.46967 0.46967c-.29289.292893-.29289.767767 0 1.06066L17.1893 9.25H1a.75.75 0 0 0 0 1.5h16.1893l-7.71963 7.7197c-.29289.2929-.29289.7678 0 1.0607.2929.2928.76773.2928 1.06063 0l9.00003-9.0001c.2929-.2929.2929-.7677 0-1.0606L10.5303.46967c-.2929-.292893-.76773-.292893-1.06063 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Next */}
          <button
            aria-label="Slide tiếp theo"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-black bg-white/90 p-2 shadow-sm backdrop-blur transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.46967 0.46967c-.29289.292893-.29289.767767 0 1.06066L17.1893 9.25H1a.75.75 0 0 0 0 1.5h16.1893l-7.71963 7.7197c-.29289.2929-.29289.7678 0 1.0607.2929.2928.76773.2928 1.06063 0l9.00003-9.0001c.2929-.2929.2929-.7677 0-1.0606L10.5303.46967c-.2929-.292893-.76773-.292893-1.06063 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dots */}
      <DotIndicators total={slides.length} current={current} onSelect={go} />

      {/* Caption live region (SR) */}
      <p className="sr-only" aria-live="polite">
        Slide {current + 1} / {slides.length}: {slides[current]?.title}
      </p>
    </section>
  );
}
