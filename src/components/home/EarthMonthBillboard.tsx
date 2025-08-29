// src/components/home/EarthMonthBillboard.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

interface EarthMonthBillboardProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
  fullBleed?: boolean;
  className?: string;
}

export default function EarthMonthBillboard({
  title = "Nhận ngay cơ hội trúng 500,000đ!",
  subtitle = `Like 5 sản phẩm, lưu 3 tìm kiếm và yêu cầu túi Losia bag. 
Hoàn thành cả 3 để nhận thêm cơ hội. Kết thúc 02/09.`,
  ctaText = "TÌM HIỂU THÊM",
  ctaHref = "",
  imageSrc = "/assets/images/home/earthmonth.png",
  fullBleed = true,
  className,
}: EarthMonthBillboardProps) {
  const Inner = (
    <div
      className="relative isolate overflow-hidden rounded-lg sm:rounded-sm bg-[#B9E5FB]"
      data-component="earthmonth-billboard"
    >
      {/* Overlay link: click toàn bộ banner */}
      <Link
        href={ctaHref}
        aria-hidden="true"
        tabIndex={-1}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-[1]"
      />

      <div className="relative z-[2] flex flex-col sm:flex-row items-stretch">
        {/* Text block */}
        <div className="flex w-full sm:w-1/2 items-center px-6 py-8 sm:px-10 sm:py-12">
          <div className="w-full text-center sm:text-left">
            <h2 className="text-2xl font-bold text-black md:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm text-black/80 md:text-base whitespace-pre-line">
              {subtitle}
            </p>
            <div className="mt-5 sm:mt-6">
              <Link
                href={ctaHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        </div>

 {/* Image block (contain + center) */}
 <div className="relative w-full sm:w-1/2 flex items-center justify-center p-2">
   <img
     src={imageSrc}
     alt="Earth Month sweepstakes"
     loading="lazy"
     width={640}
     height={400}
     className="max-h-full max-w-full object-contain"
   />
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
