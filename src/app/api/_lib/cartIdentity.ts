// src/app/api/_lib/cartIdentity.ts
import { cookies } from "next/headers";
import { auth } from "@/auth";

export type CartIdentity = { userId: string | null; anonId: string | null };

export async function getOrCreateCartIdentity(): Promise<CartIdentity> {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null; // có nhờ callbacks ở trên

  if (userId) return { userId, anonId: null };

  const store = cookies();
  let anonId = store.get("anonId")?.value ?? null;
  if (!anonId) {
    anonId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    store.set("anonId", anonId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return { userId: null, anonId };
}
