// src/components/product/ProductDetailSection/QuickInfoSection.tsx
"use client";
import React from "react";
import { formatVND } from "@/lib/format";

type Props = {
  productId: string;
  title: string;
  brand?: string | null;
  sizeLabel?: string | null;     // ← giữ nguyên prop đầu vào
  isOnlyOneAvailable?: boolean;
  retailPrice?: number | null;   // Estimated retail (nếu có)
  oldPrice?: number | null;      // Giá gốc (gạch)
  price: number;                 // Giá bán hiện tại
  discountPercent?: number | null;
  discountCode?: string | null;
  isPopular?: boolean;
  cta?: React.ReactNode;         // Nút AddToCartTracked truyền từ ngoài
};

export default function QuickInfoSection({
  title,
  brand,
  sizeLabel,
  isOnlyOneAvailable,
  retailPrice,
  oldPrice,
  price,
  discountPercent,
  discountCode,
  isPopular,
  cta,
}: Props) {
  const hasDiscount = (discountPercent ?? 0) > 0;

  // Chuẩn hoá brand & sizeLabel
  const brandText = (brand ?? "").trim() || "LOSIA";
  const sizeText = normalizeSize(sizeLabel);

  return (
    <section>
      {/* Tiêu đề */}
      <h1 className="text-xl font-semibold underline">{brandText}</h1>

      {/* Brand • Size */}
      <div className="mt-1 text-m text-gray-600">
        
        {sizeText ? (
          <>
            {" "}
            {" "}
            <span
              aria-label="product-size"
              data-testid="product-size"
              title={`Size ${sizeText}`}
              itemProp="size"
            >
              Size {sizeText}
            </span>
          </>
        ) : null}
        <span> {title}</span>
      </div>

      {/* Giá + badge giảm giá/mã giảm */}
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="text-xl font-semibold">{formatVND(price)}</span>

        {oldPrice ? (
          <span className="text-xl text-red-400 line-through">
            {formatVND(oldPrice)}
          </span>
        ) : null}

        {discountCode ? (
          <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
            {hasDiscount ? `Giảm ${discountPercent}%` : `Khuyến mãi`} với mã {discountCode}
          </span>
        ) : hasDiscount ? (
          <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
            Giảm {discountPercent}%
          </span>
        ) : null}
      </div>

      {/* Estimated retail / cầu nối block cũ */}
      {/* (tuỳ anh muốn hiện retailPrice thì thêm block ở đây) */}

      {/* Thông điệp số lượng & phổ biến */}
      {isOnlyOneAvailable ? (
        <div className="mt-2 text-xs text-gray-600">• Chỉ còn 1 sản phẩm</div>
      ) : null}

      {isPopular ? (
        <div className="mt-1 text-xs text-rose-600">
          Sản phẩm đang được quan tâm! Khả năng sẽ bán nhanh.
        </div>
      ) : null}

      {/* CTA (Add to cart / View cart...) */}
      <div className="mt-4">{cta}</div>
    </section>
  );
}

/** Chuẩn hoá sizeLabel: nhận string|number|null → string|undefined */
function normalizeSize(v: string | number | null | undefined): string | undefined {
  if (v == null) return undefined;
  // Cho phép backend trả number: 4, 6, 8 ...
  const s = (typeof v === "number" ? String(v) : v).trim();
  return s ? s : undefined;
}
