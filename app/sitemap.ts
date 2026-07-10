import type { MetadataRoute } from "next";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getGalleryIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];
  const { data } = await supabase.from("gallery_items").select("id").order("created_at", { ascending: false });
  return (data || []).map((row: { id: string }) => row.id);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/about", "/services", "/frames", "/collage-frames", "/gallery", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));

  // Individual gallery photo pages — these are what actually show up in
  // Google Image Search results, so they belong in the sitemap too.
  const galleryIds = await getGalleryIds();
  const galleryEntries: MetadataRoute.Sitemap = galleryIds.map((id) => ({
    url: `${siteUrl}/gallery/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...staticEntries, ...galleryEntries];
}
