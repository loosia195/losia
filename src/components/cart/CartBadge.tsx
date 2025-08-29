'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function CartBadge({ className = '' }: { className?: string }) {
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const isThankYou = pathname === '/thank-you';

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json();
      setCount(Number(data?.count || 0));
    } catch {}
  }, []);

  useEffect(() => {
    // ✅ Ở trang thank-you: đóng băng — không refresh để tránh nhảy về 0
    if (isThankYou) return;

    refresh();
    const onChange = () => setTimeout(refresh, 50);
    window.addEventListener('losia:cart-changed', onChange);

    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('losia:cart-changed', onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, isThankYou]);

  // ✅ Khi ở Thank You: ép “trông như có đơn/đã mua” để UX vui hơn
  const hasItems = isThankYou ? true : count > 0;
  const iconSrc = hasItems ? '/assets/icons/cart_hover.svg' : '/assets/icons/cart.svg';
  const label = isThankYou ? 'Đã đặt hàng' : `Giỏ hàng, ${count} sản phẩm`;

  // Badge hiển thị: ở Thank You cho “✓” (hoặc vẫn là số nếu thích)
  const displayRaw = isThankYou ? '✓' : (count > 99 ? '99+' : String(count));
  const display = displayRaw;
  const badgeTone = hasItems ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-600';
  const sizeCls = !isThankYou && count >= 10 ? 'w-6 h-6 text-[10px]' : 'w-5 h-5 text-[11px]';

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault(); // mở mini cart, không điều hướng /cart
    window.dispatchEvent(new CustomEvent('losia:minicart:open'));
  };

  return (
    <Link
      href="/cart"
      prefetch={false}
      onClick={onClick}
      aria-label={label}
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
        {display}
      </span>
    </Link>
  );
}
