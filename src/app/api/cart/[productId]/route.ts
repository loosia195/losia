import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type CartItem = { productId: number; qty: number };
const CART_COOKIE = 'losia_cart_v1';

function readCart(): CartItem[] {
  const store = cookies().get(CART_COOKIE)?.value || '[]';
  try { return JSON.parse(store); } catch { return []; }
}
function writeCart(items: CartItem[]) {
  cookies().set({ name: CART_COOKIE, value: JSON.stringify(items), httpOnly: true, path: '/', sameSite: 'lax' });
}

interface Ctx { params: { productId: string } }

export async function DELETE(_req: Request, { params }: Ctx) {
  const productId = Number(params.productId);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }
  const items = readCart().filter(i => i.productId !== productId);
  writeCart(items);
  return NextResponse.json({ ok: true, items });
}
