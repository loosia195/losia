"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SmartImage from "@/components/media/SmartImage";
import { normalizeImageUrl, pickDemoImageUrl } from "@/lib/images";
import Image from "next/image"; // nhớ import trên đầu file


// ===== Types =====
type ProductImage = {
  url?: string | null;
  main?: string | null;
  thumb?: string | null;
  alt?: string | null;
  order?: number | null;
};
type ProductCard = {
  id: string;
  sku: string;
  title: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  condition?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
  images?: (ProductImage | string)[] | null;   // 👈 thêm string[]

  // 👇 nếu API có thì hiển thị; không có sẽ ẩn dòng tương ứng
  brandName?: string | null;          // ví dụ p.brand?.name trong API
  productTypeName?: string | null;    // ví dụ category/name hoặc type
  sizeLabel?: string | null;          // "XS", "S", "M"...
};

// ✅ LQIP blur nhỏ (1×1)
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+";

// Lấy src ảnh từ dữ liệu (ưu tiên url → main → thumb)
function getFirstImageSrc(p: ProductCard): string | undefined {
  if (!Array.isArray(p.images) || p.images.length === 0) return undefined;

  if (typeof p.images[0] === "string") {
    return normalizeImageUrl(p.images[0] as string);
  }

  const sorted = [...(p.images as ProductImage[])].sort(
    (a, b) => (a?.order ?? 0) - (b?.order ?? 0)
  );
  const img = sorted[0];
  const raw = img?.url || img?.main || img?.thumb;
  return normalizeImageUrl(raw);
}

function isNewWithTags(cond?: string | null) {
  if (!cond) return false;
  const s = String(cond).toLowerCase().replace(/[_-]/g, " ");
  return ["new with tags", "nwt", "bnwt", "brand new with tags", "new_with_tags"].includes(s);
}

const PROMO_TEXT = "Giảm 50% với mã FALL50"; // tuỳ biến sau


// Ưu tiên ảnh thật → fallback demo 07–20 (ổn định theo id/sku/index)
function getProductImgUrl(p: ProductCard, index?: number) {
  return getFirstImageSrc(p) ?? pickDemoImageUrl({ id: p.id, sku: p.sku, index });
}



/** ====== Helper ====== */
const fmtVND = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const firstImageUrl = (p: ProductCard, index?: number) =>
  getProductImgUrl(p, index) || "/assets/images/thumb/01-thumb.jpg";


function getDiscountPercent(p: ProductCard) {
  if (!p.oldPrice || p.oldPrice <= p.price) return null;
  const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  return pct > 0 ? pct : null;
}

/** ====== Config UI ====== */
const ITEMS_PER_LOAD = 24;
const DEFAULT_SORT = "newest"; // "newest" | "price_asc" | "price_desc" | "discount_desc"
const ALL_CONDITIONS = [
  { key: "new_with_tags", label: "Mới (còn tag)" },
  { key: "excellent", label: "Như mới" },
  { key: "good", label: "Tốt" },
];
const ALL_CATEGORIES = ["Đầm", "Áo", "Quần", "Váy", "Phụ kiện"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL"];
const ALL_COLORS = ["Đỏ", "Xanh", "Đen", "Trắng", "Be"];
const ALL_MATERIALS = ["Cotton", "Linen", "Silk", "Chiffon", "Denim"];

/** ====== Page ====== */
export default function ProductsPage() {
  const router = useRouter();
  const params = useSearchParams();

  /** ---- State dữ liệu ---- */
  const [allProducts, setAllProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /** ---- State bộ lọc (đọc từ URL nếu có) ---- */
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    params.getAll("category").length ? params.getAll("category") : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    params.getAll("size").length ? params.getAll("size") : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    params.getAll("color").length ? params.getAll("color") : []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    params.getAll("material").length ? params.getAll("material") : []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    params.getAll("condition").length ? params.getAll("condition") : []
  );
  const [sortBy, setSortBy] = useState<string>(params.get("sort") || DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    (params.get("view") as "grid" | "list") || "grid"
  );

  /** ---- Price range (tự động theo data) ---- */
  const minPrice = useMemo(() => {
    if (!allProducts.length) return 0;
    return Math.min(...allProducts.map((p) => p.price ?? 0));
  }, [allProducts]);

  const maxPrice = useMemo(() => {
    if (!allProducts.length) return 0;
    return Math.max(...allProducts.map((p) => p.price ?? 0));
  }, [allProducts]);

  const initialMin = Number(params.get("priceMin") || minPrice || 0);
  const initialMax = Number(params.get("priceMax") || maxPrice || 0);

  const [priceMin, setPriceMin] = useState<number>(initialMin);
  const [priceMax, setPriceMax] = useState<number>(initialMax);

  /** ---- Quick View Modal ---- */
  const [quickView, setQuickView] = useState<ProductCard | null>(null);

  /** ---- Load more (infinite) ---- */
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** ---- Fetch danh sách sản phẩm ----
   *  TODO: Anh có thể thay bằng endpoint kèm filter server-side.
   *  Tạm thời em load ~200 sản phẩm rồi lọc/sort ở client để demo UI.
   */
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || "";
        const url = `${base}/api/products?limit=200`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setAllProducts(Array.isArray(data) ? data : data?.items ?? []);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Lỗi tải sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /** ---- Đồng bộ URL khi filter/sort/view thay đổi ---- */
  useEffect(() => {
    const sp = new URLSearchParams();

    selectedCategories.forEach((v) => sp.append("category", v));
    selectedSizes.forEach((v) => sp.append("size", v));
    selectedColors.forEach((v) => sp.append("color", v));
    selectedMaterials.forEach((v) => sp.append("material", v));
    selectedConditions.forEach((v) => sp.append("condition", v));

    if (sortBy && sortBy !== DEFAULT_SORT) sp.set("sort", sortBy);
    if (viewMode !== "grid") sp.set("view", viewMode);

    if (priceMin && priceMin > 0) sp.set("priceMin", String(priceMin));
    if (priceMax && maxPrice && priceMax < maxPrice) sp.set("priceMax", String(priceMax));

    const qs = sp.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
    // reset số lượng hiển thị mỗi khi filter/sort đổi
    setVisibleCount(ITEMS_PER_LOAD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategories,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    selectedConditions,
    priceMin,
    priceMax,
    sortBy,
    viewMode,
    maxPrice,
  ]);

  /** ---- Lọc & sắp xếp client-side ---- */
  const filteredSorted = useMemo(() => {
    let arr = [...allProducts];

    // Price
    arr = arr.filter((p) => p.price >= (priceMin || 0) && p.price <= (priceMax || Infinity));

    // Demo: các filter bên dưới giả định có data tương ứng.
    // Khi anh đã có field thật ở product, chỉ cần thay điều kiện filter.
    if (selectedConditions.length) {
      arr = arr.filter((p) => (p.condition ? selectedConditions.includes(p.condition) : false));
    }
    // if (selectedCategories.length) { ... }
    // if (selectedSizes.length) { ... }
    // if (selectedColors.length) { ... }
    // if (selectedMaterials.length) { ... }

    // Sort
    arr.sort((a, b) => {
      const aDisc = getDiscountPercent(a) ?? 0;
      const bDisc = getDiscountPercent(b) ?? 0;
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "discount_desc":
          return bDisc - aDisc;
        case "newest":
        default: {
          const at = new Date(a.createdAt || 0).getTime();
          const bt = new Date(b.createdAt || 0).getTime();
          return bt - at;
        }
      }
    });

    return arr;
  }, [
    allProducts,
    priceMin,
    priceMax,
    selectedConditions,
    // selectedCategories, selectedSizes, selectedColors, selectedMaterials,
    sortBy,
  ]);

  /** ---- Infinite scroll ---- */
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setVisibleCount((v) => (v < filteredSorted.length ? v + ITEMS_PER_LOAD : v));
        }
      },
      { rootMargin: "1200px 0px 0px 0px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [filteredSorted.length]);

  const visible = filteredSorted.slice(0, visibleCount);

  /** ---- Handlers ---- */
  const toggleMulti = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedConditions([]);
    setPriceMin(minPrice || 0);
    setPriceMax(maxPrice || 0);
  };

  /** ---- UI ---- */
  return (
    <div className="bg-white">
      {/* Hero / Intro */}
      <section className="border-b">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 lg:py-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Khám phá kho đồ secondhand cho bạn & bé
          </h1>
          <p className="mt-2 text-gray-600">
            Secondhand First — Like-new, tiết kiệm đến 90% so với giá ước tính retail.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:sticky lg:top-20 h-fit border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Bộ lọc</h2>
            <button
              onClick={resetFilters}
              className="text-sm underline text-gray-600 hover:text-gray-900"
            >
              Xoá tất cả
            </button>
          </div>

          {/* Giá */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Khoảng giá</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value || 0)))}
                  className="w-1/2 rounded-md border px-3 py-1.5"
                  min={0}
                />
                <span className="text-gray-500">—</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Math.max(priceMin, Number(e.target.value || 0)))}
                  className="w-1/2 rounded-md border px-3 py-1.5"
                  min={0}
                />
              </div>
              <div className="text-sm text-gray-500">
                {fmtVND(priceMin || 0)} — {fmtVND(priceMax || 0)}
              </div>
            </div>
          </div>

          {/* Tình trạng */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Tình trạng</h3>
            <div className="space-y-2">
              {ALL_CONDITIONS.map((c) => (
                <label key={c.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={selectedConditions.includes(c.key)}
                    onChange={() => toggleMulti(c.key, selectedConditions, setSelectedConditions)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Demo các filter khác (anh nối data thật sau) */}
          <Disclosure
            title="Danh mục"
            values={ALL_CATEGORIES}
            selected={selectedCategories}
            onToggle={(v) => toggleMulti(v, selectedCategories, setSelectedCategories)}
          />
          <Disclosure
            title="Kích thước"
            values={ALL_SIZES}
            selected={selectedSizes}
            onToggle={(v) => toggleMulti(v, selectedSizes, setSelectedSizes)}
          />
          <Disclosure
            title="Màu sắc"
            values={ALL_COLORS}
            selected={selectedColors}
            onToggle={(v) => toggleMulti(v, selectedColors, setSelectedColors)}
          />
          <Disclosure
            title="Chất liệu"
            values={ALL_MATERIALS}
            selected={selectedMaterials}
            onToggle={(v) => toggleMulti(v, selectedMaterials, setSelectedMaterials)}
          />
        </aside>

        {/* Main */}
        <section>
          {/* Top controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="text-sm text-gray-600">
              {loading ? "Đang tải..." : `Tìm thấy ${filteredSorted.length} sản phẩm`}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <label className="text-sm text-gray-600">Sắp xếp</label>
              <select
                className="rounded-md border px-3 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="discount_desc">Giảm giá nhiều</option>
              </select>

              {/* View toggle */}
              <div className="ml-2 inline-flex rounded-lg border">
                <button
                  aria-label="Dạng lưới"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                >
                  ⬛⬛
                </button>
                <button
                  aria-label="Dạng danh sách"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm border-l ${viewMode === "list" ? "bg-gray-100" : ""}`}
                >
                  ▤
                </button>
              </div>
            </div>
          </div>

{/* Grid/List */}
{err && (
  <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{err}</div>
)}

{loading ? (
  <SkeletonGrid />
) : visible.length === 0 ? (
  <div className="p-10 text-center text-gray-600 border rounded-2xl">
    Không có sản phẩm phù hợp. Thử điều chỉnh bộ lọc nhé anh.
  </div>
) : viewMode === "grid" ? (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
    {visible.map((p, index) => (
      <ProductCardItem key={p.id} p={p} index={index} onQuickView={() => setQuickView(p)} />
    ))}
  </div>
) : (
  <div className="space-y-4">
    {visible.map((p, index) => (
      <ProductListItem key={p.id} p={p} index={index} onQuickView={() => setQuickView(p)} />
    ))}
  </div>
)}

          {/* Sentinel để auto load thêm */}
          <div ref={sentinelRef} className="h-2" />

          {/* Nút tải thêm (fallback) */}
          {visible.length < filteredSorted.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + ITEMS_PER_LOAD)}
                className="px-5 py-2.5 rounded-xl border hover:bg-gray-50"
              >
                Tải thêm
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setQuickView(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-[92vw] p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold">{quickView.title}</h3>
              <button
                aria-label="Đóng"
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setQuickView(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4 md:gap-6">
<SmartImage
  kind="product"
  alt={quickView.title}
  preset="pdpMain"
  src={getProductImgUrl(quickView)}
  className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-gray-100"
  imgClassName="object-cover"
  placeholder="blur"
  blurDataURL={BLUR_DATA_URL}
/>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{fmtVND(quickView.price)}</span>
                  {quickView.oldPrice && quickView.oldPrice > quickView.price && (
                    <>
                      <span className="text-gray-500 line-through">{fmtVND(quickView.oldPrice)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        -{getDiscountPercent(quickView)}%
                      </span>
                    </>
                  )}
                </div>
                {quickView.condition && (
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Tình trạng: {labelCondition(quickView.condition)}</span>
                  </div>
                )}
                <p className="mt-4 text-gray-700 text-sm leading-6 line-clamp-5">
                  {quickView.description || "—"}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={`/product/${quickView.id}`}
                    className="px-4 py-2.5 rounded-xl bg-black text-white hover:opacity-90"
                  >
                    Xem chi tiết
                  </Link>
                  <button className="px-4 py-2.5 rounded-xl border hover:bg-gray-50">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** ====== Components ====== */

function ProductCardItem({
  p,
  index,
  onQuickView,
}: {
  p: ProductCard;
  index: number;
  onQuickView: () => void;
}) {
  const discount = getDiscountPercent(p);
  const imgUrl = getProductImgUrl(p, index);
  const nwt = isNewWithTags(p.condition);

  // state cho tim
  const [isFavorite, setIsFavorite] = React.useState(false);
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // tránh click link
    setIsFavorite((prev) => !prev);
  };

  return (
    <div className="group relative rounded-2xl border hover:shadow-sm transition overflow-hidden">
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

        {/* Badge NEW WITH TAGS */}
        {nwt && (
          <span className="absolute left-2 top-2 rounded-md bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-1 leading-none shadow-sm">
            NEW<br/>WITH<br/>TAGS
          </span>
        )}

        {/* Tim yêu thích */}
        <button
          type="button"
          aria-label={isFavorite ? "Unfavorite" : "Favorite"}
          onClick={toggleFavorite}
          className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 h-8 w-8"
        >
          <Image
            src={
              isFavorite
                ? "/assets/icons/heart-solid.svg"
                : "/assets/icons/heart-outline.svg"
            }
            alt="Favorite"
            width={18}
            height={18}
            loading="lazy"
          />
        </button>

        {/* Badge % giảm giá */}
        {discount && (
          <span className="absolute left-2 top-2 text-xs px-2 py-1 rounded-full bg-rose-600 text-white">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="p-3">
        {/* Brand + type */}
        <Link
          href={`/product/${p.id}`}
          className="block text-sm"
          title={p.title}
        >
          <span className="font-semibold">
            {p.brandName || p.title.split(" ")[0]}
          </span>
          {p.productTypeName && (
            <span className="text-gray-600"> {p.productTypeName}</span>
          )}
        </Link>

        {/* Size */}
        {p.sizeLabel && (
          <div className="mt-0.5 text-xs text-gray-600">Size {p.sizeLabel}</div>
        )}

        {/* Giá */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] font-bold">{fmtVND(p.price)}</span>
          {p.oldPrice && p.oldPrice > p.price && (
            <span className="text-xs text-gray-500 line-through">
              {fmtVND(p.oldPrice)}
            </span>
          )}
        </div>

        {/* Promo line */}
        <div className="mt-1 text-[11px] text-rose-700">{PROMO_TEXT}</div>

        {/* Nút hành động */}
        <div className="mt-3 flex items-center gap-2">
          <button
            aria-label="Xem nhanh"
            onClick={onQuickView}
            className="px-2 py-1.5 rounded-lg border hover:bg-gray-50"
            title="Xem nhanh"
          >
            👁
          </button>
          <button
            aria-label="Thêm vào giỏ"
            className="ml-auto px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            title="Thêm vào giỏ"
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductListItem({
  p,
  index,
  onQuickView,
}: {
  p: ProductCard;
  index: number;
  onQuickView: () => void;
}) {
  const discount = getDiscountPercent(p);
  const imgUrl = getProductImgUrl(p, index);

  const [isFavorite, setIsFavorite] = React.useState(false);
  const toggleFavorite = () => setIsFavorite((prev) => !prev);

  return (
    <div className="rounded-2xl border p-3 hover:shadow-sm transition">
      <div className="grid grid-cols-[120px_1fr_auto] md:grid-cols-[180px_1fr_auto] gap-3 md:gap-6 items-center">
        <Link
          href={`/product/${p.id}`}
          className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 block"
        >
          <SmartImage
            kind="product"
            alt={p.title}
            preset="plp"
            src={imgUrl}
            className="relative w-full h-full"
            imgClassName="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          {discount && (
            <span className="absolute left-2 top-2 text-[11px] px-2 py-1 rounded-full bg-rose-600 text-white">
              -{discount}%
            </span>
          )}
        </Link>

        <div className="min-w-0">
          <Link
            href={`/product/${p.id}`}
            className="text-base md:text-lg font-semibold hover:underline line-clamp-2"
          >
            {p.title}
          </Link>
          {p.condition && (
            <div className="mt-1 text-sm text-gray-600">
              Tình trạng: {labelCondition(p.condition)}
            </div>
          )}
          {p.description && (
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{p.description}</p>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-lg md:text-xl font-bold">{fmtVND(p.price)}</span>
            {p.oldPrice && p.oldPrice > p.price && (
              <span className="text-sm text-gray-500 line-through">{fmtVND(p.oldPrice)}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 justify-end">
            <button
              type="button"
              aria-label={isFavorite ? "Unfavorite" : "Favorite"}
              onClick={toggleFavorite}
              className="flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 h-9 w-9"
            >
              <Image
                src={
                  isFavorite
                    ? "/assets/icons/heart-fill.svg"
                    : "/assets/icons/heart-outline.svg"
                }
                alt="Favorite"
                width={18}
                height={18}
                loading="lazy"
              />
            </button>
            <button
              aria-label="Xem nhanh"
              onClick={onQuickView}
              className="px-2 py-1.5 rounded-lg border hover:bg-gray-50"
              title="Xem nhanh"
            >
              👁
            </button>
            <button
              aria-label="Thêm vào giỏ"
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              title="Thêm vào giỏ"
            >
              🛒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: ITEMS_PER_LOAD }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border overflow-hidden animate-pulse"
        >
          <div className="w-full aspect-[4/5] bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function labelCondition(key: string) {
  const found = ALL_CONDITIONS.find((c) => c.key === key);
  if (found) return found.label;
  // fallback
  if (key === "nwot" || key === "nwt") return "Mới (còn tag)";
  if (key === "like_new") return "Như mới";
  return key;
}

/** Nhóm checkbox có thể thu gọn */
function Disclosure({
  title,
  values,
  selected,
  onToggle,
}: {
  title: string;
  values: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6">
      <button
        className="w-full flex items-center justify-between font-medium mb-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-gray-500">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-2">
          {values.map((v) => (
            <label key={v} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="size-4"
                checked={selected.includes(v)}
                onChange={() => onToggle(v)}
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
