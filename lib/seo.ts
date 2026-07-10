// Shared SEO helpers for gallery content. Kept in one place so alt text and
// per-image metadata stay consistent between the homepage strip, the full
// gallery, the admin preview, and individual image pages.

const CATEGORY_KEYWORDS: Record<string, string> = {
  Wedding: "wedding photography",
  "Birthday & Events": "birthday and event photography",
  Outdoor: "outdoor portrait photography",
  "Baby Shoots": "baby photoshoot",
  "Framed Art": "custom framed photo art",
  "Custom Collage Frames": "custom photo collage frame"
};

/**
 * Builds descriptive, keyword-rich alt text from the fields we actually have
 * (title + category) — no new database columns needed. Format:
 * "<title> — <category keyword phrase> by Capo Clicks Photography, Coimbatore"
 */
export function buildGalleryAlt(title: string, category: string): string {
  const keyword = CATEGORY_KEYWORDS[category] || category.toLowerCase();
  const cleanTitle = title?.trim();
  const base = cleanTitle ? `${cleanTitle} — ${keyword}` : keyword;
  return `${capitalize(base)} by Capo Clicks Photography, Coimbatore`;
}

/**
 * Longer description for individual gallery item pages (meta description +
 * JSON-LD ImageObject description).
 */
export function buildGalleryDescription(title: string, category: string): string {
  const keyword = CATEGORY_KEYWORDS[category] || category.toLowerCase();
  const cleanTitle = title?.trim();
  return `${cleanTitle ? cleanTitle + " — " : ""}${capitalize(
    keyword
  )} captured by Capo Clicks Photography, a photo studio and custom framing service based in Coimbatore, Tamil Nadu.`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
