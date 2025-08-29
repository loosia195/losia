// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { createOrderCode } from '@/lib/orderCode';

const prisma = new PrismaClient();

/** =========================
 *  Email helpers (Resend)
 *  ========================= */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'LOSIA <onboarding@resend.dev>';
  if (!apiKey) {
    console.error('[notify] Missing RESEND_API_KEY');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error('[notify] sendEmail failed', res.status, await res.text());
  }
}

function formatVND(n: number) {
  try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }
  catch { return `${n}₫`; }
}

function buildOrderEmailHTML(params: {
  orderCode: string;
  method: 'COD' | 'QR';
  total: number;
  customer: { fullName: string; phone: string; email?: string | null; address: string };
}) {
  const { orderCode, method, total, customer } = params;
  const site = process.env.SITE_URL || '';
  const adminLink = site ? `${site}/admin/orders?code=${encodeURIComponent(orderCode)}` : '#';

  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111; max-width:640px; margin:0 auto; padding:8px 0;">
    <h2 style="margin:0 0 8px 0;">Đơn hàng mới: ${orderCode}</h2>
    <p style="margin:4px 0;"><b>Phương thức:</b> ${method}</p>
    <p style="margin:4px 0;"><b>Tổng tiền:</b> ${formatVND(total)}</p>
    <p style="margin:8px 0 0 0;"><b>Khách:</b> ${customer.fullName} – ${customer.phone}${customer.email ? ` – ${customer.email}` : ''}</p>
    <p style="margin:4px 0;"><b>Địa chỉ:</b> ${customer.address}</p>

    <div style="margin-top:16px;">
      <a href="${adminLink}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:10px;text-decoration:none">
        Mở trong Admin
      </a>
    </div>

    <p style="color:#666;font-size:12px;margin-top:24px;">Email tự động từ hệ thống LOSIA.</p>
  </div>
  `;
}

/** Chuẩn hoá shipping id giữa UI & API */
const SHIPPING_ALIASES: Record<string, 'free' | 'standard' | 'express'> = {
  free: 'free',
  standard: 'standard',
  express: 'express',
  bundle: 'free',      // UI dùng "bundle" -> free
  expedited: 'express' // UI dùng "expedited" -> express
};

const SHIPPING_FEES: Record<'free' | 'standard' | 'express', number> = {
  free: 0,
  standard: 20000,
  express: 50000,
};

const BaseSchema = z.object({
  cartId: z.string().optional(),
  anonId: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(5),

  // chấp nhận cả alias cũ/mới, sẽ normalize
  shipping: z.string().default('free'), // free | standard | express | bundle | expedited
  payment: z.enum(['cod', 'qr']).default('cod'),
});

/** Hỗ trợ cả JSON và FormData */
async function parseRequest(req: NextRequest) {
  const ctype = req.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    const json = await req.json();
    return BaseSchema.parse(json);
  }
  // fallback: form-data / x-www-form-urlencoded
  const form = await req.formData();
  return BaseSchema.parse({
    cartId: form.get('cartId') ? String(form.get('cartId')) : undefined,
    anonId: form.get('anonId') ? String(form.get('anonId')) : undefined,
    email: form.get('email') ? String(form.get('email')) : undefined,
    fullName: String(form.get('fullName') || ''),
    phone: String(form.get('phone') || ''),
    address: String(form.get('address') || ''),
    shipping: String(form.get('shipping') || 'free'),
    payment: String(form.get('payment') || 'cod') === 'qr' ? 'qr' : 'cod',
  });
}

async function getOrCreateUserIdByEmail(email: string, name: string, phone: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.user.create({
    data: { email, passwordHash: '', name, phone, role: 'CUSTOMER' },
    select: { id: true },
  });
  return created.id;
}

async function createGuestUserId(name: string, phone: string) {
  const guestEmail = `guest-${crypto.randomUUID()}@guest.local`;
  const user = await prisma.user.create({
    data: { email: guestEmail, passwordHash: '', name, phone, role: 'CUSTOMER' },
    select: { id: true },
  });
  return user.id;
}

// Ưu tiên: cartId → anonId(form) → anonId(cookie) → userId → (latest có items)
async function getActiveCart(
  req: NextRequest,
  userId: string | null,
  opts: { cartId?: string | null; anonIdFromForm?: string | null } = {}
) {
  const { cartId, anonIdFromForm } = opts;

  if (cartId) {
    const byId = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: { include: { inventory: true } } } } },
    });
    if (byId && byId.items.length > 0) return byId;
  }

  const anonIdCookie = cookies().get('anonId')?.value || null;
  const anonId = anonIdFromForm || anonIdCookie;

  if (anonId) {
    const byAnon = await prisma.cart.findFirst({
      where: { anonId },
      include: { items: { include: { product: { include: { inventory: true } } } } },
    });
    if (byAnon && byAnon.items.length > 0) return byAnon;
  }

  if (userId) {
    const byUser = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: { include: { inventory: true } } } } },
    });
    if (byUser && byUser.items.length > 0) return byUser;
  }

  const latest = await prisma.cart.findFirst({
    where: { items: { some: {} } },
    orderBy: { id: 'desc' },
    include: { items: { include: { product: { include: { inventory: true } } } } },
  });
  return latest ?? null;
}

function redirectWithError(req: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/checkout?err=${encodeURIComponent(code)}`, req.url), { status: 303 });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Parse input
    const parsed = await parseRequest(req);
    const { cartId, anonId, email, fullName, phone, address } = parsed;

    // 2) Chuẩn hoá shipping + validate cuối
    const shippingKey = SHIPPING_ALIASES[parsed.shipping] ?? 'free';
    const payment = parsed.payment; // 'cod' | 'qr'
    const methodLabel = payment.toUpperCase() as 'COD' | 'QR';

    console.log('[orders] incoming:', { cartId, anonId, email, shipping: shippingKey, payment });

    // 3) Xác định user
    const userId = email
      ? await getOrCreateUserIdByEmail(email, fullName, phone)
      : await createGuestUserId(fullName, phone);

    // 4) Lấy cart
    const cart = await getActiveCart(req, userId, {
      cartId: cartId ?? null,
      anonIdFromForm: anonId ?? null,
    });
    console.log('[orders] resolved cart:', { found: !!cart, id: cart?.id, items: cart?.items.length });

    if (!cart || cart.items.length === 0) {
      return redirectWithError(req, 'empty_cart');
    }

    // 5) Tính tiền
    const subtotal = cart.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const discount = 0;
    const shippingFee = SHIPPING_FEES[shippingKey] ?? 0;
    const tax = Math.round(subtotal * 0.1);          // ✅ 10%
    const total = subtotal - discount + shippingFee + tax;

    const orderLines = cart.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }));

    // 6) Tạo mã đơn đẹp + transaction: trừ tồn, tạo order, clear cart
    const generatedCode = createOrderCode('LOSIA');

    const created = await prisma.$transaction(async (tx) => {
      // Check tồn
      const productIds = orderLines.map((l) => l.productId);
      const inventories = await tx.inventory.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true, quantity: true },
      });
      const invMap = new Map(inventories.map((i) => [i.productId, i.quantity]));
      for (const line of orderLines) {
        const q = invMap.get(line.productId) ?? 0;
        if (q < line.quantity) throw new Error(`OUT_OF_STOCK:${line.productId}`);
      }

      // Trừ tồn (optimistic)
      for (const line of orderLines) {
        const updated = await tx.inventory.updateMany({
          where: { productId: line.productId, quantity: { gte: line.quantity } },
          data: { quantity: { decrement: line.quantity } },
        });
        if (updated.count === 0) throw new Error(`RACE_OUT_OF_STOCK:${line.productId}`);
      }

      // Tạo order
      const order = await tx.order.create({
        data: {
          userId,
          orderCode: generatedCode,          // ✅ mã đơn hàng đẹp, unique
          status: 'PENDING',
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
          currency: 'VND',
          items: {
            create: orderLines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
            })),
          },

          payments: {
            create: {
              provider: methodLabel, // 'COD' | 'QR'
              amount: total,
              // dùng enum Prisma thay vì string tay
              status:
                methodLabel === 'COD'
                  ? PaymentStatus.PENDING
                  : PaymentStatus.AWAITING_CONFIRMATION,
              payloadJson: JSON.stringify({
                shipping: {
                  method: shippingKey,
                  fee: shippingFee,
                  fullName,
                  phone,
                  address,
                  email: email ?? null,
                  cartId: cart.id,
                  anonId: anonId ?? cookies().get('anonId')?.value ?? null,
                },
                notes: `Checkout ${methodLabel}`,
              }),
            },
          },
        },
        select: { id: true, orderCode: true },
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order; // { id, orderCode }
    });

    /** 7) Gửi email (không chặn luồng nếu lỗi) */
    try {
      const toAdmin = process.env.ADMIN_EMAIL || '';
      const toCustomer = (email || '').trim();
      const recipients = [toAdmin, toCustomer].filter(Boolean);

      if (recipients.length > 0) {
        const html = buildOrderEmailHTML({
          orderCode: created.orderCode,
          method: methodLabel,
          total,
          customer: { fullName, phone, email, address },
        });
        await sendEmail({
          to: recipients,
          subject: `[LOSIA] Đơn mới ${created.orderCode} – ${methodLabel} – ${formatVND(total)}`,
          html,
        });
      }
    } catch (err) {
      console.error('[notify] email error', err);
      // không throw để tránh vỡ flow đặt hàng
    }

    // 8) Revalidate
    revalidateTag('products:list');
    for (const it of cart.items) revalidateTag(`product:${it.productId}`);

    // 9) Redirect 303 → /thank-you (client sẽ fetch /api/orders/[id] để hiển thị code)
    const location = new URL(
      `/thank-you?method=${payment}&order=${encodeURIComponent(created.orderCode)}&id=${encodeURIComponent(created.id)}`,
      req.url
    );
    return NextResponse.redirect(location, { status: 303 });
  } catch (e: any) {
    if (typeof e?.message === 'string' && (e.message.startsWith('OUT_OF_STOCK') || e.message.startsWith('RACE_OUT_OF_STOCK'))) {
      return redirectWithError(req, 'out_of_stock');
    }
    console.error('[orders] INTERNAL ERROR', e);
    return redirectWithError(req, 'internal');
  }
}
