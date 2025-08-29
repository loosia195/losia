"use client";

import Image from "next/image";
import { useState } from "react";

export default function Gallery({ images }: { images: Array<{ src: string; alt?: string }> }) {
  const [idx, setIdx] = useState(0);
  const list = images?.length ? images : [{ src: "/assets/images/main/product1.jpg", alt: "Losia product" }];
  const safe = Math.min(Math.max(idx, 0), list.length - 1);

  return (
    <div className="u-flex u-flex-col u-gap-1x md:u-sticky" style={{ top: -22 }}>
      <div className="u-rounded-8 u-overflow-hidden u-bg-gray-0">
        <Image src={list[safe].src} alt={list[safe].alt || "Product image"} width={960} height={1200} sizes="(max-width: 768px) 100vw, 50vw" priority className="u-w-full u-h-auto" />
      </div>
      <div className="u-flex u-gap-1x u-flex-wrap">
        {list.map((img, i) => (
          <button key={i} className={`u-rounded-6 u-overflow-hidden u-border ${i === safe ? "u-border-black" : "u-border-transparent"}`} onClick={() => setIdx(i)} aria-label={`View image ${i + 1}`}>
            <Image src={img.src} alt={img.alt || "thumb"} width={96} height={120} className="u-block" />
          </button>
        ))}
      </div>
    </div>
  );
}
