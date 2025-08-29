// app/(public)/product/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import ProductAnalytics from "@/components/analytics/ProductAnalytics";
import ProductImageSection from "@/components/product/ProductImageGallery/ProductImageSection";
import ProductDetailSection from "@/components/product/ProductDetailSection/ProductDetailSection";
import MoreFromSellerSection from "@/components/product/MoreFromSellerSection";
import PeopleAlsoShop from "@/components/product/PeopleAlsoShop";
import { formatVND } from "@/lib/format";

/** ---- ÉP ROUTE LUÔN DYNAMIC & KHÔNG DÙNG CACHE STATIC ---- */
export const dynamic = "force-dynamic";
export const revalidate = 0;
/** Đảm bảo môi trường Node (an toàn cho fetch server) */
export const runtime = "nodejs";

/** ---- Helpers (map alias -> group lưu trong EcoImpact) ---- */
const GROUP_ALIAS: Record<string, string> = {
  top: "Top",
  tops: "Top",
  shirt: "Top",
  blouse: "Top",
  dress: "Dress",
  dresses: "Dress",
  jean: "Jeans",
  jeans: "Jeans",
  denim: "Jeans",
  outer: "Outerwear",
  coat: "Outerwear",
  jacket: "Outerwear",
  skirt: "Skirt",
  pants: "Pants",
  trouser: "Pants",
  shorts: "Shorts",
  knit: "Knitwear",
  sweater: "Knitwear",
  hoodie: "Knitwear",
};

function normalizeGroup(input?: string) {
  if (!input) return "";
  const key = String(input).trim().toLowerCase();
  return GROUP_ALIAS[key] || capitalizeFirst(input);
}
function capitalizeFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** ---- Base URL an toàn cho mọi môi trường ----
 * Ưu tiên:
 * 1) headers() → x-forwarded-proto/host (Preview/Prod)
 * 2) VERCEL_URL (hostname khi chạy ở Vercel)
 * 3) SITE_URL (chỉ set ở Production = https://losia.vn)
 * 4) localhost (dev)
 * LƯU Ý: KHÔNG dùng NEXT_PUBLIC_SITE_URL ở server fetch.
 */
function getBaseUrl() {
  // Client side → dùng relative
  if (typeof window !== "undefined") return "";

  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() có thể không khả dụng trong một số ngữ cảnh
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

async function fetchProduct(id: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const p = await fetchProduct(params.id);
    if (!p) return { title: "Sản phẩm không tồn tại | LOSIA" };

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/product/${p.id}`;
    const title = `${p.title} | ${p.brand ?? "LOSIA"}`;
    const desc = [
      p.title,
      p.condition ? `Tình trạng: ${p.condition}` : null,
      p.price ? `Giá: ${formatVND(p.price)}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    const firstImage: string =
      (Array.isArray(p.images) && p.images.length > 0 && (typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url)) ||
      "/assets/images/main/product1.jpg";

    return {
      title,
      description: desc,
      alternates: { canonical: url },
      openGraph: {
        title,
        description: desc,
        url,
        siteName: "LOSIA",
        type: "website",
        images: [{ url: firstImage }],
      },
      twitter: { card: "summary_large_image", title, description: desc, images: [firstImage] },
    };
  } catch {
    return { title: "Chi tiết sản phẩm | LOSIA" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  if (!params?.id) notFound();

  let product: any = null;
  try {
    product = await fetchProduct(params.id);
  } catch (e) {
    console.error("fetchProduct failed:", e);
    throw e;
  }

  if (!product) {
    notFound();
  }

  // Chuẩn hoá ảnh về string[]
  const images: string[] = Array.isArray(product.images)
    ? product.images
        .map((i: any) => (typeof i === "string" ? i : i?.url))
        .filter(Boolean)
    : [];
  const gallery = images.length ? images : ["/assets/images/main/product1.jpg"];

  // Xác định "group" để map EcoImpact
  const rawGroup =
    product?.productType?.parent?.name ||
    product?.ecoImpactGroup ||
    product?.productType?.name ||
    product?.category ||
    "Dress";
  const group = normalizeGroup(rawGroup);

  // Hợp nhất size server-side
  const unifiedSizeLabel =
    product?.size && String(product.size).trim()
      ? String(product.size).trim()
      : product?.sizeLabel && String(product.sizeLabel).trim()
      ? String(product.sizeLabel).trim()
      : product?.sizeOption?.sizeLabel && String(product.sizeOption.sizeLabel).trim()
      ? String(product.sizeOption.sizeLabel).trim()
      : null;

  const normalizedProduct = {
    ...product,
    ecoImpactGroup: group || product.ecoImpactGroup || null,
    sizeLabel: unifiedSizeLabel,
    sizeDisplay: product.sizeDisplay ?? unifiedSizeLabel,
  };

  // JSON-LD
  const baseUrl = getBaseUrl();
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title ?? "Sản phẩm",
    image: gallery,
    description: product?.description ? String(product.description).slice(0, 300) : undefined,
    brand: product.brand || "LOSIA",
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: Number(product.price ?? 0),
      availability: (product?.inventory ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl}/product/${product.id}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: product?.category || "Women",
        item: `${baseUrl}/c/${product?.categorySlug || "women"}`,
      },
      { "@type": "ListItem", position: 3, name: product?.title ?? "Product", item: `${baseUrl}/product/${product.id}` },
    ],
  };

  return (
    <main className="container mx-auto py-6 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12">
      {/* Analytics */}
      <ProductAnalytics id={product.id} title={product.title} price={product.price} brand={product.brand} category={product.category} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Cột trái: ảnh */}
      <div>
        <ProductImageSection title={product.title ?? "Sản phẩm"} productId={product.id} images={gallery} />
      </div>

      {/* Cột phải: PDS */}
      <div className="md:pl-8 lg:pl-12">
        <ProductDetailSection product={normalizedProduct as any} />
      </div>

      {/* Divider full width */}
      <div className="md:col-span-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-10" />
      </div>

            {/* MoreFromSellerSection */}
      <div className="md:col-span-2">
  <MoreFromSellerSection
    currentProductId={product.id}
    sellerId={product.sellerId}     // chưa có thì undefined
    sellerLabel="this seller"
    limit={8}
    variant="losia"               
  />
</div>

      {/* PeopleAlsoShop */}
      <div className="md:col-span-2">
        <PeopleAlsoShop currentBrand={product?.brand} />
      </div>
    </main>
  );
}
