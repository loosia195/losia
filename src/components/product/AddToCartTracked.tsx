// src/components/product/AddToCartTracked.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useCart } from "@/app/providers/CartProvider"; // đường dẫn theo file anh gửi

type CartProduct = {
  id: string;
  title: string;
  price: number;
  brand?: string;
  category?: string;
};

export default function AddToCartTracked({
  product,
  disabled,
}: {
  product: CartProduct;
  disabled?: boolean;
}) {
  const { items, refresh } = useCart();
  const [adding, setAdding] = useState(false);

  const inCart = useMemo(() => {
    if (!Array.isArray(items)) return false;
    const pid = String(product.id);
    return items.some(
      (it) => String(it.productId) === pid || String(it.product?.id) === pid
    );
  }, [items, product.id]);

  const handleAdd = useCallback(async () => {
    if (disabled || adding || inCart) return;
    setAdding(true);
    try {
      // 1) Gọi API thêm vào giỏ
      //    Ưu tiên endpoint /api/cart/items (body: { productId, qty })
      let ok = false;
      try {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, qty: 1 }),
        });
        ok = res.ok;
      } catch {
        ok = false;
      }

      // Fallback: một số backend dùng POST /api/cart
      if (!ok) {
        const res2 = await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, qty: 1 }),
        });
        ok = res2.ok;
      }

      if (!ok) {
        // Backend của anh có tên endpoint khác → log nhẹ
        console.warn("Add to cart failed: please verify cart API endpoint.");
        return;
      }

      // 2) Refresh context để UI cập nhật
      await refresh();
      try {
    // để MiniCart bắt kịp cả khi event bị miss lúc chưa mount
        localStorage.setItem('losia:open-minicart', '1');
        window.dispatchEvent(new CustomEvent("losia:cart-changed"));
        window.dispatchEvent(new CustomEvent('losia:minicart:open'));
      } catch {}

      // 3) (Tuỳ chọn) Analytics
      if (typeof window !== "undefined") {
        (window as any).dataLayer?.push({
          event: "add_to_cart",
          ecommerce: {
            items: [
              {
                item_id: product.id,
                item_name: product.title,
                item_brand: product.brand,
                item_category: product.category,
                price: product.price,
                quantity: 1,
              },
            ],
          },
        });
      }
    } finally {
      setAdding(false);
    }
  }, [adding, disabled, inCart, product, refresh]);

  /* ---------- RENDER THEO 3 TRẠNG THÁI ---------- */
  if (disabled) {
    return (
      <div
        className="w-full select-none rounded-lg border bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-500"
        aria-disabled="true"
        role="status"
      >
        ĐÃ BÁN
      </div>
    );
  }

  if (inCart) {
    return (
      <div
        className="w-full select-none rounded-lg border bg-gray-100 px-4 py-3 text-center text-xs font-semibold tracking-widest text-gray-700 uppercase"
        aria-disabled="true"
        role="status"
      >
        TRONG GIỎ HÀNG
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding}
      aria-busy={adding}
      className={[
        "w-full rounded-lg px-4 py-3 text-sm font-semibold text-white",
        "bg-black hover:bg-gray-900",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "transition-colors",
      ].join(" ")}
    >
      {adding ? "Đang thêm..." : "THÊM VÀO GIỎ"}
    </button>
  );
}
