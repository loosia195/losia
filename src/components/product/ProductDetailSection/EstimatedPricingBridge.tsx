"use client";

import React from "react";
import EstimatedPricing from "./EstimatedPricing"; // component cũ: (oldPrice, price)

type Props = {
  /** Giá retail ước tính (nếu có) */
  retailPrice?: number | null;
  /** Giá bán hiện tại */
  price: number;
};

/**
 * Bridge: map retailPrice -> oldPrice để tái dùng EstimatedPricing cũ.
 * Chỉ render khi có retailPrice hợp lệ.
 */
export default function EstimatedPricingBridge({ retailPrice, price }: Props) {
  if (!retailPrice || !Number.isFinite(retailPrice)) return null;

  return <EstimatedPricing oldPrice={retailPrice} price={price} />;
}
