// src/components/product/ProductDetailSection/ItemDetailsSection.tsx
"use client";

import React, { useMemo } from "react";

type Maybe<T> = T | null | undefined;

type Props = {
  description?: Maybe<string>;
  details?: Maybe<string[]>;
  itemNumber?: Maybe<string>;
  material?: Maybe<string>;
  color?: Maybe<string>;
  style?: Maybe<string>;
  materialDetail?: Maybe<string>;
  colorDetail?: Maybe<string>;
  styleDetail?: Maybe<string>;
};

function normalize(input: any): string {
  if (input === 0) return "0";
  if (!input) return "";
  if (Array.isArray(input)) return input.map(normalize).filter(Boolean).join(", ");
  if (typeof input === "object") {
    const raw =
      input.name ??
      input.label ??
      input.value ??
      input.text ??
      input.title ??
      "";
    return String(raw).trim();
  }
  return String(input).trim();
}

function dedupe(arr: string[]) {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const key = x.replace(/\s+/g, " ").trim().toLowerCase();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tidy(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (/^[A-Za-zÀ-ỹ0-9].+[:：] /.test(t)) return t;
  if (/[.!?…]$/.test(t)) return t;
  return t;
}

export default function ItemDetailsSection(props: Props) {
  const {
    description,
    details,
    itemNumber,
    material,
    color,
    style,
    materialDetail,
    colorDetail,
    styleDetail,
  } = props;

  const m = normalize(material ?? materialDetail);
  const c = normalize(color ?? colorDetail);
  const s = normalize(style ?? styleDetail);
  const code = normalize(itemNumber);
  const descRow = tidy(normalize(description));

  const headerRows = useMemo(() => {
    const rows = [
      m && `Chất liệu: ${m}`,
      c && `Màu sắc: ${c}`,
      s && `Phong cách: ${s}`,
    ].filter(Boolean) as string[];
    return dedupe(rows).map(tidy);
  }, [m, c, s]);

  const detailRows = useMemo(() => {
    if (!details || !Array.isArray(details)) return [];
    const rows = details.map((d) => tidy(normalize(d))).filter(Boolean);
    return dedupe(rows);
  }, [details]);

  const list = useMemo(() => {
    const out = [...headerRows, ...detailRows];
    if (descRow) out.push(descRow);
    return dedupe(out);
  }, [headerRows, detailRows, descRow]);

  const hasHeader = headerRows.length > 0;
  const hasDetails = detailRows.length > 0;
  const hasDesc = Boolean(descRow);
  const hasCode = Boolean(code);
  const hasAny = hasHeader || hasDetails || hasDesc || hasCode;

  if (!hasAny) {
    return (
      <section className="border-t border-gray-100 pt-4">
        <h2 className="text-lg font-medium">Thông tin sản phẩm</h2>
        <p className="text-sm text-gray-600 mt-2">Chưa có thông tin chi tiết.</p>
      </section>
    );
  }

  return (
    <section className="border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Thông tin sản phẩm</h2>
        {hasCode ? <div className="ml-2 text-xs text-gray-500">#{code}</div> : null}
      </div>

      {/* ✅ Bỏ bullet bằng list-none */}
      <ul
        className="mt-3 list-none pl-0 space-y-1 text-sm text-gray-800"
        aria-label="Chi tiết sản phẩm"
      >
        {list.length > 0 ? (
          list.map((d, i) => <li key={`${i}-${d.slice(0, 32)}`}>{d}</li>)
        ) : hasCode ? (
          <li key="only-code">Mã hàng: {code}</li>
        ) : null}
      </ul>
    </section>
  );
}
