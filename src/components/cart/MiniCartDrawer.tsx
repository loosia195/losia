// src/components/common/MiniCartDrawer.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/lib/format';
import { useCart } from '@/app/providers/CartProvider';

export default function MiniCartDrawer({
  className = '',
  hideTrigger = false,
}: {
  className?: string;
  hideTrigger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const mounted = useRef(false);
  const router = useRouter();

  // 🔗 lấy trực tiếp từ CartProvider (một nguồn sự thật)
  const { items, count, subtotal, refresh } = useCart();

  // Mount + listeners
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      // mở nếu có cờ từ AddToCartTracked (chống miss event)
      try {
        if (localStorage.getItem('losia:open-minicart') === '1') {
          localStorage.removeItem('losia:open-minicart');
          setOpen(true);
        }
      } catch {}
    }

    // nghe sự kiện mở drawer
    const onOpen = () => setOpen(true);
    window.addEventListener('losia:minicart:open', onOpen);

    // khi tab quay lại foreground thì refresh cart
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('losia:minicart:open', onOpen);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // Mỗi lần mở, đảm bảo data mới nhất
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const hasItems = (count ?? 0) > 0;
  const iconSrc = hasItems ? '/assets/icons/cart_hover.svg' : '/assets/icons/cart.svg';
  const badgeTone = hasItems ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-600';
  const displayCount = (count ?? 0) > 99 ? '99+' : String(count ?? 0);
  const sizeCls = (count ?? 0) >= 10 ? 'w-6 h-6 text-[10px]' : 'w-5 h-5 text-[11px]';

  const goCart = useCallback(() => {
    setOpen(false);
    router.push(`/cart?ts=${Date.now()}`);
  }, [router]);

  const goCheckout = useCallback(() => {
    setOpen(false);
    router.push(`/checkout?ts=${Date.now()}`);
  }, [router]);

  const remove = useCallback(
    async (productId: string) => {
      if (removing) return;
      setRemoving(productId);
      try {
        await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          credentials: 'include',
          cache: 'no-store',
        });
        // cập nhật toàn app qua CartProvider
        await refresh();
        // thông báo cho header/icon animate nếu cần
        window.dispatchEvent(new CustomEvent('losia:cart-changed'));
      } catch {
        // noop
      } finally {
        setRemoving(null);
      }
    },
    [refresh, removing]
  );

  return (
    <>
      {/* Trigger (ẩn nếu hideTrigger = true) */}
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Giỏ hàng, ${count ?? 0} sản phẩm`}
          className={`relative inline-flex items-center ${className}`}
        >
          <Image src={iconSrc} alt="" width={20} height={20} sizes="20px" aria-hidden />
          <span
            aria-live="polite"
            aria-atomic="true"
            className={`absolute -right-2 -top-2 rounded-full ${sizeCls} ${badgeTone}
                        inline-flex items-center justify-center font-semibold leading-none select-none
                        ring-2 ring-white transition-colors`}
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {displayCount}
          </span>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        } transition-transform`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Giỏ hàng</div>
          <button onClick={() => setOpen(false)} className="rounded-md border px-2 py-1 text-xs">
            Đóng
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {items.length ? (
            <ul className="divide-y">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="p-4 flex gap-3">
                  <Image
                    src={product.cover || '/assets/images/main/product1.jpg'}
                    alt={product.title}
                    width={64}
                    height={80}
                    className="h-20 w-16 rounded object-cover bg-gray-100"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                    <div className="text-xs text-gray-500">
                      {product.inStock ? 'Còn hàng' : 'Hết hàng'} · Qty: {qty}
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {formatVND(product.price * qty)}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    disabled={removing === product.id}
                    className="self-start rounded-md border px-2 py-1 text-xs disabled:opacity-60"
                  >
                    {removing === product.id ? 'Đang xoá…' : 'Xoá'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-600">
              Giỏ hàng trống.<br />
              <Link href="/" className="text-s text-emerald-700 font-semibold text-black underline underline-offset-2">
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Tạm tính</span>
            <span className="font-semibold">{formatVND(subtotal)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={goCart} className="flex-1 rounded-lg border px-4 py-2 text-sm">
              Xem giỏ hàng
            </button>
            <button
              onClick={goCheckout}
              className="flex-1 rounded-lg bg-black text-white px-4 py-2 text-sm"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
