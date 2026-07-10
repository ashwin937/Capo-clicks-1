"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { buildGalleryAlt } from "@/lib/seo";

type GalleryItem = { id?: string; title: string; category: string; image_url?: string };

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

function Tile({ item, hidden }: { item: GalleryItem; hidden?: boolean }) {
  const alt = buildGalleryAlt(item.title, item.category);
  const inner = (
    <div
      aria-hidden={hidden || undefined}
      className="photo-curved w-[220px] md:w-[240px] aspect-[3/4] border border-line flex items-end p-3.5 bg-gradient-to-br from-panel2 to-black relative flex-shrink-0 mr-3"
    >
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={hidden ? "" : alt}
          fill
          sizes="240px"
          className="object-cover"
        />
      )}
      <span className="font-mono text-[11px] tracking-wide text-goldLight uppercase relative z-10 bg-black/40 px-1.5 py-0.5 rounded-sm">
        {item.category}
      </span>
    </div>
  );

  // Only real Supabase items (with an id) get a real, crawlable detail page.
  if (item.id && !hidden) {
    return (
      <Link href={`/gallery/${item.id}`} aria-label={alt} className="block flex-shrink-0">
        {inner}
      </Link>
    );
  }
  return inner;
}

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
        <div className="marquee-outer" style={{ ["--marquee-duration" as any]: "34s" }}>
          <div className="marquee-track">
            {items.map((item, i) => (
              <Tile key={(item.id || item.image_url || item.title) + i} item={item} />
            ))}
            {/* Duplicate set purely for the seamless scroll loop — hidden from
                screen readers and search engines so the real content isn't
                indexed/announced twice. */}
            {items.map((item, i) => (
              <Tile key={"dup-" + (item.id || item.image_url || item.title) + i} item={item} hidden />
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-10">
        <Link href="/gallery" className="btn btn-outline">View Full Gallery</Link>
      </div>
    </section>
  );
}
