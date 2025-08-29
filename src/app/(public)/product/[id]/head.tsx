// src/app/(public)/product/[id]/head.tsx
import { formatVND } from '@/lib/format';

async function fetchProduct(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Head({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) return null;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://losia.vn').replace(/\/$/, '');
  const url = `${baseUrl}/product/${product.id}`;
  const image =
    (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    '/assets/images/main/product1.jpg';

  return (
    <>
      {/* OG cơ bản */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />
      <meta property="og:title" content={product.title} />
      <meta property="og:description" content={product.description?.slice(0, 160) || ''} />
      <meta property="og:image" content={image} />

      {/* OG product extension */}
      <meta property="product:brand" content={product.brand || 'LOSIA'} />
      <meta property="product:availability" content={(product.inventory ?? 0) > 0 ? 'in stock' : 'out of stock'} />
      <meta property="product:price:amount" content={String(product.price)} />
      <meta property="product:price:currency" content="VND" />
    </>
  );
}
