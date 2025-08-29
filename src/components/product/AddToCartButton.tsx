// src/components/product/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  productId: string;
  disabled?: boolean;
  /** Callback chạy sau khi thêm vào giỏ THÀNH CÔNG (ví dụ: track GA4) */
  onAdded?: () => void;
};

export default function AddToCartButton({ productId, disabled, onAdded }: Props) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (disabled) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-gray-200 text-gray-500 cursor-not-allowed"
        aria-disabled="true"
        title="Sản phẩm đã bán"
      >
        Đã bán
      </button>
    );
  }

  const onAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Giữ payload theo API hiện dùng của anh (qty); API đã hỗ trợ quantity/qty
        body: JSON.stringify({ productId: String(productId), qty: 1 }),
        credentials: 'same-origin', // ✅ đảm bảo cookie được nhận & gửi đúng
      });

      if (res.ok) {
        setAdded(true);
        onAdded?.();
        // ✅ làm tươi cache client để các vùng khác (mini-cart...) phản ánh ngay
        window.dispatchEvent(new CustomEvent('losia:cart-changed'));
        router.refresh();
      } else {
        console.error('Add to cart failed', await res.text());
      }
    } catch (e) {
      console.error('Add to cart error', e);
    } finally {
      setAdding(false);
    }
  };

  if (added) {
    // cache-bust để chắc chắn không dùng payload đã prefetch trước đó
    const ts = Date.now();
    return (
      <div className="flex gap-2">
        <Link
          href={`/cart?ts=${ts}`}
          prefetch={false}               // ✅ tắt prefetch
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white"
        >
          Xem giỏ hàng
        </Link>
        <Link
          href={`/checkout?ts=${ts}`}
          prefetch={false}               // ✅ tắt prefetch
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-emerald-600 text-white"
        >
          Thanh toán
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={onAdd}
      disabled={adding}
      className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white disabled:opacity-60"
    >
      {adding ? 'Đang thêm…' : 'Thêm vào giỏ'}
    </button>
  );
}
