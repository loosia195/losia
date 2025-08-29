// src/components/home/ImageSearchBillboard.tsx
"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";

interface ImageSearchBillboardProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
  /** cover = che kín (có thể crop), contain = nằm gọn (không crop) */
  imageFit?: "cover" | "contain";
  /** fullBleed = kéo tràn mép màn hình, false = gói trong container */
  fullBleed?: boolean;
  className?: string;
}

export default function ImageSearchBillboard({
  title = "Mua đồ theo cảm hứng của bạn",
  subtitle = "Tải lên một bức ảnh, Dress Me AI sẽ gợi ý các món đồ tương tự trong chớp mắt.",
  ctaText = "DÙNG DRESS ME AI",
  ctaHref = "/?open_image_search=pane",
  imageSrc = "/assets/images/home/dressme.png",
  imageFit = "contain",
  fullBleed = true,
  className,
}: ImageSearchBillboardProps) {
  const Inner = (
    <div
      className="relative isolate overflow-hidden rounded-lg sm:rounded-sm bg-[#B9E5FB]"
      data-component="image-search-billboard"
    >
      {/* Overlay link: click toàn banner */}
      <Link
        href={ctaHref}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-[1]"
      />

      <div className="relative z-[2] flex flex-col sm:flex-row items-stretch">
        {/* Text block */}
        <div className="flex w-full items-center px-6 py-8 sm:w-1/2 sm:px-8 sm:py-10">
          <div className="w-full text-center sm:text-left">
            <h2 className="text-2xl font-bold text-black md:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm text-black/80 md:text-base">
              {subtitle}
            </p>
            <div className="mt-5 sm:mt-6">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        </div>

        {/* Image block (giữa – ảnh nằm gọn mặc định) */}
        <div className="relative w-full sm:w-1/2">
          <div className="flex h-full w-full items-center justify-center p-2">
            <img
  src={imageSrc}
  alt="Thử Tìm kiếm bằng ảnh"
  className={clsx(
    "h-full w-full object-contain", // hoặc object-cover tùy nhu cầu
    "rounded-md"
  )}
/>
          </div>
        </div>
      </div>
    </div>
  );

  return fullBleed ? (
    <section className={clsx("w-full", className)}>
      <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-8">{Inner}</div>
      </div>
    </section>
  ) : (
    <section className={clsx("w-full", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{Inner}</div>
    </section>
  );
}
