"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Các link vẫn hiển thị bình thường nhưng khi click sẽ chặn và hiện thông báo.
// Muốn bật link nào, thêm đường dẫn vào ENABLED_PATHS.
const ENABLED_PATHS = new Set<string>([
  // "/women?department_tags=women&material_groups=cashmere",
]);

type Card = {
  href: string;
  src: string;
  alt: string;
  caption: string;
};

const CARDS: Card[] = [
  {
    href: "/women?department_tags=women&material_groups=cashmere",
    src: "assets/images/home/cashmere.png",
    alt: "cashmere fabric",
    caption: "Cashmere",
  },
  {
    href: "/women?department_tags=women&material_groups=linen",
    src: "assets/images/home/linen.png",
    alt: "linen fabric",
    caption: "Linen",
  },
  {
    href: "/women?department_tags=women&material_groups=cotton&text=clothing&skip_fallback=true",
    src: "assets/images/home/cotton.png",
    alt: "cotton fabric",
    caption: "Cotton",
  },
  {
    href: "/women?department_tags=women&material_groups=silk",
    src: "assets/images/home/silk.png",
    alt: "silk fabric",
    caption: "Silk",
  },
];

// -----------------------------
// Small toast for blocked links
// -----------------------------
function BlockedToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="fixed left-1/2 top-3 z-[90] -translate-x-1/2"
        >
          <div className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm shadow-lg">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -----------------------------
// Link giữ style, chặn điều hướng nếu chưa bật
// -----------------------------
function SmartLink({
  href,
  className,
  title,
  ariaLabel,
  children,
  onBlocked,
}: {
  href: string;
  className?: string;
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  onBlocked?: () => void;
}) {
  const enabled = ENABLED_PATHS.has(href);
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!enabled) {
      e.preventDefault();
      onBlocked?.();
    }
  };
  const handleKey: React.KeyboardEventHandler<HTMLAnchorElement> = (e) => {
    if (!enabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onBlocked?.();
    }
  };
  return (
    <Link href={href} className={className} title={title} aria-label={ariaLabel} onClick={handleClick} onKeyDown={handleKey}>
      {children}
    </Link>
  );
}

export default function NaturalMaterialsSection() {
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const clearTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
  }, []);

  function showBlockedToast() {
    setBlockedMsg("Tính năng sẽ mở sớm. Cảm ơn anh đã chờ!");
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setBlockedMsg(null), 2500);
  }

  return (
    <section className="relative isolate w-full bg-white py-10" data-component="natural-materials">
      {/* Toast */}
      <BlockedToast message={blockedMsg} />

      <div className="mx-auto max-w-6xl px-4 text-center">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          100% chất liệu tự nhiên. 100% secondhand.
        </h2>
        {/* Phụ đề */}
        <h3 className="mt-2 text-sm text-gray-600 md:text-base">
          Làm mới tủ đồ của bạn với chất liệu tự nhiên, không cần mua mới đắt đỏ.
        </h3>

        {/* Grid ảnh */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {CARDS.map((card) => (
            <SmartLink
              key={card.href}
              href={card.href}
              ariaLabel={card.alt}
              title={card.alt}
              className="group block w-full"
              onBlocked={showBlockedToast}
            >
              {/* Khung ảnh */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md bg-gray-50">
                <img
                  src={card.src}
                  alt={card.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-1 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                />
              </div>
              {/* Caption */}
              <div className="mt-2 text-center text-sm text-gray-700">
                <span className="inline-block transition-colors group-hover:text-gray-900 group-hover:underline">
                  {card.caption}
                </span>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
