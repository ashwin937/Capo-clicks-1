import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { buildGalleryAlt, buildGalleryDescription } from "@/lib/seo";

type GalleryItem = { id: string; title: string; category: string; image_url: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getItem(id: string): Promise<GalleryItem | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("gallery_items").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as GalleryItem;
}

async function getRelated(category: string, excludeId: string): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(4);
  return (data as GalleryItem[]) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    return { title: "Photo Not Found" };
  }
  const title = buildGalleryAlt(item.title, item.category);
  const description = buildGalleryDescription(item.title, item.category);
  return {
    title,
    description,
    alternates: { canonical: `/gallery/${item.id}` },
    openGraph: {
      title,
      description,
      url: `/gallery/${item.id}`,
      type: "article",
      images: [{ url: item.image_url }]
    },
    twitter: {
      card: "summary_large_image",
      images: [item.image_url]
    }
  };
}

function ImageJsonLd({ item }: { item: GalleryItem }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: item.image_url,
    name: buildGalleryAlt(item.title, item.category),
    description: buildGalleryDescription(item.title, item.category),
    creator: { "@type": "Organization", name: "Capo Clicks Photography" },
    contentLocation: {
      "@type": "Place",
      name: "Coimbatore, Tamil Nadu, India"
    },
    url: `${siteUrl}/gallery/${item.id}`
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default async function GalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const related = await getRelated(item.category, item.id);
  const alt = buildGalleryAlt(item.title, item.category);
  const description = buildGalleryDescription(item.title, item.category);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <ImageJsonLd item={item} />

      <div className="text-sm mb-8">
        <Link href="/gallery" className="text-muted hover:text-goldLight">&larr; Back to Gallery</Link>
      </div>

      <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-start">
        <div className="photo-curved relative aspect-[3/4] border border-line bg-panel overflow-hidden">
          <Image
            src={item.image_url}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <div className="eyebrow mb-3">{item.category}</div>
          <h1 className="font-display text-2xl md:text-3xl text-goldLight mb-4 leading-snug">{item.title}</h1>
          <p className="text-sm text-muted leading-relaxed mb-8">{description}</p>

          <div className="flex gap-4 flex-wrap">
            <Link href="/booking" className="btn-signature">
              Book a Shoot
              <svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2,8 C40,2 70,12 100,6 C130,1 160,10 198,5" />
              </svg>
            </Link>
            <Link href="/frames" className="btn-underline">Order a Frame</Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-xl text-goldLight mb-6">More {item.category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/gallery/${r.id}`} className="block" aria-label={buildGalleryAlt(r.title, r.category)}>
                <div className="photo-curved aspect-[3/4] border border-line relative bg-panel">
                  <Image
                    src={r.image_url}
                    alt={buildGalleryAlt(r.title, r.category)}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
