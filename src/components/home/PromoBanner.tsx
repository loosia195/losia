// src/components/home/PromoBanner.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";
import { Anton } from "next/font/google";

const anton = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

interface PromoBannerProps {
  message?: string;
  ctaText?: string;
  ctaHref?: string;
  code?: string;
}

export default function PromoBanner({
  message = "GIẢM 50% ĐƠN ĐẦU TIÊN",
  ctaText = "Mua ngay",
  ctaHref = "",
  code = "FALL50",
}: PromoBannerProps) {
  return (
    <div
      className="relative isolate w-full bg-green-300"
      data-component="promo-banner"
    >
      {/* Nội dung canh giữa */}
      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        <div className="flex flex-col items-start justify-center gap-3 md:flex-row md:items-center md:justify-between">
          <h2
            className={clsx(
              anton.className,
              "text-3xl font-bold uppercase tracking-wide"
            )}
          >
            {message}
          </h2>

          <div className="text-sm md:flex md:items-center md:gap-2">
            <span className="mr-2">Lại còn, Miễn phí vận chuyển.</span>
            <span>Mã: </span>
            <span className="rounded bg-black px-2 py-0.5 text-white tracking-wide">
              {code}
            </span>
          </div>

          <Link
            href={ctaHref}
            className="hidden md:inline-flex items-center justify-center rounded border border-black px-4 py-1.5 text-sm font-semibold uppercase hover:bg-black hover:text-white transition"
          >
            {ctaText}
          </Link>

          <button
            type="button"
            className="hidden md:inline text-xs text-gray-600 underline underline-offset-2"
          >
            Điều kiện áp dụng
          </button>
        </div>

        {/* Mobile layout */}
        <div className="mt-2 flex items-center justify-between md:hidden">
          <Link
            href={ctaHref}
            className="text-sm font-semibold uppercase underline underline-offset-2"
          >
            {ctaText}
          </Link>
          <button
            type="button"
            className="text-xs text-gray-600 underline underline-offset-2"
          >
            Điều kiện áp dụng
          </button>
        </div>
      </div>

      {/* Click overlay cho mobile */}
      <Link
        href={ctaHref}
        aria-label={ctaText}
        className="absolute inset-0 md:hidden"
      />
    </div>
  );
}
