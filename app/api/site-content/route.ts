import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, saveSiteContent, defaultSiteContent } from "@/lib/siteContent";
import { isAdminAuthenticated } from "@/lib/adminAuth";

// Public read — the homepage offer banner and footer tagline strip both call
// this to get live content. No auth required to GET.
export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

// Admin-only write — same signed-cookie session used by every other
// /api/admin/* route. Nothing here touches supabase/schema.sql; this writes
// a JSON file to Supabase Storage instead of a table.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.offer || !Array.isArray(body.taglines)) {
    return NextResponse.json({ error: "Expected { offer, taglines }" }, { status: 400 });
  }

  const content = {
    offer: {
      enabled: Boolean(body.offer.enabled),
      label: String(body.offer.label ?? defaultSiteContent.offer.label),
      text: String(body.offer.text ?? defaultSiteContent.offer.text)
    },
    taglines: body.taglines.map((t: unknown) => String(t)).filter((t: string) => t.trim().length > 0)
  };

  const result = await saveSiteContent(content);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Save failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, content });
}
