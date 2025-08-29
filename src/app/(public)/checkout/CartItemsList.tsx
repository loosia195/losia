// src/app/(public)/checkout/CartItemsList.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/app/providers/CartProvider';

type Product = {
  id: string;
  brand: string;
  size: string;
  productType: string;
  oldPrice: number | null;   // có thể null
  retailPrice: number;       // fallback
  newPrice: number;          // có thể 0 hoặc undefined ở vài item
  discountPercent: number | null;
  discountCode: string | null;
  image: string;
  backImage: string;
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// Ưu tiên hiển thị: oldPrice (giá bán hiện tại) → newPrice → retailPrice
function getUnitPrice(p: Product) {
  const candidates = [
    p.oldPrice ?? undefined,
    typeof p.newPrice === 'number' ? p.newPrice : undefined,
    typeof p.retailPrice === 'number' ? p.retailPrice : undefined,
  ];
  const picked = candidates.find((v) => typeof v === 'number' && !Number.isNaN(v));
  return picked ?? 0;
}

export default function CartItemsList() {
  const { cartItems, removeItem } = useCart();

  if (!cartItems?.length) {
    return (
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <div className="text-sm text-gray-600">Giỏ hàng trống.</div>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
      <h2 className="mb-4 text-lg font-semibold md:text-xl">Sản phẩm trong giỏ</h2>

      <ul className="space-y-3">
        {cartItems.map((it: any) => {
          const p: Product = it.product;
          const qty: number = it.quantity > 0 ? it.quantity : 1;

          const unit = getUnitPrice(p);              // đơn giá an toàn
          const line = typeof p.retailPrice === 'number' ? p.retailPrice : undefined; // giá gạch (nếu muốn)
          const subtotal = unit * qty;

          const hasDiscount = typeof p.discountPercent === 'number' && p.discountPercent > 0;
          const discountBadge = hasDiscount ? `-${p.discountPercent}%` : p.discountCode ?? null;

          return (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  {/* Nếu dùng next/image */}
                  <Image
                    src={p.image || '/placeholder.png'}
                    alt={p.brand || 'Item'}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">{p.brand} • {p.productType}</div>
                  <div className="text-xs text-gray-600">Size: {p.size}</div>
                  <div className="text-xs text-gray-600">SL: {qty}</div>
                  {discountBadge && (
                    <span className="mt-1 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                      {discountBadge}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  {/* Giá hiển thị: nếu có retailPrice cao hơn unit → gạch */}
                  {line && line > unit ? (
                    <div className="text-xs text-gray-500 line-through">{formatVND(line)}</div>
                  ) : null}
                  <div className="text-sm font-semibold">{formatVND(unit)}</div>
                  <div className="text-xs text-gray-600">Tạm tính: {formatVND(subtotal)}</div>
                </div>

                <button
                  className="text-sm font-medium text-rose-600 hover:text-rose-700"
                  onClick={() => removeItem?.(it.id)}
                >
                  Xoá
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
