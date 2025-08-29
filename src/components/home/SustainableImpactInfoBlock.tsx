// src/components/home/SustainableImpactInfoBlock.tsx
"use client";

import React from "react";
import Link from "next/link";

const STATS = [
  {
    icon: "assets/icons-png/co2.png",
    alt: "25% Carbon reduced",
    value: "25%",
    label: "Khí thải CO₂ giảm",
  },
  {
    icon: "assets/icons-png/light-bulb.png",
    alt: "24% Energy reduced",
    value: "24%",
    label: "Năng lượng tiết kiệm",
  },
  {
    icon: "assets/icons-png/waterdrop.png",
    alt: "32% Water saved",
    value: "32%",
    label: "Nước được tiết kiệm",
  },
];

export default function SustainableImpactInfoBlock() {
  return (
    <section
      className="relative isolate w-full bg-green-300 py-12"
      data-component="sustainable-impact"
    >
      <div className="mx-auto max-w-4xl px-4 text-center">
        {/* Title */}
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
          Mua & mặc 1 sản phẩm secondhand là bạn đã góp phần:
        </h2>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center justify-center rounded-lg bg-white/70 p-4 shadow-sm backdrop-blur"
            >
              <img
                src={stat.icon}
                alt={stat.alt}
                width={60}
                height={60}
                loading="lazy"
                className="h-14 w-14"
              />
              <h3 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">
                {stat.value}
              </h3>
              <p className="mt-1 text-sm text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href=""
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          >
            TÌM HIỂU THÊM
          </Link>
        </div>
      </div>
    </section>
  );
}
