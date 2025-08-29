// src/components/home/BrandCardsSection.tsx
"use client";

import React from "react";
import Link from "next/link";

type BrandCard = {
  title: string;
  desc: string;
  image: string;
  href: string;
  external?: boolean;
};

const CARDS: BrandCard[] = [
  {
    title: "Thẻ quà tặng Losia",
    desc: "Trao quà cho người thân món đồ seconhand — phong cách, tiết kiệm và bền vững.",
    image:
      "assets/images/home/gift-card.png",
    href: "",
    external: true,
  },
  {
    title: "Đăng ký nhận email",
    desc: "Cập nhật sự kiện sale, khuyến mãi và sản phẩm mới về ngay trong hộp thư của bạn.",
    image:
      "assets/images/home/Email List.png",
    href: "/my/subscriptions",
  },
  {
    title: "Kết nối mạng xã hội",
    desc: "Xem cộng đồng khoe những món đồ vintage, tham gia quà tặng và nhiều hơn thế.",
    image:
      "assets/images/home/Facebook.png",
    href: "",
    external: true,
  },
];

export default function BrandCardsSection() {
  return (
    <section
      className="relative isolate w-full bg-white py-10"
      data-component="brand-cards"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* (Tiêu đề để trống theo mẫu) */}
        <h2 className="sr-only">Brand Cards</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => {
            const Wrapper = card.external ? "a" : Link;
            const wrapperProps = card.external
              ? {
                  href: card.href,
                  target: "_blank",
                  rel: "noreferrer",
                }
              : { href: card.href };

            return (
              <Wrapper
                key={card.title}
                {...wrapperProps}
                className="group relative flex flex-col overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="h-48 w-full rounded-md object-cover"
                />
                <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:underline">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
