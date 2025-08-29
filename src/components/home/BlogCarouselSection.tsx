// src/components/home/BlogCarouselSection.tsx
"use client";

import React, { useRef } from "react";
import clsx from "clsx";

type BlogCard = {
  title: string;
  desc: string;
  image: string;
  href: string;
};

const BLOGS: BlogCard[] = [
  { title: "Săn đồ vintage đồng quê", desc: "Phong cách đồng quê đang trở lại và sẽ không biến mất đâu.", image: "assets/images/home/Blog01.png", href: "" },
  { title: "Tìm kiếm bộ suits phong cách", desc: "Ai nói áo vét thì phải nhàm chán? Bạn có thể mang năng lượng dạo phố vào dễ dàng.", image: "assets/images/home/Blog02.png", href: "" },
  { title: "Xây dựng phong cách của riêng mình", desc: "Khám phá phong cách cá nhân và tự tin hơn mỗi ngày chỉ với 10 bước.", image: "assets/images/home/Blog03.png", href: "" },
  { title: "Sắc màu mùa thu - Sức mạnh màu hồng phấn", desc: "Trải nghiệm màu hồng phấn mùa xuân với các món đồ vintage.", image: "assets/images/home/Blog04.png", href: "" },
  { title: "Phong cách phối đồ freesize", desc: "12 ý tưởng phối đồ với áo sơ mi form cơ bản cho mọi tâm trạng & dịp.", image: "assets/images/home/Blog06.png", href: "" },
  { title: "Uniqlo nhừng sản phẩm đáng mặc", desc: "15 sản phẩm Uniqlo đáng sắm nhất & mẹo để mua được giá hời.", image: "assets/images/home/Blog07.png", href: "" },
];

export default function BlogCarouselSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="relative isolate w-full bg-gray-50 py-12" data-component="blog-carousel">
      <div className="mx-auto max-w-6xl px-4">
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Khám phá blog phong cách vintage
        </h2>

        {/* Controls */}
        <div className="relative mt-6">
          {/* Left gradient + button */}
          <div className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-8 bg-gradient-to-r from-gray-50 to-transparent sm:w-12" />
          {/* Left button */}
<button
  type="button"
  aria-label="Scroll blogs left"
  onClick={() => scrollBy(-320)}
  className="absolute left-2 top-1/2 z-[3] hidden -translate-y-1/2 select-none rounded-full border bg-white/90 p-3 shadow md:inline-flex hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
>
  <img
    src="/assets/icons/arrow-left.svg"
    alt="prev"
    className="h-5 w-5"
  />
</button>

{/* Right button */}
<button
  type="button"
  aria-label="Scroll blogs right"
  onClick={() => scrollBy(320)}
  className="absolute right-2 top-1/2 z-[3] hidden -translate-y-1/2 select-none rounded-full border bg-white/90 p-3 shadow md:inline-flex hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
>
  <img
    src="/assets/icons/arrow-right.svg"
    alt="next"
    className="h-5 w-5"
  />
</button>

          {/* Track (1 section, 1 hàng, trượt ngang) */}
          <div
            ref={trackRef}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
          >
            {BLOGS.map((blog) => (
              <a
                key={blog.title}
                href={blog.href}
                target="_blank"
                rel="noreferrer"
                className="group relative flex min-w-[260px] max-w-[320px] snap-start flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md sm:min-w-[300px] lg:min-w-[340px]"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  loading="lazy"
                  className="h-44 w-full object-cover sm:h-52 lg:h-56"
                />
                <div className="flex flex-1 flex-col p-4 text-left">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:underline">
                    {blog.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">{blog.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* tailwind.css nên có util ẩn scrollbar:
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
*/
