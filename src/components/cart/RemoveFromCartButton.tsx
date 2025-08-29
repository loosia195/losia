// src/components/cart/RemoveFromCartButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RemoveFromCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const remove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' });
      if (res.ok) {
        // 🔔 thông báo cho badge/mini-cart cập nhật
        window.dispatchEvent(new CustomEvent('losia:cart-changed'));
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="ml-3 rounded-md border px-3 py-1 text-xs disabled:opacity-50"
      aria-disabled={loading}
    >
      {loading ? 'Đang xoá…' : 'Xoá'}
    </button>
  );
}
