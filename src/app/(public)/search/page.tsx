// app/(public)/search/page.tsx
import type { Metadata } from "next";
import ItemListAnalytics from "@/components/analytics/ItemListAnalytics";
import ProductCardLink from "@/components/product/ProductCardLink";
import SmartImage from "@/components/media/SmartImage";
import { formatVND, salePercent } from "@/lib/format";
import {
  parseSearchParams,
  buildCanonicalForSearch,
  buildTagForSearch,
} from "@/lib/plpParams";
import LoadMore from "@/components/plp/LoadMore"; // hoặc Pagination
// import Pagination from "@/components/plp/Pagination";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Search | LOSIA",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

async function fetchSearchProducts(searchParams: Record<string, string | string[]>) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = parseSearchParams(searchParams);
  const qs = new URLSearchParams(params as any).toString();
  const url = `${base}/api/search?${qs}`;

  let res: Response;
  if (process.env.NODE_ENV === "production") {
    res = await fetch(url, {
      next: {
        tags: [
          "list:search",
          // "products:list",
          buildTagForSearch(params),
        ],
      },
    });
  } else {
    res = await fetch(url, { cache: "no-store" });
  }

  if (!res.ok) throw new Error("Failed to load search results");
  const data = await res.json();
  return {
    items: (data.items as any[]) || [],
    total: Number(data.total) || 0,
    q: (params.q || ""),
  };
}

type PageProps = { searchParams: Record<string, string | string[]> };

export default async function SearchPage({ searchParams }: PageProps) {
  buildCanonicalForSearch(searchParams);

  const { items, q, total } = await fetchSearchProducts(searchParams);

  // ✅ Lấy page & set GA4 listId/listName + offset index
  const parsed = parseSearchParams(searchParams);
  const page = Math.max(1, Number(parsed.page || "1"));
  const indexOffset = (page - 1) * PAGE_SIZE;
  const listId = `search_results_p${page}`;
  const listName = `Search - ${q} (p${page})`;

  const listForAnalytics = items.map((p: any) => ({
    id: String(p.id),
    title: p.title,
    price: Number(p.price),
    brand: p.brand,
    category: p.category,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <ItemListAnalytics items={listForAnalytics} listName={listName} listId={listId} />

      <h1 className="mb-4 text-2xl font-semibold">Kết quả cho “{q}”</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p: any, i: number) => {
          const percent = salePercent(p.oldPrice, p.price);
          const cover: string = p.cover || "/assets/images/main/product1.jpg";
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
              listName={listName}                // ✅
              index={indexOffset + i + 1}         // ✅
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
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        {formatVND(p.oldPrice)}
                      </span>
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

      {/* Infinite Scroll hoặc Pagination tuỳ anh */}
      <LoadMore total={total} pageSize={PAGE_SIZE} />
      {/* <Pagination total={total} pageSize={PAGE_SIZE} /> */}
    </main>
  );
}
