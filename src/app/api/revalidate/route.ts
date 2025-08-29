import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// (tuỳ chọn) đảm bảo Node.js runtime
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const headerSecret = req.headers.get("x-revalidate-secret") || undefined;
    const body = await req.json().catch(() => ({} as any));
    const bodySecret = body?.secret as string | undefined;
    const tagsInput = body?.tags as unknown;

    const secret = headerSecret || bodySecret;
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(tagsInput)) {
      return NextResponse.json({ ok: false, error: "No tags" }, { status: 400 });
    }

    // sanitize + dedupe + giới hạn (tránh abuse)
    const tags = Array.from(
      new Set(
        tagsInput
          .map((t) => (typeof t === "string" ? t.trim() : ""))
          .filter((t) => t.length > 0)
      )
    ).slice(0, 50); // limit 50 tags/lần

    if (tags.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid tags" }, { status: 400 });
    }

    tags.forEach((t) => revalidateTag(t));
    return NextResponse.json({ ok: true, tags });
  } catch (err) {
    console.error("Revalidate error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

// (tuỳ chọn) chặn method khác POST nếu muốn rõ ràng
export function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
