"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/siteContent";

export default function OfferBanner() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => setContent(data.content))
      .catch(() => setContent(null));
  }, []);

  if (!content || !content.offer.enabled || !content.offer.text) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-14 pb-2">
      <div className="relative text-center border border-gold px-8 py-5 bg-gradient-to-b from-[rgba(201,162,39,0.08)] to-transparent">
        <div className="eyebrow mb-2 !text-[10px]">{content.offer.label}</div>
        <p className="text-goldLight text-base md:text-lg">{content.offer.text}</p>
      </div>
    </div>
  );
}
