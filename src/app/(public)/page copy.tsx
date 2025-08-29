// app/(public)/page.tsx
import { formatVND, salePercent } from '@/lib/format';
import ItemListAnalytics from '@/components/analytics/ItemListAnalytics';
import ProductCardLink from '@/components/product/ProductCardLink';
import SmartImage from '@/components/media/SmartImage';
import blurManifest from '../../../blur-manifest.json'; // gọn hơn với alias '@'
import type { Metadata } from "next"; // ⬅️ thêm dòng này (nếu chưa có)

export const metadata: Metadata = {
  alternates: { canonical: "/" }, // sẽ thành https://losia.vn/ nhờ metadataBase ở layout
};

async function fetchProducts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const url = `${base}/api/products?limit=24`;

  // ✅ Tránh union kiểu { next } | { cache }, gọi fetch theo nhánh
  let res: Response;
  if (process.env.NODE_ENV === 'production') {
    res = await fetch(url, { next: { tags: ['products:list'] } });
  } else {
    res = await fetch(url, { cache: 'no-store' });
  }

  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  return data.items as any[];
}

// Helper: tìm blur từ manifest (match full URL hoặc fallback theo basename)
const BLUR_MAP = blurManifest as Record<string, string>;
const blurFor = (u?: string) => {
  if (!u) return undefined;
  if (BLUR_MAP[u]) return BLUR_MAP[u];
  try {
    const pathname = new URL(u, 'http://_').pathname;
    const base = pathname.split('/').pop()!;
    return BLUR_MAP[pathname] || BLUR_MAP['/assets/images/main/' + base];
  } catch {
    const base = u.split('/').pop()!;
    return BLUR_MAP['/assets/images/main/' + base];
  }
};

export default async function HomePage() {
  const items = await fetchProducts();

  // Dữ liệu tối thiểu để track GA4 view_item_list
  const listForAnalytics = items.map((p: any) => ({
    id: String(p.id),
    title: p.title,
    price: Number(p.price),
    brand: p.brand,
    category: p.category,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* 🔍 GA4: view_item_list cho Home */}
      <ItemListAnalytics items={listForAnalytics} listName="Home - Just In" listId="home_just_in" />

      <h1 className="mb-4 text-2xl font-semibold">Just In – Pre-loved for Women & Kids</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p: any, i: number) => {
          const percent = salePercent(p.oldPrice, p.price);
          const cover: string = p.cover || '/assets/images/main/product1.jpg';
          const blur = blurFor(cover);

          return (
            <ProductCardLink
              key={p.id}
              href={`/product/${p.id}`}
              product={{
                id: String(p.id),
                title: p.title,
                price: Number(p.price),
                brand: p.brand,
                category: p.category,
              }}
              className="group block"
              listName="Home - Just In"
              index={i + 1}
            >
              <div className="relative">
                <SmartImage
                  kind="product"
                  src={cover}
                  preset="homeCard"
                  alt={p.title}
                  aspectRatio="3/4"
                  className="overflow-hidden rounded-xl bg-gray-100"
                  imgClassName="object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                  priority={i < 4}
                  placeholder={blur ? 'blur' : 'empty'}
                  blurDataURL={blur}
                />

                {percent > 0 && (
                  <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-rose-600/90 px-2 py-1 text-xs font-semibold text-white shadow">
                    -{percent}%
                  </span>
                )}
              </div>

              <div className="mt-2 text-sm">
                <div className="line-clamp-1">{p.title}</div>
                <div className="mt-1 font-medium">
                  {p.oldPrice ? (
                    <>
                      <span>{formatVND(p.price)}</span>
                      <span className="ml-2 text-xs text-gray-400 line-through">{formatVND(p.oldPrice)}</span>
                    </>
                  ) : (
                    <span>{formatVND(p.price)}</span>
                  )}
                </div>
              </div>
            </ProductCardLink>
          );
        })}
      </div>
    </main>
  );
}
