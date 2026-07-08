"use client";

import { useEffect, useState } from "react";
import { galleryCategories } from "@/lib/data";

type GalleryItem = { title: string; category: string; image_url?: string };

const placeholderItems: GalleryItem[] = [
  { title: "Wedding — Priya & Arjun", category: "Wedding" },
  { title: "Family portrait", category: "Outdoor" },
  { title: "Baby shoot", category: "Baby Shoots" },
  { title: "Framed wall art", category: "Framed Art" },
  { title: "Birthday celebration", category: "Birthday & Events" },
  { title: "Delhi trip — collage frame", category: "Custom Collage Frames" },
  { title: "Wedding collage — Akilan & Anushree", category: "Custom Collage Frames" },
  { title: "Reception coverage", category: "Wedding" }
];

export default function GalleryPage() {
  const [filter, setFilter] = useState<string>("All");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [usingPlaceholders, setUsingPlaceholders] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          setUsingPlaceholders(false);
        } else {
          setItems(placeholderItems);
          setUsingPlaceholders(true);
        }
      })
      .catch(() => {
        setItems(placeholderItems);
        setUsingPlaceholders(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="eyebrow mb-2">Portfolio</div>
        <h1 className="font-display text-3xl md:text-4xl">Recent Work</h1>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {["All", ...galleryCategories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs uppercase tracking-wide px-4 py-2 rounded-full border ${
              filter === cat ? "bg-gold text-black border-gold" : "border-line text-muted hover:border-gold"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((item, i) => (
            <div
              key={item.image_url || item.title + i}
              className="aspect-[3/4] border border-line flex items-end p-3.5 bg-gradient-to-br from-panel2 to-black overflow-hidden relative"
            >
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
              <span className="font-mono text-[11px] tracking-wide text-goldLight uppercase relative z-10 bg-black/40 px-1.5 py-0.5 rounded-sm">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {usingPlaceholders && (
        <p className="text-center text-xs text-muted mt-8">
          Showing placeholder tiles — upload real photos from <code>/admin</code> to replace these.
        </p>
      )}
    </div>
  );
}
