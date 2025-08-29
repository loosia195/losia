// src/components/home/AboutBlock.tsx
"use client";

import React from "react";
import Link from "next/link";

const BLOCKS = [
  {
    title: "Tận hưởng",
  desc: "Khoảnh khắc tuyệt vời săn lùng được những món độc lạ với mức giá bất ngờ.",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#10b981"
      width="60"
      height="60"
    >
      {/* Vòng tròn mặt */}
      <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.5" />
      {/* Mắt trái */}
      <circle cx="9" cy="10" r="0.75" fill="#10b981" />
      {/* Mắt phải */}
      <circle cx="15" cy="10" r="0.75" fill="#10b981" />
      {/* Miệng cười */}
      <path
        d="M8.5 14.5c1 1.2 2.5 2 3.5 2s2.5-0.8 3.5-2"
        stroke="#10b981"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    ),
  },
  {
    title: "Tỏa sáng",
  desc: "Bạn trở nên rạng rỡ khi diện những món đồ secondhand độc đáo.",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="60"
      height="60"
      fill="none"
      stroke="#10b981"
      strokeWidth="1.5"
    >
      {/* Mặt tròn ở giữa */}
      <circle cx="12" cy="12" r="4" fill="none" stroke="#10b981" strokeWidth="1.5" />
      {/* Tia sáng */}
      <line x1="12" y1="2" x2="12" y2="5" stroke="#10b981" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="#10b981" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="#10b981" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="#10b981" strokeLinecap="round" />
      <line x1="4.2" y1="4.2" x2="6.5" y2="6.5" stroke="#10b981" strokeLinecap="round" />
      <line x1="17.5" y1="17.5" x2="19.8" y2="19.8" stroke="#10b981" strokeLinecap="round" />
      <line x1="17.5" y1="6.5" x2="19.8" y2="4.2" stroke="#10b981" strokeLinecap="round" />
      <line x1="4.2" y1="19.8" x2="6.5" y2="17.5" stroke="#10b981" strokeLinecap="round" />
    </svg>
    ),
  },
  {
    title: "Trao đi",
  desc: "Chia sẻ những món đồ bạn không dùng nữa để chúng có cuộc sống mới.",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="60"
      height="60"
      fill="none"
      stroke="#10b981"
      strokeWidth="1.5"
    >
      {/* Hai bàn tay đỡ */}
      <path
        d="M3 15c2 0 4 1 5.5 2.5S11 21 12 21s2.5-1.5 3.5-2.5S19 15 21 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trái tim tượng trưng cho việc trao đi */}
      <path
        d="M12 6.5c-1.5-2-5-1.5-5 1.5 0 2.5 5 5.5 5 5.5s5-3 5-5.5c0-3-3.5-3.5-5-1.5z"
        fill="#10b981"
        stroke="#10b981"
        strokeLinejoin="round"
      />
    </svg>
    ),
  },
];

export default function AboutBlock() {
  return (
    <section
      className="relative isolate w-full bg-gray-50 py-12"
      data-component="about-block"
    >
      <div className="mx-auto max-w-5xl px-4 text-center">
        {/* Header */}
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-emerald-600 py-2">
            Tiết kiệm hơn
          </div>
          <h2 className="mt-1 text-3xl font-bold uppercase text-gray-900">
            Giảm thiểu rác thải
          </h2>
        </div>

        {/* 3 blocks */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {BLOCKS.map((block) => (
            <div key={block.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center">
                {block.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{block.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{block.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
          >
            Về chúng tôi
          </Link>
        </div>
      </div>
    </section>
  );
}
