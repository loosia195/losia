'use client';
import { useEffect, useRef } from 'react';

export default function useAutoLoadNext(
  onIntersect: () => void,
  enabled = true
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) onIntersect();
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.unobserve(el);
  }, [onIntersect, enabled]);

  return ref;
}
