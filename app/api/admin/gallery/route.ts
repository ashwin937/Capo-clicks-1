import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const BUCKET = "gallery";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ items: [], source: "fallback" });
  }
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase!.from("gallery_items").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data, source: "supabase" });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Connect Supabase first — gallery uploads need a database + storage bucket." },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") || "");
  const category = String(formData.get("category") || "");

  if (!file || !title || !category) {
    return NextResponse.json({ error: "file, title, and category are all required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG or PNG images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const arrayBuffer = await file.arrayBuffer();
  const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;

  const { error: uploadError } = await supabase!.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false
  });
  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = supabase!.storage.from(BUCKET).getPublicUrl(path);

  const { error: insertError } = await supabase!
    .from("gallery_items")
    .insert({ title, category, image_url: publicUrlData.publicUrl });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: publicUrlData.publicUrl });
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
  const { error } = await supabase!.from("gallery_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
