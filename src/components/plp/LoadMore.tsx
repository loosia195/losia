'use client';
import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAutoLoadNext from './useAutoLoadNext';

export default function LoadMore({ total, pageSize = 24 }: { total: number; pageSize?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const curr = Number(sp.get('page') || '1');
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const hasNext = curr < pages;

  const [auto, setAuto] = useState(true);

  const goNext = useCallback(() => {
    if (!hasNext) return;
    const params = new URLSearchParams(sp.toString());
    params.set('page', String(curr + 1));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [curr, hasNext, pathname, router, sp]);

  const ref = useAutoLoadNext(goNext, auto && hasNext);

  if (!hasNext) return null;

  return (
    <div ref={ref} className="mt-6 flex flex-col items-center gap-2">
      <button onClick={goNext} className="h-10 rounded-md border px-4 text-sm">
        Tải thêm
      </button>
      <label className="flex items-center gap-2 text-xs text-gray-500">
        <input type="checkbox" checked={auto} onChange={() => setAuto(!auto)} />
        Tự động tải trang tiếp theo
      </label>
    </div>
  );
}
