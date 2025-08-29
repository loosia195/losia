'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { track } from '@/app/hooks/useTrack';
import { ReactNode, useEffect, useRef, useState } from 'react';

/* =========================
   1) Chính sách prefetch theo mạng
   - Save-Data bật hoặc 2G/slow-2g  -> TẮT prefetch
   - 3G                            -> CHỈ prefetch khi hover
   - 4G (mặc định)                 -> prefetch khi vào viewport + hover
   ========================= */

type PrefetchPolicy = {
  enabled: boolean;
  allowViewport: boolean;
  allowHover: boolean;
  label: 'off' | '3g' | '4g';
};

function readPrefetchPolicy(): PrefetchPolicy {
  // @ts-ignore - một số browser chưa có type
  const conn: any = typeof navigator !== 'undefined'
    ? (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    : null;

  const saveData = !!conn?.saveData;
  const et = String(conn?.effectiveType || '4g') as 'slow-2g' | '2g' | '3g' | '4g';

  if (saveData || et === 'slow-2g' || et === '2g') {
    return { enabled: false, allowViewport: false, allowHover: false, label: 'off' };
  }
  if (et === '3g') {
    return { enabled: true, allowViewport: false, allowHover: true, label: '3g' };
  }
  // 4g hoặc không xác định -> coi như 4g
  return { enabled: true, allowViewport: true, allowHover: true, label: '4g' };
}

function usePrefetchPolicy() {
  const [policy, setPolicy] = useState<PrefetchPolicy>(() => readPrefetchPolicy());

  useEffect(() => {
    // @ts-ignore
    const conn: any =
      (navigator as any)?.connection ||
      (navigator as any)?.mozConnection ||
      (navigator as any)?.webkitConnection;
    if (!conn?.addEventListener) return;

    const onChange = () => setPolicy(readPrefetchPolicy());
    conn.addEventListener('change', onChange);
    return () => conn.removeEventListener?.('change', onChange);
  }, []);

  return policy;
}

/* =========================
   2) Giới hạn tốc độ prefetch (global)
   - Throttle: tối đa 1 prefetch mỗi 200ms (toàn trang)
   - Cap số "in-flight" ~ 6 (gỡ sau ~1.5s)
   - Ưu tiên idle
   ========================= */

const MAX_IN_FLIGHT = 6;
let IN_FLIGHT = 0;
let LAST_AT = 0;

function schedulePrefetch(router: ReturnType<typeof useRouter>, href: string) {
  const now = Date.now();
  if (IN_FLIGHT >= MAX_IN_FLIGHT) return;
  if (now - LAST_AT < 200) return; // throttle global

  LAST_AT = now;
  IN_FLIGHT++;

  const run = () => {
    try {
      router.prefetch(href);
    } finally {
      // xả slot sau 1.5s (Next không trả promise completion cho prefetch)
      setTimeout(() => {
        IN_FLIGHT = Math.max(0, IN_FLIGHT - 1);
      }, 1500);
    }
  };

  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(run, { timeout: 1500 });
  } else {
    // fallback nhẹ
    setTimeout(run, 120);
  }
}

/* =========================
   3) Hook prefetch thông minh (viewport + hover)
   ========================= */

function useSmartPrefetch(href: string, policy: PrefetchPolicy) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [done, setDone] = useState(false);

  // Prefetch khi phần tử tiến vào viewport (nếu policy cho phép)
  useEffect(() => {
    if (!policy.enabled || !policy.allowViewport || done) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            schedulePrefetch(router, href);
            setDone(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: policy.label === '4g' ? '200px' : '0px' } // 4g: prefetch sớm hơn một chút
    );

    io.observe(el);
    return () => io.disconnect();
  }, [href, policy.enabled, policy.allowViewport, policy.label, done, router]);

  // Prefetch khi hover (nếu policy cho phép)
  const onMouseEnter = () => {
    if (!policy.enabled || !policy.allowHover || done) return;
    schedulePrefetch(router, href);
    setDone(true);
  };

  return { ref, onMouseEnter };
}

/* =========================
   4) Component ProductCardLink
   ========================= */

export default function ProductCardLink({
  href,
  product,
  children,
  className,
  listName = 'Home - Just In',
  index,
}: {
  href: string;
  product: { id: string; title: string; price: number; brand?: string; category?: string };
  children: ReactNode;
  className?: string;
  listName?: string;
  index?: number; // vị trí trong list (1-based)
}) {
  // Nếu muốn chỉ bật ở production: const policy = usePrefetchPolicy() khi NODE_ENV === 'production' ...
  const policy = usePrefetchPolicy();
  const { ref, onMouseEnter } = useSmartPrefetch(href, policy);

  return (
    <Link
      href={href}
      prefetch={false}            // ⛔ tắt auto prefetch của Next để mình kiểm soát theo policy/throttle
      ref={ref}
      onMouseEnter={onMouseEnter}
      className={className}
      onClick={() => {
        track('select_item', {
          item_list_name: listName,
          items: [
            {
              item_id: product.id,
              item_name: product.title,
              item_brand: product.brand,
              item_category: product.category,
              price: product.price,
              index,
            },
          ],
          debug_mode: process.env.NEXT_PUBLIC_ENV !== 'production',
        });
      }}
      // (tuỳ chọn) data-attr để debug nhanh trong DevTools
      data-prefetch-policy={policy.label}
    >
      {children}
    </Link>
  );
}
