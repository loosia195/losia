// src/components/home/HeaderCarousel.tsx
"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";

type Card = {
  href: string;
  src: string;
  alt: string;
  caption: string;
  aria?: string;
};

const CARDS: Card[] = [
  {
    href: "",
    src: "assets/images/home/Dresses.png",
    alt: "Vintage dresses",
    caption: "Váy vintage",
    aria: "vintage dress",
  },
  {
    href: "",
    src: "assets/images/home/cotton shirt.png",
    alt: "cotton shirts",
    caption: "Áo xô",
    aria: "cotton shirts",
  },
  {
    href: "",
    src: "assets/images/home/pants.png",
    alt: "Mẫu mặc quần pants",
    caption: "Quần vintage",
    aria: "vintage pants",
  },
  {
    href: "",
    src: "assets/images/home/tweed.png",
    alt: "vintage tweed",
    caption: "Áo dạ tweed",
    aria: "vintage tweed",
  },
];

export default function HeaderCarousel() {
  return (
    <section
      className="relative isolate w-full border-y border-gray-200 bg-white py-8"
      data-component="header-carousel"
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Xin chào mùa thu
        </h2>

        {/* Phụ đề */}
        <h3 className="mt-2 text-sm text-gray-600 md:text-base">
          Thỏa sức “quẩy” cùng những món độc lạ – chỉ bạn mới săn được.
        </h3>

        {/* Dãy 4 ảnh/link */}
        <div className="mt-6 grid grid-cols-2 justify-items-center gap-2 sm:grid-cols-4 sm:gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              aria-label={card.aria ?? card.alt}
              title={card.alt}
              className="group block w-full max-w-[12.5rem] sm:max-w-[13.5rem] md:max-w-[14.5rem]"
            >
              {/* Ảnh vuông, lớn dần theo breakpoint (gần kích cỡ thẻ nhỏ của ThredUp) */}
              <img
                src={card.src}
                alt={card.alt}
                loading="lazy"
                sizes="(max-width: 640px) 160px, (max-width: 768px) 176px, 208px"
                className={clsx(
                  "mx-auto w-40 sm:w-44 md:w-52", // ~160/176/208px
                  " object-cover",
                  "transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                )}
              />
              {/* Caption */}
              <div className="mt-2 text-center text-xxl text-gray-700">
                <span className="inline-block transition-colors group-hover:text-gray-900 group-hover:underline">
                  {card.caption}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
