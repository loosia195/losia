// src/app/api/cart/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✅ dùng default import, KHÔNG phải { prisma }
export const runtime = "nodejs";


/** Cookie cũ lưu list item client-side (sẽ migrate sang DB) */
const LEGACY_CART_COOKIE = 'losia_cart_v1';
/** Cookie danh tính ẩn danh để gắn cart vào DB */
const ANON_COOKIE = 'anonId';

/* ---------------- utils ---------------- */

type LegacyCartItem = { productId: string; qty: number };

/** Đọc JSON an toàn */
function safeParseJson<T>(raw: string | undefined | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toPositiveInt(v: unknown, fallback = 1) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i >= 1 ? i : fallback;
}

/** Lấy hoặc set anonId cookie (SameSite=Lax để browser gửi cùng fetch) */
function getOrSetAnonId(): string {
  const c = cookies();
  let anon = c.get(ANON_COOKIE)?.value;
  if (!anon) {
    anon = `anon_${crypto.randomUUID()}`;
    c.set(ANON_COOKIE, anon, {
      path: '/',
      httpOnly: false, // cho client đọc nếu cần
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 năm
    });
  }
  return anon;
}

/** Tạo/đọc cart trong DB gắn với anonId */
async function getOrCreateCartByAnon(anonId: string) {
  let cart = await prisma.cart.findFirst({
    where: { anonId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { anonId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

/** Enrich từ cart DB sang shape checkout cần */
async function buildCheckoutPayload(cartId: string, anonId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              oldPrice: true,
              brand: { select: { name: true } },
              category: { select: { slug: true } },
              images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
              inventory: { select: { quantity: true } },
              status: true,
            },
          },
        },
      },
    },
  });

  const detailed =
    cart?.items
      .map((it) => {
        const p = it.product;
        if (!p || p.status !== 'ACTIVE') return null;
        const inStock = (p.inventory?.quantity ?? 0) > 0;
        return {
          productId: it.productId,
          qty: it.quantity ?? 1, // secondhand thường = 1
          product: {
            id: p.id,
            title: p.title,
            price: it.unitPrice ?? p.price,
            oldPrice: p.oldPrice ?? null,
            brand: p.brand?.name,
            category: p.category?.slug,
            cover: p.images?.[0]?.url || null,
            inStock,
          },
        };
      })
      .filter(Boolean) ?? [];

  const subtotal = detailed.reduce((s, it) => s + (it!.product.price * it!.qty), 0);
  const count = detailed.reduce((s, it) => s + it!.qty, 0);

  return {
    id: cartId,
    anonId,
    email: null,
    detailed: detailed as Array<{
      productId: string;
      qty: number;
      product: {
        id: string;
        title: string;
        price: number;
        oldPrice: number | null;
        brand?: string;
        category?: string;
        cover: string | null;
        inStock: boolean;
      };
    }>,
    subtotal,
    count,
  };
}

/** Nhập (migrate) giỏ từ cookie cũ vào DB cart 1 lần rồi xoá cookie cũ */
async function migrateLegacyCookieCartToDB(anonId: string, cartId: string) {
  const cookieRaw = cookies().get(LEGACY_CART_COOKIE)?.value;
  const legacy = safeParseJson<LegacyCartItem[]>(cookieRaw, []);
  if (!legacy.length) return;

  // Lọc unique theo productId, secondhand → qty luôn = 1
  const uniqueIds = Array.from(new Set(legacy.map((i) => i.productId)));

  await prisma.$transaction(async (tx) => {
    // Kiểm tra sp ACTIVE & còn tồn
    const products = await tx.product.findMany({
      where: { id: { in: uniqueIds }, status: 'ACTIVE' },
      select: { id: true, price: true, inventory: { select: { quantity: true } } },
    });
    const canAdd = new Set(products.filter((p) => (p.inventory?.quantity ?? 0) > 0).map((p) => p.id));

    // Upsert từng item vào cart DB, qty = 1, unitPrice = price hiện tại
    for (const pid of uniqueIds) {
      if (!canAdd.has(pid)) continue;
      const exists = await tx.cartItem.findFirst({ where: { cartId, productId: pid } });
      if (!exists) {
        const product = products.find((p) => p.id === pid)!;
        await tx.cartItem.create({
          data: { cartId, productId: pid, quantity: 1, unitPrice: product.price },
        });
      } else if (exists.quantity !== 1) {
        await tx.cartItem.update({ where: { id: exists.id }, data: { quantity: 1 } });
      }
    }
  });

  // Xoá cookie cũ sau khi migrate xong
  cookies().set(LEGACY_CART_COOKIE, '[]', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
}

/* ---------------- handlers ---------------- */

export async function GET() {
  try {
    const anonId = getOrSetAnonId();
    const cart = await getOrCreateCartByAnon(anonId);

    // Nếu còn cookie cart cũ → migrate sang DB rồi trả payload DB
    if (cookies().get(LEGACY_CART_COOKIE)?.value) {
      await migrateLegacyCookieCartToDB(anonId, cart.id);
    }

    const payload = await buildCheckoutPayload(cart.id, anonId);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[GET /api/cart]', err);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const anonId = getOrSetAnonId();
    const cart = await getOrCreateCartByAnon(anonId);

    // Lấy productId từ JSON / FormData / Query
    let productId = '';
    let qty = 1;

    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        const body = await req.json();
        productId = String(body?.productId || '');
        qty = toPositiveInt(body?.quantity ?? body?.qty ?? 1);
      }
    } catch {}

    if (!productId) {
      try {
        const form = await req.formData();
        productId = String(form.get('productId') || '');
        qty = toPositiveInt(form.get('quantity') ?? form.get('qty') ?? 1);
      } catch {}
    }

    if (!productId) {
      const url = new URL(req.url);
      productId = String(url.searchParams.get('productId') || '');
      qty = toPositiveInt(url.searchParams.get('quantity') ?? url.searchParams.get('qty') ?? 1);
    }

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'Invalid productId' }, { status: 400 });
    }

    // Secondhand → luôn = 1
    qty = 1;

    // Kiểm tra sản phẩm ACTIVE + còn tồn
    const prod = await prisma.product.findUnique({
      where: { id: productId },
      select: { status: true, price: true, inventory: { select: { quantity: true } } },
    });
    if (!prod || prod.status !== 'ACTIVE') {
      return NextResponse.json({ ok: false, error: 'Product not available' }, { status: 400 });
    }
    if ((prod.inventory?.quantity ?? 0) <= 0) {
      return NextResponse.json({ ok: false, error: 'Out of stock' }, { status: 409 });
    }

    // Upsert vào DB cart
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (existing) {
      if (existing.quantity !== 1) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: 1 } });
      }
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: 1, unitPrice: prod.price },
      });
    }

    const payload = await buildCheckoutPayload(cart.id, anonId);
    return NextResponse.json({ ok: true, ...payload });
  } catch (err) {
    console.error('[POST /api/cart]', err);
    return NextResponse.json({ ok: false, error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const anonId = getOrSetAnonId();
    const cart = await getOrCreateCartByAnon(anonId);

    // Lấy productId từ JSON / FormData / Query
    let productId = '';

    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        const body = await req.json();
        productId = String(body?.productId || '');
      }
    } catch {}

    if (!productId) {
      try {
        const form = await req.formData();
        productId = String(form.get('productId') || '');
      } catch {}
    }

    if (!productId) {
      const url = new URL(req.url);
      productId = String(url.searchParams.get('productId') || '');
    }

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'Invalid productId' }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

    const payload = await buildCheckoutPayload(cart.id, anonId);
    return NextResponse.json({ ok: true, ...payload });
  } catch (err) {
    console.error('[DELETE /api/cart]', err);
    return NextResponse.json({ ok: false, error: 'Failed to remove item' }, { status: 500 });
  }
}
