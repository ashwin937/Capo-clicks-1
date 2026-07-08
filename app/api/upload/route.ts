import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const BUCKET = "order-uploads";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`upload:${ip}`, 20, 60_000); // 20 uploads/min per IP
  if (!allowed) {
    return NextResponse.json({ error: "Too many upload attempts — please wait a moment and try again." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image storage isn't connected yet. Connect Supabase (see README) to accept real photo uploads — until then, orders are recorded with the file name only."
      },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `${file.name} is not a JPG or PNG image.` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `${file.name} is larger than 10MB.` }, { status: 400 });
    }
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage client could not be created" }, { status: 500 });
  }

  const urls: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const path = `orders/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false
    });

    if (error) {
      return NextResponse.json({ error: `Upload failed for ${file.name}: ${error.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(publicUrlData.publicUrl);
  }

  return NextResponse.json({ urls });
}
