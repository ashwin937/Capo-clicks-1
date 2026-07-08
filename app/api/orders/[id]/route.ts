import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const phone = req.nextUrl.searchParams.get("phone");

  if (!isSupabaseConfigured()) {
    // Demo fallback so tracking still shows something meaningful before
    // Supabase is connected.
    return NextResponse.json({
      order_code: id,
      status: "in_production",
      payment_status: "paid",
      created_at: new Date().toISOString(),
      estimated_completion_date: null,
      demo: true
    });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  let query = supabase.from("orders").select("*").eq("order_code", id);
  if (phone) query = query.eq("customer_phone", phone);

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found. Check your Order ID and phone number." }, { status: 404 });
  }

  return NextResponse.json(data);
}
