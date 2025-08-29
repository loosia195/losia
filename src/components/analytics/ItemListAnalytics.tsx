'use client';

import { useEffect } from 'react';
import { track } from '@/app/hooks/useTrack';

type Item = { id: string; title: string; price: number; brand?: string; category?: string };

export default function ItemListAnalytics({
  items,
  listName = 'Home - Just In',
  listId = 'home_just_in',
}: {
  items: Item[];
  listName?: string;
  listId?: string;
}) {
  useEffect(() => {
    if (!items?.length) return;
    track('view_item_list', {
      item_list_id: listId,
      item_list_name: listName,
      items: items.map((p, idx) => ({
        item_id: p.id,
        item_name: p.title,
        item_brand: p.brand,
        item_category: p.category,
        price: p.price,
        index: idx + 1,
      })),
      // giúp debug ở dev nếu anh bật GA
      debug_mode: process.env.NEXT_PUBLIC_ENV !== 'production',
    });
  }, [items, listId, listName]);

  return null;
}
