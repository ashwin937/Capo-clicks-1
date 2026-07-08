import { NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ items: [], configured: false });
  }
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase!.from("gallery_items").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ items: [], configured: true, error: error.message });
  return NextResponse.json({ items: data || [], configured: true });
}
