import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { frameSizes as fallbackFrameSizes } from "@/lib/data";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ items: fallbackFrameSizes, source: "fallback" });
  }
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase!
    .from("frame_sizes")
    .select("*")
    .order("price", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({
      items: fallbackFrameSizes,
      source: "fallback",
      note: "The frame_sizes table is empty — showing built-in defaults. Run the seed inserts in supabase/schema.sql to populate real rows you can edit."
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
  const { id, label, price, is_active } = body;
  if (!id || !label || typeof price !== "number") {
    return NextResponse.json({ error: "id, label, and numeric price are required" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase!
    .from("frame_sizes")
    .upsert({ id, label, price, is_active: is_active ?? true });

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
  const { error } = await supabase!.from("frame_sizes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
