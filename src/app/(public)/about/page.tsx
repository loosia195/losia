"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Recycle, Users, Heart, Sparkles, ShieldCheck, Truck, ShoppingBag, Globe2, Star, Camera, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * LOSIA — About Us Page
 * - TailwindCSS + shadcn/ui + Framer Motion
 * - Drop into app/(public)/about/page.tsx or as a route component.
 * - Replace images (Image src) with your assets.
 */

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function Section({
  id,
  className = "",
  children,
}: React.PropsWithChildren<{ id?: string; className?: string }>) {
  return (
    <motion.section
      id={id}
      className={`mx-auto max-w-[1200px] px-4 lg:px-6 ${className}`}
      variants={SECTION_VARIANTS}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

const VALUES = [
  {
    icon: <Leaf className="w-6 h-6" />, title: "Bền vững thật sự", 
    desc: "Mỗi quyết định thiết kế, vận hành, logistics đều ưu tiên giảm phát thải và kéo dài vòng đời sản phẩm.",
  },
  {
    icon: <Users className="w-6 h-6" />, title: "Vì cộng đồng",
    desc: "Tôn vinh người bán nhỏ lẻ, thợ giặt ủi, shipper địa phương và mạng lưới tái chế của Việt Nam.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />, title: "Trải nghiệm tinh gọn",
    desc: "UI/UX tối giản, tốc độ nhanh, ảnh đẹp, và các chi tiết nhỏ được chăm chút tỉ mỉ.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />, title: "An tâm mua sắm",
    desc: "Bảo chứng an toàn – Hoàn tiền nếu không như mô tả, xử lý đổi trả minh bạch.",
  },
];

const TIMELINE = [
  {
    year: "2022–2024",
    title: "Hannah Vintage",
    text: "Khởi đầu từ livestream bán đồ 2hand mỗi tối – học được điều quý giá: người mua cần tin cậy và sự tiện.",
  },
  {
    year: "2025",
    title: "LOSIA ra đời",
    text: "" +
      "Xây nền tảng secondhand-first dành cho phụ nữ & trẻ em, kết hợp Consignment + P2P + RaaS cho brand.",
  },
  {
    year: "2025 →",
    title: "Dress Me AI™",
    text: "Trợ lý phối đồ & tìm sản phẩm tương tự từ ảnh – tối giản thời gian tìm kiếm, tăng cơ hội tái sử dụng.",
  },
];

const TEAM = [
  {
    name: "Ha Hoang",
    role: "CEO & Founder",
    avatar: "/assets/images/about/hoangha.png",
    bio: "Hơn 7 năm kinh nghiệm secondhand retail và chuỗi cung ứng. Hà dẫn dắt toàn bộ quy trình vận hành, biến mỗi món đồ thành chuẩn “như mới” trong 48h.",
  },
  {
    name: "Thanh Tran",
    role: "Co-Founder - CTO",
    avatar: "/assets/images/about/tranthanh.png",
    bio: " Doanh nhân xã hội với hành trình từ Lagom Vietnam đến LOSIA. Đam mê thời trang bền vững, Thanh Trần mang tầm nhìn “Secondhand First” để xây dựng nền tảng resale hàng đầu Việt Nam.",
  },
  {
    name: "Tai Hoang",
    role: "Lead Developer",
    avatar: "/assets/images/about/hoangtai.jpg",
    bio: "Thạc sĩ Khoa học Máy tính với hơn 10 năm quản lý hạ tầng. Tài thiết kế backbone cloud-native, đảm bảo LOSIA luôn ổn định, nhanh và sẵn sàng mở rộng.",
  },
];

const PRESS = [
  { name: "VTV", logo: "/assets/images/press/vtv.png" }, 
  { name: "VNExpress", logo: "/assets/images/press/vnexpress.png" },
  { name: "Tuổi Trẻ", logo: "/assets/images/press/tuoitre.png" },
  { name: "Forbes", logo: "/assets/images/press/forbes.png" },
];

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gray-50">{icon}</div>
        <div>
          <div className="text-2xl font-bold leading-tight">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="h-full rounded-2xl shadow-sm">
      <CardHeader className="space-y-2">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 leading-relaxed">{desc}</CardContent>
    </Card>
  );
}

export default function AboutUsPage() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <Section className="pt-14 pb-10 lg:pt-24 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Về LOSIA
              </motion.h1>
              <p className="mt-4 text-lg text-gray-700">
                Nền tảng resale dành cho phụ nữ & trẻ em – nơi <span className="font-semibold">Secondhand First</span> trở thành lựa chọn tự nhiên.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl h-10 px-5">
                  <Link href="/women">Mua sắm ngay</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl h-10 px-5">
                  <Link href="/cleanout/choose-service">Bán cùng LOSIA</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> An tâm mua sắm</div>
                <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Giao hàng thuận tiện</div>
                <div className="flex items-center gap-2"><HandHeart className="w-4 h-4" /> 1% cho cộng đồng</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/5">
                <Image
                  src="/assets/images/about/hero.png"
                  alt="LOSIA — Women & Kids secondhand fashion"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* MISSION */}
      <Section id="mission" className="pb-4">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h2 className="text-2xl md:text-3xl font-bold">Sứ mệnh</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Truyền cảm hứng cho thế hệ mua sắm mới nghĩ đến <span className="font-semibold">đồ đã qua sử dụng trước tiên</span>. 
              Chúng tôi kết nối người bán – người mua, tăng vòng đời quần áo, và đưa trải nghiệm chuẩn UI/UX đến mọi người.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex gap-2"><Recycle className="w-5 h-5 mt-0.5" /> Resale-as-a-Service (RaaS) cho brand & nhà bán lẻ.</li>
              <li className="flex gap-2"><Camera className="w-5 h-5 mt-0.5" /> Ảnh đẹp, nhanh, nhất quán – chuẩn thương mại điện tử.</li>
              <li className="flex gap-2"><Sparkles className="w-5 h-5 mt-0.5" /> Dress Me AI™ – gợi ý từ ảnh, cá nhân hoá theo phong cách & size.</li>
            </ul>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Sản phẩm được tái sử dụng" value="> 50k" />
            <StatCard icon={<Heart className="w-5 h-5" />} label="CO₂ ước tính được tránh" value="120+ tấn" />
            <StatCard icon={<Globe2 className="w-5 h-5" />} label="Đơn hàng giao khắp VN" value="63/63 tỉnh" />
            <StatCard icon={<Star className="w-5 h-5" />} label="Đánh giá hài lòng" value="4.9/5" />
          </div>
        </div>
      </Section>

      {/* VALUES */}
      <Section id="values" className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Giá trị cốt lõi</h2>
        <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">Những nguyên tắc dẫn dắt sản phẩm & dịch vụ của chúng tôi.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <ValueCard icon={v.icon} title={v.title} desc={v.desc} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* STORY / TIMELINE */}
      <Section id="story" className="py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Câu chuyện</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              LOSIA lớn lên từ những buổi livestream bán đồ 2hand giản dị, nơi chúng tôi học cách lắng nghe và tôn trọng từng chiếc áo.
              Hôm nay, chúng tôi mang tinh thần ấy vào một nền tảng hiện đại, thân thiện, và minh bạch.
            </p>
            <div className="mt-6 space-y-5">
              {TIMELINE.map((t, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="text-sm text-gray-500">{t.year}</div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-gray-700">{t.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-sm">
              <Image src="/assets/images/about/story.png" alt="LOSIA Story" width={1200} height={900} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </Section>

      {/* IMPACT */}
      <Section id="impact" className="py-10">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-5 h-5" />
          <h2 className="text-2xl md:text-3xl font-bold">Tác động môi trường</h2>
        </div>
        <p className="text-gray-700 max-w-3xl">
          Chúng tôi đo lường nước, năng lượng và CO₂ tiết kiệm được thông qua việc tái sử dụng quần áo.
          Mỗi trang sản phẩm hiển thị <span className="font-semibold">Eco Impact</span> theo loại sản phẩm dựa trên dữ liệu LCA.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl"><CardContent className="p-6"><div className="text-sm text-gray-500">Nước tiết kiệm</div><div className="text-2xl font-bold">~ 35 triệu lít</div></CardContent></Card>
          <Card className="rounded-2xl"><CardContent className="p-6"><div className="text-sm text-gray-500">Điện chiếu sáng</div><div className="text-2xl font-bold">~ 1.2 triệu giờ</div></CardContent></Card>
          <Card className="rounded-2xl"><CardContent className="p-6"><div className="text-sm text-gray-500">Hành trình lái xe tránh</div><div className="text-2xl font-bold">~ 500k km</div></CardContent></Card>
        </div>
      </Section>

      {/* TEAM */}
      <Section id="team" className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Meet The Team</h2>
        <p className="mt-2 text-center text-gray-600">Wear What Matters</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardContent className="p-0">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-50">
  <Image
    src={m.avatar}
    alt={m.name}
    width={800}
    height={600}
    className="w-full h-full object-contain"
  />
</div>
                <div className="p-4">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-gray-500">{m.role}</div>
                  <p className="mt-2 text-sm text-gray-700">{m.bio}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* SOCIAL PROOF / PRESS */}
      <Section id="press" className="py-10">
        <div className="flex items-center gap-2 mb-6"><Sparkles className="w-5 h-5" /><h2 className="text-2xl md:text-3xl font-bold">Báo chí & cộng đồng</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
          {PRESS.map((p, i) => (
            <div key={i} className="opacity-80 hover:opacity-100 transition">
              <Image src={p.logo} alt={p.name} width={160} height={48} className="h-10 w-auto object-contain" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl"><CardContent className="p-6 text-sm text-gray-700">“Từ livestream đến nền tảng, LOSIA đang đưa secondhand trở thành lựa chọn mặc định.”</CardContent></Card>
          <Card className="rounded-2xl"><CardContent className="p-6 text-sm text-gray-700">“UI/UX mượt mà, ảnh sản phẩm đẹp và nhất quán.”</CardContent></Card>
          <Card className="rounded-2xl"><CardContent className="p-6 text-sm text-gray-700">“Dress Me AI™ giúp tôi tìm đúng món trong vài giây.”</CardContent></Card>
        </div>
      </Section>

      {/* CTA RIBBON */}
      <Section id="cta" className="py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 ring-1 ring-black/5">
          <div className="px-6 py-10 lg:px-10 lg:py-12 grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Secondhand First — Wear What Matters</h3>
              <p className="mt-2 text-gray-700">Chọn món bạn yêu, mặc thật lâu, và bán lại dễ dàng.</p>
            </div>
            <div className="flex gap-3 lg:justify-end">
              <Button asChild className="rounded-xl h-10 px-5"><Link href="/women">Bắt đầu mua sắm</Link></Button>
              <Button asChild variant="outline" className="rounded-xl h-10 px-5"><Link href="/cleanout/choose-service">Gửi đồ bán</Link></Button>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ LIGHT */}
      <Section id="faq" className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Câu hỏi thường gặp</h2>
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">LOSIA bán gì?</CardTitle></CardHeader><CardContent className="text-sm text-gray-700">Quần áo & phụ kiện secondhand/like-new cho phụ nữ & trẻ em, được kiểm tra chất lượng & chụp ảnh đẹp.</CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Tôi có thể bán đồ như thế nào?</CardTitle></CardHeader><CardContent className="text-sm text-gray-700">Chọn dịch vụ Clean Out để gửi đồ hoặc tự đăng bán (P2P). Đồ đạt chuẩn sẽ được niêm yết trên sàn.</CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Dress Me AI™ hoạt động ra sao?</CardTitle></CardHeader><CardContent className="text-sm text-gray-700">Bạn tải ảnh món yêu thích; hệ thống sẽ gợi ý các sản phẩm tương tự theo kiểu dáng, chất liệu và tông màu.</CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Chính sách đổi trả?</CardTitle></CardHeader><CardContent className="text-sm text-gray-700">Trong trường hợp sản phẩm không đúng mô tả, chúng tôi hỗ trợ đổi trả/hoàn tiền linh hoạt.</CardContent></Card>
        </div>
      </Section>

    </div>
  );
}
