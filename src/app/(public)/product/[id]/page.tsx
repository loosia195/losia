// app/(public)/product/[id]/page.tsx
import type { Metadata } from 'next';
import ProductAnalytics from '@/components/analytics/ProductAnalytics';
import ProductImageSection from '@/components/product/ProductImageGallery/ProductImageSection';
import ProductDetailSection from '@/components/product/ProductDetailSection/ProductDetailSection';
import MoreFromSellerSection from "@/components/product/MoreFromSellerSection";
import PeopleAlsoShop from "@/components/product/PeopleAlsoShop";

import { formatVND } from '@/lib/format';

// ---- Helpers (map alias -> group lưu trong EcoImpact) ----
const GROUP_ALIAS: Record<string, string> = {
  top: 'Top', tops: 'Top', shirt: 'Top', blouse: 'Top',
  dress: 'Dress', dresses: 'Dress',
  jean: 'Jeans', jeans: 'Jeans', denim: 'Jeans',
  outer: 'Outerwear', coat: 'Outerwear', jacket: 'Outerwear',
  skirt: 'Skirt', pants: 'Pants', trouser: 'Pants', shorts: 'Shorts',
  knit: 'Knitwear', sweater: 'Knitwear', hoodie: 'Knitwear',
};

function normalizeGroup(input?: string) {
  if (!input) return '';
  const key = String(input).trim().toLowerCase();
  return GROUP_ALIAS[key] || capitalizeFirst(input);
}
function capitalizeFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

async function fetchProduct(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const isProd = process.env.NODE_ENV === 'production';
  const res = await fetch(
    `${base}/api/products/${id}`,
    isProd ? { next: { revalidate: 300 } } : { cache: 'no-store' }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await fetchProduct(params.id);
  if (!p) return { title: 'Sản phẩm không tồn tại | LOSIA' };

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://losia.vn').replace(/\/$/, '');
  const url = `${baseUrl}/product/${p.id}`;
  const title = `${p.title} | ${p.brand ?? 'LOSIA'}`;
  const desc = [p.title, p.condition ? `Tình trạng: ${p.condition}` : null, p.price ? `Giá: ${formatVND(p.price)}` : null]
    .filter(Boolean)
    .join(' • ');
  const firstImage: string =
    (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
    '/assets/images/main/product1.jpg';

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: 'LOSIA', type: 'website', images: [{ url: firstImage }] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [firstImage] },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) {
    return <div className="mx-auto max-w-4xl px-4 py-10">Sản phẩm không tồn tại.</div>;
  }

  // Chuẩn hoá ảnh về string[]
  const images: string[] = Array.isArray(product.images)
    ? product.images.map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean)
    : [];
  const gallery = images.length ? images : ['/assets/images/main/product1.jpg'];

  // ---- Xác định "group" để map EcoImpact (giữ logic cũ)
  const rawGroup =
    product?.productType?.parent?.name ||
    product?.ecoImpactGroup ||
    product?.productType?.name ||
    product?.category ||
    'Dress';
  const group = normalizeGroup(rawGroup);

  // ★ HỢP NHẤT SIZE server-side tại page (phòng API chưa normalize)
  const unifiedSizeLabel =
    (product.size != null && String(product.size).trim()) ? String(product.size).trim()
    : (product.sizeLabel != null && String(product.sizeLabel).trim()) ? String(product.sizeLabel).trim()
    : (product.sizeOption?.sizeLabel != null && String(product.sizeOption.sizeLabel).trim()) ? String(product.sizeOption.sizeLabel).trim()
    : null;

  // ★ Tạo "normalizedProduct" để truyền xuống PDS (giữ nguyên mọi field khác)
  const normalizedProduct = {
    ...product,
    ecoImpactGroup: group || product.ecoImpactGroup || null,
    sizeLabel: unifiedSizeLabel,                           // ★ đảm bảo luôn có sizeLabel
    sizeDisplay: product.sizeDisplay ?? unifiedSizeLabel,  // ★ dùng sizeLabel làm display nếu thiếu
  };

  // JSON-LD
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://losia.vn').replace(/\/$/, '');
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: gallery,
    description: product.description?.slice(0, 300),
    brand: product.brand || 'LOSIA',
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price,
      availability: (product.inventory ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/product/${product.id}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Women',
        item: `${baseUrl}/c/${product.categorySlug || 'women'}`,
      },
      { '@type': 'ListItem', position: 3, name: product.title, item: `${baseUrl}/product/${product.id}` },
    ],
  };

  return (
    <main className="container mx-auto py-6 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12">
      {/* Analytics */}
      <ProductAnalytics
        id={product.id}
        title={product.title}
        price={product.price}
        brand={product.brand}
        category={product.category}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Cột trái: ảnh */}
      <div>
        <ProductImageSection title={product.title} productId={product.id} images={gallery} />
      </div>

      {/* Cột phải: PDS + chỉ hiển thị Description */}
      <div className="md:pl-8 lg:pl-12">
        {/* ✅ Truyền sản phẩm đã hợp nhất size */}
        <ProductDetailSection product={normalizedProduct as any} />
        </div>



        {/* ✅ More from this seller: full width dưới 2 cột */}
<div className="md:col-span-2">
  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-10" />


</div>

<div className="md:col-span-2">
  <PeopleAlsoShop currentBrand={product.brand /* string nếu có */} />
</div>


    </main>
  );
}
