// src/components/home/TrendingFinishingTouchesSection.tsx
"use client";

import React from "react";
import Link from "next/link";

type Card = {
  href: string;
  src: string;
  alt: string;
  caption?: string;
  aria?: string;
};

const CARDS: Card[] = [
  {
    href: "",
    src: "assets/images/home/glasses.png",
    alt: "model wearing sunglasses",
    caption: "Kính mát trendy",
  },
  {
    href: "",
    src: "assets/images/home/crossbody bags.png",
    alt: "model wearing crossbody purse",
    caption: "Túi đeo chéo",
  },
  {
    href: "",
    src: "assets/images/home/tote bags.png",
    alt: "model wearing tote bag purse",
    caption: "Túi tote xịn",
  },
  {
    href: "",
    src: "assets/images/home/leather belts.png",
    alt: "leather belt",
    caption: "Thắt lưng da",
  },
  {
    href: "",
    src: "assets/images/home/shoulder bags.png",
    alt: "model holding shoulder bag",
    caption: "Túi kẹp nách",
  },
  {
    href: "",
    src: "assets/images/home/silk scarves.png",
    alt: "model wearing silk scarf",
    caption: "Khăn lụa",
  },
];

export default function TrendingFinishingTouchesSection() {
  return (
    <section
      className="relative isolate w-full border-y border-gray-200 bg-white py-8"
      data-component="trending-finishing-touches"
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Điểm nhấn hoàn thiện outfit
        </h2>
        {/* Phụ đề */}
        <h3 className="mt-2 text-sm text-gray-600 md:text-base">
          “Chốt hạ” set đồ với phụ kiện đang hot – có thể săn ngay bây giờ.
        </h3>

        {/* Grid 6 thẻ ảnh: sát nhau, ảnh chữ nhật 4:5 */}
        <div className="mt-6 grid grid-cols-2 justify-items-center gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {CARDS.map((card) => (
            <Link
  key={card.href}
  href={card.href}
  aria-label={card.aria ?? card.alt}
  title={card.alt}
  className="group block"
>
  {/* KHUNG 4:5: nếu trình duyệt support aspect-ratio thì dùng, nếu không thì dùng height fallback */}
  <div
    className="
      relative
      w-[160px] sm:w-[180px] md:w-[208px]
      supports-[aspect-ratio:1/1]:aspect-[4/5]
      h-[200px] sm:h-[225px] md:h-[260px]  /* fallback khi không support aspect-ratio */
      rounded-md overflow-hidden
    "
  >
    <img
      src={card.src}
      alt={card.alt}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.035]"
    />
  </div>

  {/* caption (giữ nguyên) */}
  {card.caption && (
    <div className="mt-2 text-center text-xxl text-gray-700">
      <span className="inline-block transition-colors group-hover:text-gray-900 group-hover:underline">
        {card.caption}
      </span>
    </div>
  )}
</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
