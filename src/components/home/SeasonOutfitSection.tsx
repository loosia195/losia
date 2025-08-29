// src/components/home/SeasonOutfitSection.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import SmartImage from "@/components/media/SmartImage";
import { normalizeImageUrl, pickDemoImageUrl } from "@/lib/images";

/** ===== Types khớp với shapeCard ===== */
type ProductCard = {
  id: string;
  title: string;
  price: number | null | undefined;
  oldPrice?: number | null;
  retailPrice?: number | null;
  brandName?: string | null;
  productTypeName?: string | null;
  sizeLabel?: string | null;
  favoriteCount?: number | null;
  images?: Array<string | { url?: string | null; main?: string | null; thumb?: string | null; order?: number | null }>;
  cover?: string | null;
  conditionValue?: string | null;
};

const fmtVND = (n?: number | null) =>
  n == null ? "" : n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+";

const nn = (v: any) => {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

const isNewWithTags = (raw?: string | null) => {
  const s = nn(raw);
  if (!s) return false;
  const t = s.toLowerCase().replace(/[_-]/g, " ");
  return ["new with tags", "nwt", "bnwt", "brand new with tags"].includes(t);
};

const percentOff = (price?: number | null, oldPrice?: number | null) => {
  if (price == null || oldPrice == null || oldPrice <= price) return null;
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return pct > 0 ? pct : null;
};

// Nhận cả string[] hoặc object[]
function firstImageSrc(p: ProductCard, index?: number) {
  const normalizeUrl = (u?: string | null) => (u && u.trim() ? normalizeImageUrl(u) : undefined);

  const cover = normalizeUrl(p.cover ?? undefined);
  if (cover) return cover;

  const arr = p.images ?? [];
  if (!arr.length) return pickDemoImageUrl({ id: p.id, sku: p.id, index });

  const first = arr[0] as any;
  const raw = typeof first === "string" ? first : first?.url || first?.main || first?.thumb || undefined;
  return normalizeUrl(raw) ?? pickDemoImageUrl({ id: p.id, sku: p.id, index });
}

const PROMO_TEXT = "Giảm 50% với mã FALL50";

/** ===== Chuẩn hoá input về ProductCard (khớp API anh đang trả) ===== */
function normalize(input: any, index?: number): ProductCard {
  const price =
    typeof input?.price === "number"
      ? input.price
      : typeof input?.salePrice === "string"
      ? Number(String(input.salePrice).replace(/[^\d]/g, "")) || null
      : null;

  const oldPrice =
    typeof input?.oldPrice === "number"
      ? input.oldPrice
      : typeof input?.originalPrice === "string"
      ? Number(String(input.originalPrice).replace(/[^\d]/g, "")) || null
      : null;

  return {
    id: String(input?.id ?? input?.slug ?? crypto.randomUUID()),
    title: String(input?.title ?? ""),
    price,
    oldPrice,
    retailPrice: typeof input?.retailPrice === "number" ? input.retailPrice : typeof oldPrice === "number" ? oldPrice : null,

    // LẤY THẲNG từ API (đã có sẵn)
    brandName: input?.brandName ?? input?.brand?.name ?? null,
    productTypeName: input?.productTypeName ?? input?.productType?.name ?? input?.category?.name ?? null,
    sizeLabel: input?.sizeLabel ?? input?.size ?? input?.sizeDisplay ?? input?.size?.label ?? null,

    // ảnh: API trả string[] + cover
    images: Array.isArray(input?.images) ? input.images : [],
    cover: typeof input?.cover === "string" ? input.cover : null,

    favoriteCount: input?.favoriteCount ?? input?._count?.favorites ?? 0,
    conditionValue: input?.conditionValue ?? input?.condition ?? null,
  };
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={clsx("h-4 w-4", className)} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M9.46967.46967c-.29289.29289-.29289.76777 0 1.06066L17.1893 9.25H1a.75.75 0 0 0 0 1.5h16.1893l-7.71963 7.7197c-.29289.2929-.29289.7678 0 1.0607.2929.2928.76773.2928 1.06063 0l9.00003-9.0001c.2929-.2929.2929-.7677 0-1.0606L10.5303.46967c-.2929-.29289-.76773-.29289-1.06063 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ===== Card (Brand ProductType + Size) ===== */
function CardLikeProducts({ p, index }: { p: ProductCard; index: number }) {
  const imgUrl = firstImageSrc(p, index);
  const nwt = isNewWithTags(p.conditionValue);
  const discount = percentOff(p.price, p.oldPrice);

  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite((v) => !v);
  };

  return (
    <div className="group snap-start shrink-0 w-[180px]">
      <div className="relative rounded-2xl border hover:shadow-sm transition overflow-hidden">
        {/* ẢNH */}
        <Link href={`/product/${p.id}`} className="block relative z-0">
          <SmartImage
            kind="product"
            alt={p.title || "product image"}
            preset="plp"
            src={imgUrl}
            className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-100"
            imgClassName="object-cover transition duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* NEW WITH TAGS */}
          {nwt && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-1 leading-none shadow-sm">
              NEW<br />WITH<br />TAGS
            </span>
          )}

          {/* Favorite */}
          <button
            type="button"
            aria-label={isFavorite ? "Unfavorite" : "Favorite"}
            onClick={toggleFavorite}
            className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 h-8 w-8"
          >
            <Image
              src={isFavorite ? "/assets/icons/heart-solid.svg" : "/assets/icons/heart-outline.svg"}
              alt="Favorite"
              width={18}
              height={18}
              loading="lazy"
            />
          </button>

          {/* % giảm */}
          {discount && (
            <span className="absolute left-2 top-2 text-xs px-2 py-1 rounded-full bg-rose-600 text-white">
              -{discount}%
            </span>
          )}
        </Link>

        {/* THÔNG TIN */}
        <div className="p-3 relative z-10">
          {/* Dòng 1: Brand + ProductType (chỉ render khi có ít nhất một) */}
  {p.brandName && (
    <Link href={`/product/${p.id}`} className="block text-sm text-gray-900" title={p.title || ""}>
      <span className="font-semibold">{p.brandName}</span>
    </Link>
  )}

          {/* Dòng 2: Size */}
          {p.sizeLabel && <div className="mt-0.5 text-xs text-gray-600">Size {p.sizeLabel}</div>}

          {/* Giá */}
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[15px] font-bold">{fmtVND(p.price)}</span>
            {p.oldPrice && (p.price ?? 0) < p.oldPrice && (
              <span className="text-xs text-gray-500 line-through">{fmtVND(p.oldPrice)}</span>
            )}
          </div>

          {/* Promo */}
          <div className="mt-1 text-[11px] text-rose-700">{PROMO_TEXT}</div>
        </div>
      </div>
    </div>
  );
}

/** ===== Header ===== */
function SectionHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="my-auto">
        <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Trang phục theo mùa</h2>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/season-outfits"
          className="hidden rounded border border-gray-900 px-3 py-1.5 text-sm font-semibold uppercase hover:bg-gray-900 hover:text-white sm:inline-flex"
        >
          Xem tất cả
        </Link>
      </div>
    </div>
  );
}

/** ===== Section ===== */
export default function SeasonOutfitSection({ items: itemsProp }: { items?: any[] }) {
  const [items, setItems] = useState<ProductCard[]>(
    Array.isArray(itemsProp) ? itemsProp.map((x, i) => normalize(x, i)) : []
  );
  const [ready, setReady] = useState<boolean>(!!itemsProp && items.length > 0);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (itemsProp && itemsProp.length) return;
    let cancelled = false;
    (async () => {
      try {
        let res = await fetch("/api/season-outfits?limit=16", { cache: "no-store" });
        if (!res.ok) res = await fetch("/api/products?limit=16", { cache: "no-store" });
        if (res.ok) {
          const raw = await res.json();
          const list = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
          const norm = list.map((x: any, i: number) => normalize(x, i));
          if (!cancelled) setItems(norm);
        }
      } catch {
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [itemsProp]);

  if (ready && items.length === 0) return null;

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);
  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [items.length, updateArrows]);

  const scrollByCards = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.5, 380);
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <section className="relative w-full bg-white" aria-roledescription="carousel" aria-label="Trang phục theo mùa">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SectionHeader />

        {!ready && items.length === 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {skeletons.map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="aspect-[4/5] bg-gray-100" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative mt-4">
            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scroll-smooth sm:gap-4"
              role="group"
              aria-label="Danh sách sản phẩm dạng cuộn ngang"
              onScroll={updateArrows}
            >
              {items.map((p, i) => (
                <CardLikeProducts key={p.id} p={p} index={i} />
              ))}
            </div>

            {/* Prev */}
            <button
              aria-label="Xem về trước"
              onClick={() => scrollByCards("prev")}
              disabled={!canPrev}
              className={clsx(
                "absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow-sm backdrop-blur transition",
                "hidden sm:inline-flex",
                canPrev ? "hover:bg-black hover:text-white" : "cursor-not-allowed opacity-40"
              )}
            >
              <Arrow className="rotate-180" />
            </button>

            {/* Next */}
            <button
              aria-label="Xem tiếp theo"
              onClick={() => scrollByCards("next")}
              disabled={!canNext}
              className={clsx(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow-sm backdrop-blur transition",
                "hidden sm:inline-flex",
                canNext ? "hover:bg-black hover:text-white" : "cursor-not-allowed opacity-40"
              )}
            >
              <Arrow />
            </button>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-4 flex justify-center sm:hidden">
          <Link
            href="/season-outfits"
            className="inline-flex w-full max-w-xs items-center justify-center rounded border border-gray-900 px-4 py-2 text-sm font-semibold uppercase hover:bg-gray-900 hover:text-white"
          >
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
}
