'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  productId: string;
  disabled?: boolean;
  /** Callback sau khi thêm vào giỏ THÀNH CÔNG (ví dụ: track GA4) */
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
        body: JSON.stringify({ productId: String(productId), qty: 1 }), // API hỗ trợ qty|quantity
        credentials: 'same-origin',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        console.error('Add to cart failed', data);
        return;
      }

      setAdded(true);
      onAdded?.();

      // Chờ Set-Cookie commit xong
      await new Promise((r) => setTimeout(r, 30));

      // Cập nhật badge
      window.dispatchEvent(new CustomEvent('losia:cart-changed'));

      // Đặt cờ mở MiniCart (phòng khi sự kiện bị bỏ lỡ do remount)
      try { localStorage.setItem('losia:open-minicart', '1'); } catch {}

      // MỞ MINICART NGAY
      window.dispatchEvent(new CustomEvent('losia:minicart:open'));

      // ❌ Không cần router.refresh: Drawer & Badge đều tự fetch /api/cart
      // Nếu thực sự cần refresh chỗ khác, dùng:
      // setTimeout(() => router.refresh(), 200);
    } catch (e) {
      console.error('Add to cart error', e);
    } finally {
      setAdding(false);
    }
  };

  if (added) {
    const ts = Date.now(); // cache-bust tránh prefetch cũ
    return (
      <div className="flex gap-2">
        <Link
          href={`/cart?ts=${ts}`}
          prefetch={false}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white"
        >
          Xem giỏ hàng
        </Link>
        <Link
          href={`/checkout?ts=${ts}`}
          prefetch={false}
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
