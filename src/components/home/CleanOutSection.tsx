// src/components/home/CleanOutSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

type Tone = "mint" | "white" | "gray";

interface CleanOutSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
  /** Nền chạy full chiều ngang hay theo container */
  fullBleed?: boolean;
  /** Tông nền */
  tone?: Tone;
  /** Căn chữ (md+): left | center */
  align?: "left" | "center";
  className?: string;
}

const toneMap: Record<Tone, string> = {
  mint: "bg-green-300",
  white: "bg-white",
  gray: "bg-gray-50",
};

export default function CleanOutSection({
  title = "Nhận miễn phí Losia Bag",
  subtitle = "Ưu đãi trong thời gian có hạn! Tiết kiệm thêm 50% phí xử lý khi gửi đồ.",
  ctaText = "Tìm hiểu thêm",
  ctaHref = "",
  imageSrc = "/assets/images/home/free bag.png",
  fullBleed = true,
  tone = "mint",
  align = "left",
  className,
}: CleanOutSectionProps) {
  const Inner = (
    <div
      className={clsx(
        "relative isolate overflow-hidden ",
        // màu nền
        toneMap[tone]
      )}
      data-component="cleanout-section"
    >
      {/* Overlay link: click toàn bộ billboard */}
      <Link
        href={ctaHref}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-[1]"
      />

      {/* Lưới 2 cột (stack trên mobile) */}
      <div className="relative z-[2] flex flex-col sm:flex-row items-stretch">
        {/* Khối text */}
        <div
          className={clsx(
            "flex w-full sm:w-1/2 items-center",
            "px-8 py-10 sm:px-16 sm:py-20"
          )}
        >
          <div
            className={clsx(
              "w-full",
              align === "left"
                ? "text-left"
                : "text-center sm:text-center"
            )}
          >
            <h2 className="text-2xl font-bold tracking-tight text-black md:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-black/80 md:text-base">
              {subtitle}
            </p>

            <div
              className={clsx(
                "mt-4",
                align === "left" ? "" : "sm:flex sm:justify-center"
              )}
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded border border-black bg-white px-4 py-2 text-sm font-semibold uppercase text-black transition hover:bg-black hover:text-white"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        </div>

        {/* Khối ảnh */}
        <div className="relative w-full sm:w-1/2">
          <Image
            alt="clean out bag"
            src={imageSrc}
            width={640}
            height={400}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );

  return fullBleed ? (
    // Full-bleed: nền kéo sát mép, nội dung canh giữa
    <section className={clsx("w-full", className)}>
      <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-8">
          {Inner}
        </div>
      </div>
    </section>
  ) : (
    // Theo container
    <section className={clsx("w-full", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{Inner}</div>
    </section>
  );
}
