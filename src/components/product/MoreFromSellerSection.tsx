"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SmartImage from "@/components/media/SmartImage";
import { normalizeImageUrl, pickDemoImageUrl } from "@/lib/images";

/** ====== Types (gọn cho card) ====== */
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
  images?: Array<{ url?: string | null; main?: string | null; thumb?: string | null; order?: number | null }>;
};

type Props = {
  currentProductId: string;
  sellerId?: string;
  limit?: number;
  showTitle?: boolean;
  sellerLabel?: string;
};

/** ====== Helpers ====== */
const fmtVND = (n?: number | null) =>
  n == null ? "" : n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+";

const isNewWithTags = (raw?: string | null) => {
  if (!raw) return false;
  const s = String(raw).toLowerCase().replace(/[_-]/g, " ");
  return ["new with tags", "nwt", "bnwt", "brand new with tags"].includes(s);
};

const percentOff = (price?: number | null, oldPrice?: number | null) => {
  if (price == null || oldPrice == null || oldPrice <= price) return null;
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return pct > 0 ? pct : null;
};

// Lấy src ảnh đầu tiên (ưu tiên url → main → thumb), có fallback demo như trang Products
function getProductImgUrl(p: ProductCard, index?: number) {
  const img = p.images?.[0];
  const raw = (img?.url || img?.main || img?.thumb) ?? undefined;
  return normalizeImageUrl(raw) ?? pickDemoImageUrl({ id: p.id, sku: p.id, index });
}

const PROMO_TEXT = "Giảm 50% với mã FALL50";

/** ====== Section ====== */
export default function MoreFromSellerSection({
  currentProductId,
  sellerId,
  limit = 8,
  showTitle = true,
  sellerLabel = "this seller",
}: Props) {
  const [items, setItems] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const skeletons = useMemo(() => Array.from({ length: Math.min(limit, 8) }), [limit]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("exclude", currentProductId);
        if (sellerId) params.set("seller", String(sellerId));

        const res = await fetch(`/api/products/by-seller?${params.toString()}`, { cache: "no-store" });
        const data = res.ok ? await res.json() : { items: [] };
        if (!mounted) return;

        const normalized: ProductCard[] = (data.items || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price ?? null,
          oldPrice: p.oldPrice ?? null,
          retailPrice: typeof p.retailPrice === "number" ? p.retailPrice : p.oldPrice ?? null,
          brandName: p.brandName ?? p.brand?.name ?? null,
          productTypeName: p.productTypeName ?? p.category?.name ?? null,
          sizeLabel: p.sizeLabel ?? p.sizeDisplay ?? (typeof p.size === "string" ? p.size : null),
          favoriteCount: p.favoriteCount ?? p?._count?.favorites ?? null,
          images: Array.isArray(p.images) ? p.images : [],
        }));
        setItems(normalized);
      } catch {
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentProductId, sellerId, limit]);

  const recalcArrows = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    recalcArrows();
    const onScroll = () => recalcArrows();
    const onResize = () => recalcArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [recalcArrows]);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === "left" ? -1 : 1) * Math.round(el.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <section className="mt-12">
      {showTitle && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Các Sản Phẩm Khác Từ Người Bán</h2>
        </div>
      )}

      <div className="relative group">
        {/* Mobile: carousel; Desktop: grid */}
        <div
          ref={listRef}
          className="
            flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar
            md:overflow-visible md:snap-none md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:gap-4
          "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" as any }}
        >
          <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

          {loading
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : items.length > 0
            ? items.map((p, i) => <CardLikeProducts key={p.id} p={p} index={i} />)
            : <EmptyCard />}
        </div>

        {/* Prev/Next (mobile) */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollByAmount("left")}
          disabled={!canPrev}
          className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center"
        >
          <img src="/assets/icons/arrow-left.svg" alt="" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollByAmount("right")}
          disabled={!canNext}
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center"
        >
          <img src="/assets/icons/arrow-right.svg" alt="" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/* ================== Card giống trang Products ================== */
function CardLikeProducts({ p, index }: { p: ProductCard; index: number }) {
  const imgUrl = getProductImgUrl(p, index);
  const nwt = isNewWithTags(p as any);
  const discount = percentOff(p.price, p.oldPrice);

  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite((v) => !v);
  };

  return (
    <div className="group snap-start shrink-0 w-[170px] md:w-auto">
      <div className="relative rounded-2xl border hover:shadow-sm transition overflow-hidden">
        <Link href={`/product/${p.id}`} className="block relative">
          <SmartImage
            kind="product"
            alt={p.title}
            preset="plp"
            src={imgUrl}
            className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-100"
            imgClassName="object-cover transition duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* NEW WITH TAGS (trái trên) */}
          {nwt && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-1 leading-none shadow-sm">
              NEW<br/>WITH<br/>TAGS
            </span>
          )}

          {/* Tim (phải trên) */}
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

          {/* % giảm (trái trên) */}
          {discount && (
            <span className="absolute left-2 top-2 text-xs px-2 py-1 rounded-full bg-rose-600 text-white">
              -{discount}%
            </span>
          )}
        </Link>

        <div className="p-3">
          {/* Brand + type */}
          <Link href={`/product/${p.id}`} className="block text-sm" title={p.title}>
            <span className="font-semibold">{p.brandName || p.title.split(" ")[0]}</span>
            {p.productTypeName && <span className="text-gray-600"> {p.productTypeName}</span>}
          </Link>

          {/* Size */}
          {p.sizeLabel && <div className="mt-0.5 text-xs text-gray-600">Size {p.sizeLabel}</div>}

          {/* Giá */}
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[15px] font-bold">{fmtVND(p.price)}</span>
            {p.oldPrice && p.oldPrice > (p.price ?? 0) && (
              <span className="text-xs text-gray-500 line-through">{fmtVND(p.oldPrice)}</span>
            )}
          </div>

          {/* Promo line */}
          <div className="mt-1 text-[11px] text-rose-700">{PROMO_TEXT}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Skeleton ---------- */
function SkeletonCard() {
  return (
    <div className="snap-start shrink-0 w-[170px] md:w-auto">
      <div className="rounded-2xl border overflow-hidden animate-pulse">
        <div className="w-full" style={{ aspectRatio: "4 / 5" }}>
          <div className="h-full w-full bg-gray-100" />
        </div>
      </div>
      <div className="mt-2 h-3.5 w-24 rounded bg-gray-100" />
      <div className="mt-2 h-3.5 w-5/6 rounded bg-gray-100" />
      <div className="mt-1.5 h-3 w-24 rounded bg-gray-100" />
    </div>
  );
}

/* ---------- Empty ---------- */
function EmptyCard() {
  return (
    <div className="snap-start shrink-0 w-full md:w-auto rounded-[6px] border bg-white p-6 text-sm text-gray-600">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-100" />
        <div>
          <p className="font-medium text-gray-800">Chưa có sản phẩm khác</p>
          <p className="text-gray-600">Khám phá thêm ở trang chủ nhé.</p>
        </div>
      </div>
    </div>
  );
}
