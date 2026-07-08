import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { packages as fallbackPackages } from "@/lib/data";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ items: fallbackPackages, source: "fallback" });
  }
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase!.from("packages").select("*").order("price", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({
      items: fallbackPackages,
      source: "fallback",
      note: "The packages table is empty — showing built-in defaults. Run the seed inserts in supabase/schema.sql to populate real rows you can edit."
    });
  }
  return NextResponse.json({ items: data, source: "supabase" });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Connect Supabase first — edits can't be saved without a database." },
      { status: 501 }
    );
  }

  const body = await req.json();
  const { id, name, price, badge, includes, is_active } = body;
  if (!id || !name || typeof price !== "number" || !Array.isArray(includes)) {
    return NextResponse.json({ error: "id, name, numeric price, and includes[] are required" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase!
    .from("packages")
    .upsert({ id, name, price, badge: badge || null, includes, is_active: is_active ?? true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Connect Supabase first" }, { status: 501 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase!.from("packages").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
