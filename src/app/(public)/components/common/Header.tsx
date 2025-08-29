"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useCart } from "@/app/providers/CartProvider";
import Image from "next/image";

/**
 * LOSIA — Global Header (UI/UX)
 * -------------------------------------------------------------
 * 3 tầng: PromoBar → TopBar (utility) → MainBar (logo/nav/search/cart)
 * - Sticky, shadow khi scroll
 * - Mega menu (Women, Kids) với danh mục con
 * - Search inline (desktop) + full-screen overlay (mobile)
 * - Cart badge kết nối CartProvider
 * - A11y: keyboard focus, ARIA, Esc để đóng menu/overlay
 *
 * NOTE: Điều chỉnh containerClass để khớp grid của site.
 */

const containerClass = "max-w-[1600px] mx-auto px-4 lg:px-6"; // chỉnh nếu site đang dùng kích thước khác
const ALL_PRODUCTS_PATH = "/products"; // 👉 nếu trang danh sách sp của anh khác (vd "/browse"), sửa tại đây
const ENABLED_PATHS = new Set<string>([ALL_PRODUCTS_PATH]); // chỉ cho phép click các đường dẫn trong set này

// -----------------------------
// Data: menu & categories
// -----------------------------

type MegaCol = { title: string; items: Array<{ label: string; href: string }> };

type MainNavItem =
  | { label: string; href: string; exact?: boolean; cta?: boolean }
  | { label: string; mega: MegaCol[]; href?: string; cta?: boolean };

const MAIN_NAV: MainNavItem[] = [
  {
    label: "Phụ nữ",
    mega: [
      {
        title: "Đầm & Jumpsuit",
        items: [
          { label: "Đầm maxi", href: "/c/women/dresses/maxi" },
          { label: "Đầm midi", href: "/c/women/dresses/midi" },
          { label: "Jumpsuit", href: "/c/women/jumpsuit" },
        ],
      },
      {
        title: "Áo & Cardigan",
        items: [
          { label: "Áo sơ mi", href: "/c/women/tops/shirt" },
          { label: "Áo thun", href: "/c/women/tops/tee" },
          { label: "Cardigan", href: "/c/women/tops/cardigan" },
        ],
      },
      {
        title: "Quần & Chân váy",
        items: [
          { label: "Quần jean", href: "/c/women/bottoms/jeans" },
          { label: "Quần vải", href: "/c/women/bottoms/trousers" },
          { label: "Chân váy", href: "/c/women/skirts" },
        ],
      },
      {
        title: "Phụ kiện",
        items: [
          { label: "Túi xách", href: "/c/women/accessories/bags" },
          { label: "Thắt lưng", href: "/c/women/accessories/belts" },
          { label: "Khăn/Phụ kiện tóc", href: "/c/women/accessories/scarf" },
        ],
      },
    ],
  },
  {
    label: "Trẻ em",
    mega: [
      {
        title: "Bé gái",
        items: [
          { label: "Đầm", href: "/c/kids/girls/dresses" },
          { label: "Áo thun", href: "/c/kids/girls/tees" },
          { label: "Áo khoác", href: "/c/kids/girls/outerwear" },
        ],
      },
      {
        title: "Bé trai",
        items: [
          { label: "Áo phông", href: "/c/kids/boys/tees" },
          { label: "Quần short", href: "/c/kids/boys/shorts" },
          { label: "Áo khoác", href: "/c/kids/boys/outerwear" },
        ],
      },
      {
        title: "Giày & Phụ kiện",
        items: [
          { label: "Giày trẻ em", href: "/c/kids/shoes" },
          { label: "Mũ & nón", href: "/c/kids/hats" },
          { label: "Balo", href: "/c/kids/backpacks" },
        ],
      },
    ],
  },
  { label: "Hàng mới về", href: "/new" },
  { label: "Khuyến mãi", href: "/sale" },
  // 👉 Nút CTA mới — cạnh "Khuyến mãi"
  { label: "Tất cả nhãn hàng", href: ALL_PRODUCTS_PATH, cta: true },
];

// -----------------------------
// Helpers: Link vẫn giữ style, nhưng chặn click + hiện thông báo khi chưa mở
// -----------------------------

function NavLink({
  href,
  children,
  className,
  enabledOverride,
  onBlocked,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  enabledOverride?: boolean;
  onBlocked?: () => void;
}) {
  const enabled = enabledOverride ?? ENABLED_PATHS.has(href);
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!enabled) {
      e.preventDefault();
      onBlocked?.();
    }
  };
  const handleKey: React.KeyboardEventHandler<HTMLAnchorElement> = (e) => {
    if (!enabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onBlocked?.();
    }
  };
  return (
    <Link href={href} className={className} onClick={handleClick} onKeyDown={handleKey}>
      {children}
    </Link>
  );
}

// -----------------------------
// Promo Bar
// -----------------------------

function PromoBar() {
  return (
    <div className="w-full bg-black text-white text-center text-xs sm:text-sm py-2">
      <div className={containerClass}>
        <span className="font-medium">Tiết kiệm, Bền vững</span> — Miễn phí vận chuyển cho đơn từ 499k.
      </div>
    </div>
  );
}

// -----------------------------
// Top Utility Bar
// -----------------------------

function TopBar() {
  return (
    <div className="hidden md:block border-b bg-white/70 backdrop-blur">
      <div className={clsx(containerClass, "flex items-center justify-end gap-6 py-2 text-sm text-gray-600")}>
        <Link href="/about" className="hover:text-gray-900">Về Losia</Link>
        <Link href="/sell" className="hover:text-gray-900">Bán cùng Losia</Link>
        <Link href="/help" className="hover:text-gray-900">Hỗ trợ</Link>
      </div>
    </div>
  );
}

// -----------------------------
// Search (desktop inline + mobile overlay)
// -----------------------------

function SearchInline() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md">
      <input
        aria-label="Tìm kiếm sản phẩm"
        className="w-full rounded-full border bg-white/90 px-4 py-2 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        placeholder="Tìm theo tên, brand, size…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Tìm kiếm">
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

function MobileSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function submit() {
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50"
          aria-modal
          role="dialog"
        >
          <div className="absolute inset-x-0 top-16">
            <div className={clsx(containerClass)}>
              <div className="rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 shrink-0" />
                  <input
                    ref={inputRef}
                    className="w-full bg-transparent text-base focus:outline-none"
                    placeholder="Tìm kiếm sản phẩm…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                  <button onClick={submit} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">
                    Tìm
                  </button>
                  <button onClick={onClose} className="p-2" aria-label="Đóng tìm kiếm">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -----------------------------
// Cart button (badge)
// -----------------------------

function CartButton() {
  const { items } = useCart();
  const count = items?.reduce((sum: number, it: any) => sum + (it?.quantity ?? 1), 0) ?? 0;
  return (
    <Link href="/cart" className="relative inline-flex items-center" aria-label="Giỏ hàng">
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-emerald-600 px-1.5 text-center text-[11px] font-semibold leading-5 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

// -----------------------------
// Mega Menu (desktop)
// -----------------------------

function MegaMenu({ cols, onBlocked }: { cols: MegaCol[]; onBlocked: () => void }) {
  return (
    <div className="border-t bg-white shadow-xl">
      <div className={clsx(containerClass, "grid grid-cols-2 gap-6 py-6 md:grid-cols-3 lg:grid-cols-4")}>        
        {cols.map((col) => (
          <div key={col.title}>
            <div className="mb-3 text-sm font-semibold text-gray-900">{col.title}</div>
            <ul className="space-y-2">
              {col.items.map((it) => (
                <li key={it.label}>
                  <NavLink href={it.href} className="text-sm text-gray-700 hover:text-gray-900" onBlocked={onBlocked}>
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// Small toast for blocked links
// -----------------------------

function BlockedToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="fixed left-1/2 top-3 z-[90] -translate-x-1/2"
        >
          <div className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm shadow-lg">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -----------------------------
// Main Bar
// -----------------------------

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const clearTimer = useRef<number | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus/toast on route change
  useEffect(() => {
    setMobileOpen(false);
    setHoverIdx(null);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => () => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
  }, []);

  function showBlockedToast() {
    setBlockedMsg("Tính năng sẽ mở sớm. Cảm ơn anh đã chờ!");
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setBlockedMsg(null), 2500);
  }

  return (
    <header className={clsx("sticky top-0 z-50", scrolled ? "shadow-sm" : "")}>      
      <PromoBar />
      <TopBar />

      {/* Main */}
      <div className={clsx("border-b bg-white/80 backdrop-blur", "relative")} onMouseLeave={() => setHoverIdx(null)}>
        <BlockedToast message={blockedMsg} />

        <div className={clsx(containerClass, "flex h-16 items-center justify-between gap-3 text-gray-900")}>          
          {/* Left: mobile menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              aria-label="Mở menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-xl border p-2 shadow-sm"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" aria-label="Trang chủ Losia" className="flex items-center gap-2">
            <Image
              src="/assets/icons/logo-icon.svg"
              alt="Losia"
              width={120}
              height={80}
              priority
              sizes=", (max-width: 768px) 32px, 36px"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-6">
            {MAIN_NAV.map((item, idx) => {
              const anyItem = item as any;
              const isMega = anyItem.mega;
              const isCTA = anyItem.cta === true;

              // Style cho nav thường vs CTA xanh
              const baseLinkCls = "text-sm font-medium text-gray-800 hover:text-gray-900";
              const ctaCls = "inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors";

              if (isMega) {
                return (
                  <div key={anyItem.label} onMouseEnter={() => setHoverIdx(idx)}>
                    <button
                      className={baseLinkCls + " flex items-center gap-1"}
                      aria-haspopup="true"
                      aria-expanded={hoverIdx === idx}
                    >
                      {anyItem.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {hoverIdx === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-0 right-0 top-full z-40"
                        >
                          <MegaMenu cols={anyItem.mega} onBlocked={showBlockedToast} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Non-mega item
              const href = anyItem.href as string;
              if (isCTA) {
                return (
                  <NavLink key={anyItem.label} href={href} enabledOverride={true} className={ctaCls}>
                    {anyItem.label}
                  </NavLink>
                );
              }
              return (
                <NavLink key={anyItem.label} href={href} className={baseLinkCls} onBlocked={showBlockedToast}>
                  {anyItem.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Desktop search */}
            <div className="hidden md:block">
              <SearchInline />
            </div>
            {/* Mobile search icon */}
            <button className="p-2 md:hidden" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}>
              <Search className="h-6 w-6" />
            </button>
            {/* Account */}
            <Link href="/login" aria-label="Tài khoản" className="hidden sm:inline-flex">
              <User className="h-6 w-6" />
            </Link>
            {/* Cart */}
            <CartButton />
          </div>
        </div>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden"
            >
              <div className="border-t bg-white p-4">
                {/* Mobile search quick */}
                <div className="mb-3">
                  <SearchInline />
                </div>
                <ul className="space-y-2">
                  {MAIN_NAV.map((item) => {
                    const maybe = item as any;
                    const isCTA = maybe.cta === true;

                    if (maybe.mega) {
                      return (
                        <li key={maybe.label}>
                          <div className="font-semibold text-gray-900">{maybe.label}</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            {maybe.mega.flatMap((col: MegaCol) => col.items).map((it: any) => (
                              <NavLink
                                key={it.href}
                                href={it.href}
                                className="text-sm text-gray-700 hover:text-gray-900"
                                onBlocked={showBlockedToast}
                              >
                                {it.label}
                              </NavLink>
                            ))}
                          </div>
                        </li>
                      );
                    }

                    const baseCls = "text-sm font-medium text-gray-800 hover:text-gray-900";
                    const ctaCls = "inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors";

                    return (
                      <li key={maybe.label}>
                        <NavLink href={maybe.href} className={isCTA ? ctaCls : baseCls} enabledOverride={isCTA} onBlocked={showBlockedToast}>
                          {maybe.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <Link href="/about" className="text-gray-700">Về Losia</Link>
                  <Link href="/sell" className="text-gray-700">Bán cùng Losia</Link>
                  <Link href="/help" className="text-gray-700">Hỗ trợ</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile search overlay */}
      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
