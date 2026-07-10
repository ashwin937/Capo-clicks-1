"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/siteContent";

export default function TaglineMarquee() {
  const [taglines, setTaglines] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        const content: SiteContent | undefined = data.content;
        if (content?.taglines?.length) setTaglines(content.taglines);
      })
      .catch(() => {});
  }, []);

  if (taglines.length === 0) return null;

  return (
    <div
      className="marquee-outer border-y border-line py-5 bg-gradient-to-b from-transparent via-[rgba(201,162,39,0.05)] to-transparent"
      style={{ ["--marquee-duration" as any]: "26s" }}
    >
      <div className="marquee-track">
        {taglines.map((line, i) => (
          <span key={line + i} className="flex items-center whitespace-nowrap">
            <span className="font-display text-sm md:text-base text-goldLight px-8">{line}</span>
            <span className="text-gold text-xs">&#10022;</span>
          </span>
        ))}
        {/* Duplicate set purely for the seamless scroll loop — hidden from
            screen readers and search engines so the real text isn't
            indexed/announced twice. */}
        <div aria-hidden="true" className="flex">
          {taglines.map((line, i) => (
            <span key={"dup-" + line + i} className="flex items-center whitespace-nowrap">
              <span className="font-display text-sm md:text-base text-goldLight px-8">{line}</span>
              <span className="text-gold text-xs">&#10022;</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
