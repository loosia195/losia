'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Pagination({
  total,
  pageSize = 24,
}: {
  total: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const curr = Math.max(1, Number(sp.get('page') || '1'));
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = curr > 1;
  const hasNext = curr < pages;

  const go = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    if (p <= 1) params.delete('page');
    else params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (pages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => hasPrev && go(curr - 1)}
        disabled={!hasPrev}
        className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
      >
        ← Trang trước
      </button>
      <span className="mx-2 text-sm">
        Trang <strong>{curr}</strong> / {pages}
      </span>
      <button
        onClick={() => hasNext && go(curr + 1)}
        disabled={!hasNext}
        className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
      >
        Trang sau →
      </button>
    </div>
  );
}
