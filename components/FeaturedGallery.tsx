"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const PREVIEW_COUNT = 8;

export default function FeaturedGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setItems(data.items.slice(0, PREVIEW_COUNT));
        } else {
          setItems(placeholderItems.slice(0, PREVIEW_COUNT));
        }
      })
      .catch(() => {
        setItems(placeholderItems.slice(0, PREVIEW_COUNT));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-11">
        <div className="eyebrow mb-2">Portfolio</div>
        <h2 className="font-display text-3xl">Recent Work</h2>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div
              key={item.image_url || item.title + i}
              className="aspect-[3/4] border border-line flex items-end p-3.5 bg-gradient-to-br from-panel2 to-black overflow-hidden relative"
            >
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
              <span className="font-mono text-[11px] tracking-wide text-goldLight uppercase relative z-10 bg-black/40 px-1.5 py-0.5 rounded-sm">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Link href="/gallery" className="btn btn-outline">View Full Gallery</Link>
      </div>
    </section>
  );
}
