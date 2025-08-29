// src/components/product/ProductDetailSection/ConditionSection.tsx
"use client";

import React, { useId, useState, useRef } from "react";
import Modal from "@/components/common/Modal";
import OurStandards from "@/components/product/popups/OurStandards";

type Level = "excellent" | "very-good" | "good" | "rare-gem" | "new-with-tags";

export default function ConditionSection({
  condition,
  conditionDescription,
}: {
  condition?: Level | string | null;
  conditionDescription?: string | null;
}) {
  if (!condition || !conditionDescription) return null;

  const titleId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const level = getLevel(condition);
  const { badgeClass, textClass } = getBadgeStyle(level);

  return (
    <section className="border-t border-gray-100 pt-4" aria-labelledby={titleId} data-condition-level={level}>
      <div className="flex items-center mb-2">
        <h2 id={titleId} className="text-lg font-medium leading-none">
          Tình trạng
        </h2>
        <span
          className={`ml-2 rounded px-2 py-2 text-xs ${badgeClass} ${textClass}`}
          aria-label={`Condition: ${level}`}
        >
          {labelEn(level)}
        </span>
      </div>

      <p className="text-sm text-gray-700">{conditionDescription}</p>

      {/* Trigger mở popup tiêu chuẩn */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold mt-2 underline text-gray-700 hover:text-gray-900"
      >
        Tiêu chuẩn 
      </button>

<Modal
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        {/* ✅ Bỏ h3 & wrapper, render nội dung trực tiếp để tránh "hai lớp hộp" */}
        <OurStandards onClose={() => setOpen(false)} titleId={titleId} />
      </Modal>
    </section>
  );
}

/* Helpers giữ nguyên mapping 5 mức, badge & label */
function getLevel(raw: string): Level {
  const s = raw.trim().replace(/[_-]/g, " ").toLowerCase();
  if (["new with tags", "nwt", "brand new with tags", "bnwt"].includes(s)) return "new-with-tags";
  if (["like new", "excellent", "mint", "new"].includes(s)) return "excellent";
  if (["great", "very good", "vg"].includes(s)) return "very-good";
  if (["good", "g"].includes(s)) return "good";
  if (s.includes("rare") || s.includes("gem") || s.includes("hot") || s.includes("best seller") || s.includes("bán chạy") || s.includes("hiếm"))
    return "rare-gem";
  if (["fair", "acceptable", "flawed gem", "fair/good"].includes(s)) return "good";
  if (["excellent", "very-good", "good", "rare-gem", "new-with-tags"].includes(raw as any)) return raw as Level;
  return "very-good";
}

function getBadgeStyle(level: Level) {
  switch (level) {
    case "excellent":
      return { badgeClass: "bg-emerald-600", textClass: "text-white" };
    case "very-good":
      return { badgeClass: "bg-emerald-400", textClass: "text-emerald-800" };
    case "good":
      return { badgeClass: "bg-green-50", textClass: "text-green-700" };
    case "rare-gem":
      return { badgeClass: "bg-violet-100", textClass: "text-violet-800" };
    case "new-with-tags":
      return { badgeClass: "bg-sky-100", textClass: "text-sky-800" };
  }
}

function labelEn(level: Level) {
  switch (level) {
    case "excellent":
      return "EXCELLENT";
    case "very-good":
      return "VERY GOOD";
    case "good":
      return "GOOD";
    case "rare-gem":
      return "RARE GEM";
    case "new-with-tags":
      return "New with Tags";
  }
}
