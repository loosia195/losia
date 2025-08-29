'use client';
import { useEffect } from 'react';

type Item = {
  product: { id: string; title: string; price: number; brand?: string; category?: string };
  qty: number;
};

export default function ViewCartAnalytics({ items, value }: { items: Item[]; value: number }) {
  useEffect(() => {
    if (!items?.length) return;
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    window.dataLayer.push({
      event: 'view_cart',
      ecommerce: {
        currency: 'VND',
        value: Number(value) || 0,
        items: items.map(({ product, qty }) => ({
          item_id: String(product.id),
          item_name: product.title,
          price: Number(product.price),
          item_brand: product.brand,
          item_category: product.category,
          quantity: qty,
        })),
      },
    });
  }, [items, value]);

  return null;
}
