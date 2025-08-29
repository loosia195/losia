// src/components/product/ProductDetailSection/EcoImpactSection.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  /** Tên nhóm sản phẩm để tra default (vd: "dress", "top", ...) */
  productType?: string;
  /** Nếu có số liệu cụ thể từ sản phẩm thì truyền vào, sẽ ưu tiên hơn default */
  glassesOfWater?: number;
  hoursOfLighting?: number;
  kmsOfDriving?: number;
};

type EcoImpactDefault = {
  id: string;
  productGroup: string;
  glassesOfWater?: number | null;
  hoursOfLighting?: number | null;
  kmsOfDriving?: number | null;
};

export default function EcoImpactSection({
  productType = "dress",
  glassesOfWater,
  hoursOfLighting,
  kmsOfDriving,
}: Props) {
  // state hiển thị (đã hợp nhất props + default)
  const [defaults, setDefaults] = useState<EcoImpactDefault | null>(null);
  const [loading, setLoading] = useState(false);

  // lấy default từ API (nhẹ, không chặn UI)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/product-impacts", { cache: "force-cache" });
        if (!res.ok) throw new Error("fetch eco impacts failed");
        const data = await res.json();
        const list: EcoImpactDefault[] = Array.isArray(data?.ecoImpacts) ? data.ecoImpacts : [];
        const match =
          list.find(
            (i) => i.productGroup?.toLowerCase() === String(productType).toLowerCase()
          ) || null;
        if (alive) setDefaults(match);
      } catch {
        // silent fallback
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [productType]);

  // hợp nhất số liệu: ưu tiên props > defaults > 0
  const numbers = useMemo(() => {
    const g =
      typeof glassesOfWater === "number"
        ? glassesOfWater
        : (defaults?.glassesOfWater ?? 0);
    const h =
      typeof hoursOfLighting === "number"
        ? hoursOfLighting
        : (defaults?.hoursOfLighting ?? 0);
    const km =
      typeof kmsOfDriving === "number"
        ? kmsOfDriving
        : (defaults?.kmsOfDriving ?? 0);
    return { glasses: g, hours: h, kms: km };
  }, [glassesOfWater, hoursOfLighting, kmsOfDriving, defaults]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);

  // hiển thị skeleton nhẹ khi đang lấy default lần đầu
  const isLoadingFirst = loading && !defaults && glassesOfWater == null && hoursOfLighting == null && kmsOfDriving == null;

  return (
    <section className="border-t border-gray-100 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Tác động môi trường</h2>
        {/* nhãn nhỏ gợi ý nguồn (không mở modal) */}
        <span className="text-xs text-gray-500">
          Nguồn: Ước tính nội bộ LOSIA
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Khi bạn mua <span className="font-medium">{productType}</span> secondhand và mặc khoảng
        <span className="font-medium"> 10 lần</span>, bạn đã tiết kiệm tương đương:
      </p>

      {isLoadingFirst ? (
        // Skeleton
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="h-6 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Nước */}
          <StatCard
            iconSrc="/assets/icons/droplet.svg"
            labelTop={`${fmt(numbers.glasses)}`}
            labelUnit="ly nước uống"
            hint="Tiết kiệm nước"
          />
          {/* Điện */}
          <StatCard
            iconSrc="/assets/icons/lightbulb.svg"
            labelTop={`${fmt(numbers.hours)}`}
            labelUnit="giờ đèn LED"
            hint="Giảm tiêu thụ điện"
          />
          {/* CO₂/Di chuyển */}
          <StatCard
            iconSrc="/assets/icons/cloud.svg"
            labelTop={`${fmt(numbers.kms)}`}
            labelUnit="km khí thải lái xe"
            hint="Giảm phát thải"
          />
        </div>
      )}

      {/* chú thích nhỏ */}
      <p className="mt-3 text-xs text-gray-500">
        Số liệu là ước tính quy đổi tương đương, có thể thay đổi theo loại chất liệu và vòng đời sử dụng.
      </p>
    </section>
  );
}

/** Sub‑component thẻ số liệu */
function StatCard({
  iconSrc,
  labelTop,
  labelUnit,
  hint,
}: {
  iconSrc: string;
  labelTop: string;
  labelUnit: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <img src={iconSrc} alt="" width={18} height={18} className="opacity-80" />
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      <div className="text-2xl font-semibold leading-tight">{labelTop}</div>
      <div className="text-sm text-gray-600">{labelUnit}</div>
    </div>
  );
}
