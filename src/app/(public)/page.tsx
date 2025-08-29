// app/(public)/page.tsx
import { formatVND, salePercent } from "@/lib/format";
import ItemListAnalytics from "@/components/analytics/ItemListAnalytics";
import ProductCardLink from "@/components/product/ProductCardLink";
import SmartImage from "@/components/media/SmartImage";

import PromoBanner from "@/components/home/PromoBanner";
import HighLightBanner from "@/components/home/HighLightBanner";
import HeroCarousel from "@/components/home/HeroCarousel";
import HeaderCarousel from "@/components/home/HeaderCarousel";
import CleanOutSection from "@/components/home/CleanOutSection";
import SeasonOutfitSection from "@/components/home/SeasonOutfitSection";
import TrendingFinishingTouchesSection from "@/components/home/TrendingFinishingTouchesSection";
import EarthMonthBillboard from "@/components/home/EarthMonthBillboard";
import NaturalMaterialsSection from "@/components/home/NaturalMaterialsSection";
import ImageSearchBillboard from "@/components/home/ImageSearchBillboard";
import SustainableImpactInfoBlock from "@/components/home/SustainableImpactInfoBlock";
import BrandCardsSection from "@/components/home/BrandCardsSection";
import AboutBlock from "@/components/home/AboutBlock";
import BlogCarouselSection from "@/components/home/BlogCarouselSection";
import DiscoverSection from "@/components/home/DiscoverSection";



import blurManifest from "../../../blur-manifest.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

async function fetchProducts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const url = `${base}/api/products?limit=24`;

  let res: Response;
  if (process.env.NODE_ENV === "production") {
    res = await fetch(url, { next: { tags: ["products:list"] } });
  } else {
    res = await fetch(url, { cache: "no-store" });
  }

  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return data.items as any[];
}

// Helper blur map
const BLUR_MAP = blurManifest as Record<string, string>;
const blurFor = (u?: string) => {
  if (!u) return undefined;
  if (BLUR_MAP[u]) return BLUR_MAP[u];
  try {
    const pathname = new URL(u, "http://_").pathname;
    const base = pathname.split("/").pop()!;
    return BLUR_MAP[pathname] || BLUR_MAP["/assets/images/main/" + base];
  } catch {
    const base = u.split("/").pop()!;
    return BLUR_MAP["/assets/images/main/" + base];
  }
};

export default async function HomePage() {
  const items = await fetchProducts();

  // Dữ liệu cho GA4 view_item_list
  const listForAnalytics = items.map((p: any) => ({
    id: String(p.id),
    title: p.title,
    price: Number(p.price),
    brand: p.brand,
    category: p.category,
  }));


  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Promo full-bleed */}
      <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
        <PromoBanner message="GIẢM 50% ĐƠN ĐẦU TIÊN" ctaText="Mua ngay" code="FALL50" />
      </div>

      {/* Highlight trong container */}
      <HighLightBanner />

      {/* Hero Carousel “wide” trong khung 1400px (không full màn) */}
      <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
        <div className="mx-auto max-w-[1400px] px-4">
          <HeroCarousel />
        </div>
      </div>

      {/* 4 thẻ danh mục nhỏ */}
      <HeaderCarousel />

      {/* Billboard Clean Out (full-bleed mặc định) */}
      <CleanOutSection />

      {/* Seasonal Outfits nhận data từ server */}
      <SeasonOutfitSection/>

      <TrendingFinishingTouchesSection />

      <EarthMonthBillboard />

      <NaturalMaterialsSection />

      <ImageSearchBillboard />

      <SustainableImpactInfoBlock />

      <BrandCardsSection />

      <AboutBlock />      

      <BlogCarouselSection />      

      <DiscoverSection />  

      
    </main>
  );
}
