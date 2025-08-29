'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PlpFilterBar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  const [brand, setBrand] = useState(search.get('brand') ?? '');
  const [sort, setSort] = useState(search.get('sort') ?? 'newest');

  useEffect(() => {
    setBrand(search.get('brand') ?? '');
    setSort(search.get('sort') ?? 'newest');
  }, [search]);

  const apply = () => {
    const params = new URLSearchParams(search.toString());
    brand ? params.set('brand', brand) : params.delete('brand');
    sort ? params.set('sort', sort) : params.delete('sort');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <input
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand…"
        className="h-9 rounded-md border px-3 text-sm"
      />
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="h-9 rounded-md border px-2 text-sm"
      >
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá ↑</option>
        <option value="price_desc">Giá ↓</option>
      </select>
      <button
        onClick={apply}
        className="h-9 rounded-md bg-black px-3 text-sm font-medium text-white"
      >
        Áp dụng
      </button>
    </div>
  );
}
