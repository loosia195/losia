// src/components/home/HighlightBanner.tsx
"use client";

import React from "react";
import clsx from "clsx";
import { Source_Code_Pro } from "next/font/google";

const sourceCode = Source_Code_Pro({
  weight: ["500"],                 // đúng yêu cầu: 500
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

type Tone = "subtle" | "mint" | "gray";

interface HighlightBannerProps {
  /** Nội dung hiển thị (có thể là EN hoặc VI) */
  message?: string;
  /** Kéo nền chạy full chiều ngang cửa sổ hay chỉ theo container */
  fullBleed?: boolean;
  /** Tông màu nền nhẹ */
  tone?: Tone;
  /** Thêm class bổ sung nếu cần */
  className?: string;
}

const toneMap: Record<Tone, string> = {
  subtle: "bg-white text-gray-900 border-y border-gray-200",
  mint: "bg-emerald-50 text-gray-900 border-y border-emerald-100",
  gray: "bg-gray-50 text-gray-900 border-y border-gray-200",
};

export default function HighlightBanner({
  message = "Hô biến đồ cũ thành tiền. Săn phong cách độc lạ với giá giảm đến 90% so với retail.",
  fullBleed = true,
  tone = "subtle",
  className,
}: HighlightBannerProps) {
  const Inner = (
    <div className="mx-auto max-w-6xl px-4">
      <p
        className={clsx(
          sourceCode.className,          // ✅ áp dụng Source Code Pro 500
          "py-2.5 text-center text-xl md:text-[15px] leading-relaxed"
        )}
      >
        {message}
      </p>
    </div>
  );

  return (
    <div
      className={clsx(
        "relative isolate w-full",
        toneMap[tone],
        className,
        fullBleed ? "" : "rounded-lg"
      )}
      data-component="highlight-banner"
    >
      {fullBleed ? Inner : <div className="px-4">{Inner}</div>}
    </div>
  );
}
