"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.gtag) {
      const qs = searchParams?.toString();
      // @ts-ignore
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: qs ? `${pathname}?${qs}` : pathname,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
