// src/components/product/ProductDetailSection/ProductDetailSection.tsx
"use client";

import React from "react";
import type { ProductDetail } from "./types";
import QuickInfoSection from "./QuickInfoSection";
import ConditionSection from "./ConditionSection";
import ItemDetailsSection from "./ItemDetailsSection";
import SizeFitSection from "./SizeFitSection";
import ShippingReturnsSection from "./ShippingReturnsSection";
import EcoImpactSection from "./EcoImpactSection";
import SellWithUsSection from "./SellWithUsSection";
import AddToCartTracked from "@/components/product/AddToCartTracked";



// Helper: chuẩn hoá string | string[] | null/undefined
const norm = (v: unknown): string => {
  if (!v) return "";
  if (Array.isArray(v)) return v.map(x => (x ?? "") + "").filter(Boolean).join(", ");
  return String(v ?? "").trim();
};

export default function ProductDetailSection({ product }: { product: ProductDetail }) {
  const outOfStock = (product.inventory ?? 0) <= 0;
  const brand = (product.brand || "LOSIA").trim();

  // Category luôn là string an toàn
  const categoryName =
    product.productType?.name ||
    product.productType?.parent?.name ||
    product.productKindForEco ||
    "Others";

  // Chuẩn hoá thuộc tính cho ItemDetailsSection
  const itemNumber =
    product.sku ?? product.itemNumber ?? product.code ?? null;

  const material =
    norm(product.material) ||
    norm(product.materialDetail) ||
    norm(product.materials);

  const color =
    norm(product.color) ||
    norm(product.colorDetail) ||
    norm(product.colors);

  const style =
    norm(product.style) ||
    norm(product.styleDetail) ||
    norm(product.styles);

  const description = norm(product.description) || ""; // cho phép rỗng

  return (
    <div className="space-y-6">
      {/* Thông tin nhanh + CTA */}
      <QuickInfoSection
        productId={product.id}
        title={product.title}
        brand={brand}
        // ✅ FIX: dùng sizeLabel, fallback sang size
        sizeLabel={product.sizeLabel ?? product.size ?? undefined}
        isOnlyOneAvailable={product.isOnlyOneAvailable}
        retailPrice={product.retailPrice ?? undefined}
        oldPrice={product.oldPrice ?? undefined}
        price={product.price}
        discountPercent={product.discountPercent ?? undefined}
        discountCode={product.discountCode ?? undefined}
        isPopular={product.isPopular}
        cta={
          <AddToCartTracked
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              brand,
              category: categoryName,
            }}
            disabled={outOfStock}
          />
        }
      />

      {/* Tình trạng */}
      {product.condition ? (
        <ConditionSection
          condition={product.condition}
          conditionDescription={product.conditionDescription || undefined}
        />
      ) : null}

      {/* Thông tin sản phẩm */}
      <ItemDetailsSection description={description} />

      {/* Kích cỡ & phom dáng */}
      <SizeFitSection
        sizeDisplay={product.sizeDisplay || product.sizeLabel || product.size || ""}
        measuredLength={product.measuredLength || undefined}
      />

      {/* Bán cùng LOSIA */}
      <SellWithUsSection brandName={brand} />

      {/* Vận chuyển & đổi trả */}
      <ShippingReturnsSection />

      {/* Tác động môi trường */}
      <EcoImpactSection
        productType={
          product.productType?.parent?.name ||
          product.productType?.name ||
          product.productKindForEco ||
          "dress"
        }
        glassesOfWater={product.glassesOfWater ?? undefined}
        hoursOfLighting={product.hoursOfLighting ?? undefined}
        kmsOfDriving={product.kmsOfDriving ?? undefined}
      />

      {/* Cam kết an toàn */}
      
    </div>
  );
}
