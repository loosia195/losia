"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ProductMini = {
  id: string;
  image: string;
  title: string;
  size?: string | null;
  price?: number | null;
  retailPrice?: number | null;
};

type BrandGroup = {
  brand: string;
  products: ProductMini[];
};

type Props = {
  currentBrand?: string | null;
  limitBrands?: number;     // mặc định 3
  limitPerBrand?: number;   // mặc định 3
};

const fmtVND = (n?: number | null) =>
  n == null ? "" : `${Number(n).toLocaleString("vi-VN")} ₫`;

/** Kích thước ảnh đồng bộ với MoreFromSeller (3:4 + viền mảnh) */
const IMG_WIDTH_CLASSES = "w-[120px] sm:w-[140px] md:w-[180px]";

export default function PeopleAlsoShop({
  currentBrand,
  limitBrands = 3,
  limitPerBrand = 3,
}: Props) {
  const [groups, setGroups] = useState<BrandGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (currentBrand) qs.set("currentBrand", currentBrand);
        qs.set("limitBrands", String(limitBrands));
        qs.set("limitPerBrand", String(limitPerBrand));

        // Gọi endpoint “also-shop” (ưu tiên /api/also-shop, fallback /api/products/also-shop)
        let res = await fetch(`/api/also-shop?${qs.toString()}`, { cache: "no-store" });
        if (res.status === 404) {
          res = await fetch(`/api/products/also-shop?${qs.toString()}`, { cache: "no-store" });
        }
        if (!res.ok) throw new Error("Failed to fetch recommended products");
        const data: BrandGroup[] = await res.json();
        if (!mounted) return;
        setGroups(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentBrand, limitBrands, limitPerBrand]);

  if (loading) {
    return (
      <section className="mt-12">
        <h3 className="text-lg font-semibold mb-4">
          Mọi Người Mua {currentBrand || "this brand"} cũng Mua
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 md:gap-6">
          {Array.from({ length: limitBrands }).map((_, i) => (
            <SkeletonBrandBlock key={i} count={limitPerBrand} />
          ))}
        </div>
      </section>
    );
  }
  if (error || groups.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
  <h2 className="text-xl font-semibold tracking-tight">
    Mọi Người Mua {currentBrand || "this brand"} Cũng Mua
  </h2>
</div>

      {/* Mobile: scroll ngang; Desktop: 3 cột đều nhau */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
        {groups.map((group) => (
          <div key={group.brand} className="min-w-[520px] md:min-w-0">
            {/* 3 ảnh: kích thước đồng bộ MoreFromSeller */}
            <div className="flex justify-between gap-3 md:gap-4 mb-4">
              {group.products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="block" aria-label={p.title}>
                  <div
                    className={`relative rounded-[4px]  ring-gray-300 bg-white overflow-hidden ${IMG_WIDTH_CLASSES}`}
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    <Image
                      src={p.image || "/assets/images/main/product1.jpg"}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 150px, 200px"
                      className="object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Nút brand kéo dài kiểu ThredUp */}
            <Link
              href={`/c/${slugify(group.brand)}?brand_name_tags=${encodeURIComponent(group.brand)}`}
              className="
                block mx-auto
                h-10 w-full
                rounded-md border border-black
                bg-white text-black
                text-[12px] font-semibold uppercase tracking-[0.15em]
                text-center leading-10
                hover:bg-gray-50 transition
              "
            >
              {group.brand}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/* ---------- Skeleton: đồng bộ kích thước ---------- */
function SkeletonBrandBlock({ count = 3 }: { count?: number }) {
  return (
    <div className="min-w-[520px] md:min-w-0">
      <div className="flex justify-between gap-3 md:gap-4 mb-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`rounded-[4px] ring-1 ring-gray-300 bg-white animate-pulse ${IMG_WIDTH_CLASSES}`}
            style={{ aspectRatio: "3 / 4" }}
          >
            <div className="w-full h-full bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="h-10 w-full rounded-md border border-black bg-gray-100" />
    </div>
  );
}
