// src/lib/plpParams.ts
// Chuẩn hoá & allowlist param để tránh URL bẩn, đồng thời build tag revalidation.

type RawParams = Record<string, string | string[]>;
export type PlpParams = {
  page?: string;            // 1,2,3,...
  sort?: "newest" | "price_asc" | "price_desc";
  brand?: string;           // slug brand
  size?: string;            // s,m,l,xl
  condition?: "new" | "like_new" | "good" | "fair";
  price_min?: string;       // số
  price_max?: string;       // số
};

export type SearchParams = {
  q?: string;
  page?: string;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc";
};

const ALLOWED_PLP_KEYS = new Set([
  "page", "sort", "brand", "size", "condition", "price_min", "price_max",
]);
const ALLOWED_SEARCH_KEYS = new Set(["q", "page", "sort"]);

// ---- helpers
function first(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
function onlyDigits(v?: string) {
  return v && /^\d+$/.test(v) ? v : undefined;
}

// ---- parse
export function parsePlpParams(raw: RawParams): PlpParams {
  const out: PlpParams = {};
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_PLP_KEYS.has(key)) continue;
    const v = first(raw[key]);
    if (!v) continue;
    if (key === "page") out.page = onlyDigits(v);
    else if (key === "price_min") out.price_min = onlyDigits(v);
    else if (key === "price_max") out.price_max = onlyDigits(v);
    else if (key === "sort" && ["newest","price_asc","price_desc"].includes(v)) out.sort = v as any;
    else if (key === "condition" && ["new","like_new","good","fair"].includes(v)) out.condition = v as any;
    else if (key === "brand") out.brand = v;
    else if (key === "size") out.size = v;
  }
  return out;
}

export function parseSearchParams(raw: RawParams): SearchParams {
  const out: SearchParams = {};
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_SEARCH_KEYS.has(key)) continue;
    const v = first(raw[key]);
    if (!v) continue;
    if (key === "page") out.page = onlyDigits(v);
    else if (key === "sort" && ["relevance","newest","price_asc","price_desc"].includes(v)) out.sort = v as any;
    else if (key === "q") out.q = v.slice(0, 120);
  }
  return out;
}

// ---- canonical builder
export function buildCanonicalForCategory(slug: string, raw: RawParams) {
  const params = parsePlpParams(raw);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://losia.vn").replace(/\/$/, "");
  const url = new URL(`/c/${encodeURIComponent(slug)}`, origin);
  (Object.entries(params) as [keyof PlpParams, string | undefined][])
    .forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "");
}

export function buildCanonicalForSearch(raw: RawParams) {
  const params = parseSearchParams(raw);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://losia.vn").replace(/\/$/, "");
  const url = new URL("/search", origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.page) url.searchParams.set("page", params.page);
  return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "");
}

// ---- tags for revalidation
export function buildTagForCategory(slug: string, params: PlpParams) {
  const picks = [
    `list:category:${slug}`,
    params.brand && `brand:${params.brand}`,
    params.size && `size:${params.size}`,
    params.condition && `cond:${params.condition}`,
    params.price_min && `min:${params.price_min}`,
    params.price_max && `max:${params.price_max}`,
    params.sort && `sort:${params.sort}`,
    params.page && `p:${params.page}`,
  ].filter(Boolean);
  return `plp:${(picks as string[]).join("|")}`;
}

export function buildTagForSearch(params: SearchParams) {
  const picks = [
    `list:search`,
    params.q && `q:${params.q}`,
    params.sort && `sort:${params.sort}`,
    params.page && `p:${params.page}`,
  ].filter(Boolean);
  return `search:${(picks as string[]).join("|")}`;
}
