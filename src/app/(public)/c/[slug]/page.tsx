// app/(public)/c/[slug]/page.tsx
import type { Metadata } from "next";
import ItemListAnalytics from "@/components/analytics/ItemListAnalytics";
import ProductCardLink from "@/components/product/ProductCardLink";
import SmartImage from "@/components/media/SmartImage";
import { salePercent, formatVND } from "@/lib/format";
import {
  parsePlpParams,
  buildCanonicalForCategory,
  buildTagForCategory,
} from "@/lib/plpParams";
import LoadMore from "@/components/plp/LoadMore"; // hoặc Pagination nếu anh dùng phân trang
// import Pagination from "@/components/plp/Pagination";
// import PlpFilterBar from "@/components/plp/PlpFilterBar";

const PAGE_SIZE = 24;

// -------- data --------
async function fetchCategoryProducts(
  slug: string,
  searchParams: Record<string, string | string[]>
) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = parsePlpParams(searchParams);
  const qs = new URLSearchParams(params as any).toString();
  const url = `${base}/api/categories/${encodeURIComponent(slug)}/products?${qs}`;

  let res: Response;
  if (process.env.NODE_ENV === "production") {
    res = await fetch(url, {
      next: {
        tags: [
          `list:category:${slug}`,
          // "products:list",
          buildTagForCategory(slug, params),
        ],
      },
    });
  } else {
    res = await fetch(url, { cache: "no-store" });
  }
  if (!res.ok) throw new Error("Failed to load category products");
  const data = await res.json();
  return { items: (data.items as any[]) || [], total: Number(data.total) || 0 };
}

// -------- metadata --------
type PageProps = { params: { slug: string }; searchParams: Record<string, string | string[]> };

export async function generateMetadata(
  { params, searchParams }: PageProps
): Promise<Metadata> {
  const canonicalPath = buildCanonicalForCategory(params.slug, searchParams);
  const title = `Pre-loved ${params.slug} | LOSIA`;
  const desc = `Khám phá đồ secondhand ${params.slug} đã qua tuyển chọn tại LOSIA.`;
  return {
    title,
    description: desc,
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
  };
}

// -------- page --------
export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { items, total } = await fetchCategoryProducts(params.slug, searchParams);

  // ✅ Lấy page hiện tại & tính listId/listName + offset index cho GA4
  const parsed = parsePlpParams(searchParams);
  const page = Math.max(1, Number(parsed.page || "1"));
  const indexOffset = (page - 1) * PAGE_SIZE;
  const listId = `cat_${params.slug}_p${page}`;
  const listName = `Category - ${params.slug} (p${page})`;

  const listForAnalytics = items.map((p: any) => ({
    id: String(p.id),
    title: p.title,
    price: Number(p.price),
    brand: p.brand,
    category: p.category,
  }));

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://losia.vn").replace(/\/$/, "");
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 12).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/product/${p.id}`,
      name: p.title,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* GA4: view_item_list */}
      <ItemListAnalytics items={listForAnalytics} listName={listName} listId={listId} />

      <h1 className="mb-4 text-2xl font-semibold capitalize">{params.slug}</h1>

      {/* <PlpFilterBar slug={params.slug} /> */}

      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

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
              listName={listName}               // ✅ GA4 list_name theo trang
              index={indexOffset + i + 1}        // ✅ GA4 position xuyên trang
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

      {/* Infinite Scroll hoặc Pagination tuỳ anh đang dùng */}
      <LoadMore total={total} pageSize={PAGE_SIZE} />
      {/* <Pagination total={total} pageSize={PAGE_SIZE} /> */}
    </main>
  );
}
