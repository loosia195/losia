// src/app/(public)/components/cart/CartRow.tsx
'use client';


import RemoveFromCartButton from '@/components/cart/RemoveFromCartButton';
import { formatVND } from '@/lib/format'; // nếu chưa có, tạm dùng utils local ở page.tsx

type DetailedItem = {
  productId: string;
  qty: number;
  product: {
    id: string;
    title: string;
    price: number;
    oldPrice: number | null;
    brand?: string;
    category?: string;
    cover: string | null;
    inStock: boolean;
  };
};

export default function CartRow({ row }: { row: DetailedItem }) {
  const { product, qty } = row;
  const saving =
    typeof product.oldPrice === 'number' && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  return (
    <li className="p-4 flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.cover || '/assets/images/main/product1.jpg'}
        alt={product.title}
        className="h-24 w-20 rounded-lg object-cover bg-gray-100"
        loading="eager"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium leading-snug line-clamp-2">
              {product.title}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {(product.brand || '—') + ' · ' + (product.category || 'Hàng nữ')}
              {' · '}
              {product.inStock ? (
                <span className="text-emerald-700">Còn hàng</span>
              ) : (
                <span className="text-rose-600">Hết hàng</span>
              )}
              {' · Qty: '}
              {qty}
            </div>
          </div>

          <div className="text-right shrink-0">
            {typeof product.oldPrice === 'number' && product.oldPrice > product.price ? (
              <div className="text-xs text-gray-400 line-through tabular-nums">
                {formatVND(product.oldPrice)}
              </div>
            ) : null}
            <div className="text-sm font-semibold tabular-nums">
              {formatVND(product.price * qty)}
            </div>
            {saving > 0 && (
              <div className="mt-0.5 text-[11px] text-emerald-700">
                Tiết kiệm {formatVND(saving)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs">
          <RemoveFromCartButton productId={product.id} />
          <span className="text-gray-300">•</span>
          <button
            type="button"
            className="underline text-gray-600 hover:text-black"
            aria-label={`Lưu ${product.title} để xem sau`}
            onClick={() => alert('Tính năng “Lưu để xem sau” sẽ thêm sau')}
          >
            Lưu để xem sau
          </button>
        </div>
      </div>
    </li>
  );
}
