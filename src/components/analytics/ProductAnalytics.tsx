'use client';

import { useEffect } from 'react';

type Props = {
  id: string;
  title: string;
  price: number;
  brand?: string;
  category?: string;
};

export default function ProductAnalytics({ id, title, price, brand, category }: Props) {
  useEffect(() => {
    // Bắn GA4 event view_item khi trang PDP render trên client
    (window as any).gtag?.('event', 'view_item', {
      currency: 'VND',
      value: price,
      items: [
        {
          item_id: id,
          item_name: title,
          item_brand: brand,
          item_category: category,
        },
      ],
      // Cho debug dễ ở môi trường dev
      debug_mode: process.env.NEXT_PUBLIC_ENV !== 'production',
    });
  }, [id, title, price, brand, category]);

  return null;
}
