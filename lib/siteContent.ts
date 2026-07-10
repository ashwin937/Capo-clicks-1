import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// Site content (homepage offer banner + footer tagline strip) is stored as a
// single JSON file in Supabase Storage — NOT a database table. This is
// intentional: it keeps supabase/schema.sql untouched while still giving the
// admin a live-editable, persisted place to manage this copy.

export type SiteContent = {
  offer: {
    enabled: boolean;
    label: string;
    text: string;
  };
  taglines: string[];
};

export const defaultSiteContent: SiteContent = {
  offer: {
    enabled: true,
    label: "Limited Time",
    text: "Flat 15% off all collage frame orders this month"
  },
  taglines: [
    "Every Frame Tells a Story",
    "Coimbatore's Trusted Studio",
    "Moments Deserve a Frame"
  ]
};

const BUCKET = "site-content";
const FILE_PATH = "content.json";

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return defaultSiteContent;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return defaultSiteContent;

  const { data, error } = await supabase.storage.from(BUCKET).download(FILE_PATH);
  if (error || !data) return defaultSiteContent;

  try {
    const text = await data.text();
    const parsed = JSON.parse(text);
    return {
      offer: { ...defaultSiteContent.offer, ...parsed.offer },
      taglines: Array.isArray(parsed.taglines) && parsed.taglines.length > 0 ? parsed.taglines : defaultSiteContent.taglines
    };
  } catch {
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase isn't connected." };
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { ok: false, error: "Supabase isn't connected." };

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const { error } = await supabase.storage.from(BUCKET).upload(FILE_PATH, blob, {
    contentType: "application/json",
    upsert: true
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
